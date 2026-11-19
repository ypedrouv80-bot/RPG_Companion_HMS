// Entire production backend loaded in a mock Spindle host. No network/model calls.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'dist/backend.js'),'utf8');
const db=new Map(),chats=new Map(),macros=new Map(),events=new Map(),sent=[],writes=[],calls=[];let interceptor,frontend,processor;
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const spindle={
 log:{info(){},warn(){},error(){}},
 storage:{async getJson(k){return clone(db.get(k))??null;},async setJson(k,v){db.set(k,clone(v));}},
 permissions:{onChanged(){},onDenied(){}},
 chat:{async getMessages(id){return clone(chats.get(id)||[]);},async updateMessage(id,mid,p){writes.push({id,mid,p});},async appendMessage(){throw Error('Unexpected append');},async get(){return null;}},
 connections:{async list(){return [];}},generate:{async quiet(){calls.push('quiet');throw Error('Unexpected AI call');}},
 registerMacro(d){macros.set(d.name,d.handler);},registerInterceptor(fn){interceptor=fn;},registerWorldInfoInterceptor(){},registerMessageContentProcessor(fn){processor=fn;},
 on(e,fn){events.set(e,fn);},onFrontendMessage(fn){frontend=fn;},sendToFrontend(x){sent.push(x);},sendMessage(x){sent.push(x);},
};
const ctx=vm.createContext({spindle,console,URL,TextEncoder,TextDecoder,AbortController,structuredClone,Buffer,
 setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){}});
vm.runInContext(source,ctx,{timeout:15000});
const run=s=>vm.runInContext(s,ctx,{timeout:15000});
function call(name,...args){ctx.__args=args;return run(name+'(...__args)');}
let checks=0;function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
const hud=(arc='[MT-ARC:7] — Northern Adventurer',extra='')=>'### WORLD STATE [PANEL] ###\nArmored Dragon Calendar: K420, Rainveil (approx.) | Time: Morning\nSeason: Spring\nLocation: Rosenburg, Basherant\nCurrent Arc: '+arc+'\nCondition: Stable\n'+extra+'\n***\nThe clerk waits.';
const msg=(id,role,content,more={})=>({id,role,content,...more});
const start=msg('start','user','Mushoku_Start_Handler\nStart at Arc 7 (Premade)\nRudeus Mode: NPC');

async function main(){
 await new Promise(r=>setImmediate(r));
 const full=fs.readFileSync(path.join(__dirname,'fixtures/full-panel-sections.txt'),'utf8');
 const sectioned=fs.readFileSync(path.join(__dirname,'fixtures/sectioned-salon.txt'),'utf8');
 const parsedSectioned=call('parseHud',sectioned);
 check('internal dividers plus headings',()=>assert.equal(call('parseHud',sectioned.replace(/\n\n/g,'\n---\n')).lines.length,40));
 check('blank within bonds',()=>assert.equal(call('parseHud',sectioned.replace('Fitts —','\nFitts —')).lines.length,40));
 check('all sectioned rows',()=>assert.equal(parsedSectioned.lines.length,40));
 check('complete raw HUD removal',()=>assert.equal(call('persistentParse',sectioned).raw,sectioned.slice(0,sectioned.indexOf('***')+3).trim()));
 check('eight magic schools',()=>assert.equal(call('spellStanding',call('hmsReadSystems',parsedSectioned)._lines).schools.size,8));
 const fixtures=[sectioned,full, '### WORLD STATE ###\n◆ North → Guild\nMagic School: Earth: Imperial, Healing: Advanced\nSword Style: North God (Advanced), Water God (Emperor)\n***', '### WORLD STATE [PANEL]\n📍 Location: Guild\n🔮 Magic Tiers: 🪨 Earth — Imperial · 💚 Healing — Advanced\n⚔️ Sword Styles: North God — Advanced · Water God — Emperor\n***'];
 run("loreQueueCatalog=()=>{}; spellCatalog=()=>[{name:'Earth Test',key:'earth test',school:'Earth',ladder:'mt',rank:'Advanced',step:2,kind:'ranked',needs:[]}];techCatalog=()=>[{name:'North Test',key:'north test',style:'North God',rank:'Advanced',step:2,kind:'ranked'}]");
 for(const [i,text] of fixtures.entries()){
   const chat=[msg('f'+i,'assistant',text)],parsed=call('parseHud',text),sys=call('hmsReadSystems',parsed);
   check('location '+i,()=>assert(parsed.location?.length));
   check('magic ranks '+i,()=>assert.equal(call('spellStanding',sys._lines).schools.get('earth').step,5));
   check('combat ranks '+i,()=>assert.equal(call('techStanding',sys._lines).get('north god').step,2));
   const magic=call('hmsMagicPanel',chat,{},null,sys,'fixture'+i),tech=call('techListPanel','fixture'+i,chat,{},sys);
   check('magic card ranks '+i,()=>assert(magic.list.mine.length>=2));
   check('combat card ranks '+i,()=>assert(tech.mine.length>=2));
   check('magic usable '+i,()=>assert.equal(magic.list.schools[0].spells[0].status,'reach'));
   check('combat usable '+i,()=>assert.equal(tech.schools[0].spells[0].status,'reach'));
 }
 run("settings.companionPolicy='active'");
 const message=msg('chapter-source','assistant',full),chat=[message];chats.set('chapters-fixture',chat);
 await call('safeReadReply','chapters-fixture',chat,message);
 let st=await call('getChatState','chapters-fixture');
 check('open chapter from HUD',()=>assert.equal(st.chapters.list.length,1));
 check('source preserved',()=>assert.equal(st.chapters.list[0].fromId,message.id));
 await call('safeReadReply','chapters-fixture',chat,message);st=await call('getChatState','chapters-fixture');
 check('reread no duplicates',()=>assert.equal(st.chapters.list.length,1));
 check('no automatic AI calls',()=>assert.equal(calls.length,0));

 const L=require('../compatibility/state-ledger.js');
 const first=msg('baseline','assistant',sectioned), initial=L.fold([first],L.readHud);
 check('baseline rows',()=>assert.equal(initial.state.rows.length,40));
 const bond=initial.state.rows.find(r=>r.text.startsWith('Fitts —'));
 const packet={base:initial.state.revision,set:[{id:bond.id,text:'Fitts — trusted friend'}],remove:[]};
 const delta=msg('delta','assistant','<RPGC_UPDATE>'+JSON.stringify(packet)+'</RPGC_UPDATE>\nShe waits.');
 const folded=L.fold([first,delta],L.readHud);
 check('one bond changes only',()=>assert.equal(folded.state.rows.filter((r,i)=>r.text!==initial.state.rows[i].text).length,1));
 check('render keeps prose',()=>assert.equal(L.hide(delta.content,L.readHud),'She waits.'));
 check('render full keeps prose',()=>assert.equal(L.hide(sectioned,L.readHud),'The east wing door opens before you knock.'));
 check('unchanged state persists',()=>assert.equal(L.fold([first,delta,msg('none','assistant','She smiles.')],L.readHud).state.revision,folded.state.revision));
 check('wrong base rejected',()=>assert(L.apply(initial.state,{data:{...packet,base:'bad'}}).error));
 check('unknown field rejected',()=>assert(L.apply(initial.state,{data:{...packet,set:[{id:'unknown',text:'x'}]}}).error));
 check('explicit deletion',()=>assert.equal(L.apply(initial.state,{data:{...packet,set:[],remove:[bond.id]}}).rows.length,39));
 check('duplicate rejected',()=>assert(L.apply(initial.state,{data:{...packet,set:[packet.set[0],packet.set[0]]}}).error));
 check('new campaign isolated',()=>assert.equal(L.fold([first,start],L.readHud).state,null));
 check('old base after edit rejected',()=>assert(L.fold([msg('baseline','assistant',sectioned.replace('Road-tired','Rested')),delta],L.readHud).needsFull));
 check('full resync clears errors',()=>assert.equal(L.fold([delta,first],L.readHud).needsFull,false));
 check('fenced update ignored',()=>assert.equal(L.packets('~~~json\n'+delta.content+'\n~~~').length,0));
 check('quoted update ignored',()=>assert.equal(L.packets('> '+delta.content).length,0));
 check('fenced HUD ignored',()=>assert.equal(L.readHud('~~~\n'+sectioned+'\n~~~'),null));
 check('CRLF full HUD',()=>assert.equal(L.readHud(sectioned.replace(/\n/g,'\r\n')).rows.length,40));
 run('settings.persistentHud=true');
 const replay=[first,delta,msg('next','user','I wait.')];
 check('active request has current state',()=>assert(call('safeRequestParts',replay,'normal').join('\n').includes('trusted friend')));
 run('settings.companionPolicy="observer"');
 check('observer adds no prompt',()=>assert.equal(call('safeRequestParts',replay,'normal').length,0));
 run('settings.companionPolicy="active"');
 chats.set('persist-fixture',replay);await call('safeReadReply','persist-fixture',replay,delta);
 const saved=await call('getChatState','persist-fixture');
 check('checkpoint persisted',()=>assert.equal(saved.persistentHud.revision,folded.state.revision));
 check('no automatic generation',()=>assert.equal(calls.length,0));
 console.log('Persistent/sectioned HUD: '+checks+' checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
