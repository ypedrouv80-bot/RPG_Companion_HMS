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
 const fixtures=[full, '### WORLD STATE ###\n◆ North → Guild\nMagic School: Earth: Imperial, Healing: Advanced\nSword Style: North God (Advanced), Water God (Emperor)\n***', '### WORLD STATE [PANEL]\n📍 Location: Guild\n🔮 Magic Tiers: 🪨 Earth — Imperial · 💚 Healing — Advanced\n⚔️ Sword Styles: North God — Advanced · Water God — Emperor\n***'];
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
 const swipeText=fs.readFileSync(path.join(__dirname,'fixtures/swipe-rank-prefix.txt'),'utf8');
 const swipeHud=call('parseHud',swipeText),swipeLines=call('worldLines',swipeHud),swipeWorld=call('worldMushoku','swipe-ranks',swipeLines,{},[]);
 const swipeStanding=call('spellStanding',swipeLines);
 check('ordinal date',()=>assert.equal(swipeWorld.day,12));
 check('reported year not canon rewritten',()=>assert.equal(swipeWorld.year,420));
 check('grouped schools exactly six',()=>assert.equal(swipeWorld.magic.length,6));
 for(const school of ['water','earth','wind','fire']){
   check('world prefix '+school,()=>assert.equal(swipeWorld.magic.find(x=>x.name.toLowerCase()===school)?.step,0));
   check('spell standing prefix '+school,()=>assert.equal(swipeStanding.schools.get(school)?.step,0));
 }
 for(const school of ['healing','detoxification'])check('split grouped '+school,()=>assert.equal(swipeWorld.magic.find(x=>x.name.toLowerCase()===school)?.step,1));
 check('aptitude not mastery',()=>assert(swipeWorld.magic.every(x=>x.step<=1)));
 check('note preserved',()=>assert(swipeWorld.magic.find(x=>x.name==='Healing').rank.includes('self-taught')));
 check('source row immutable',()=>assert.equal(swipeText,fs.readFileSync(path.join(__dirname,'fixtures/swipe-rank-prefix.txt'),'utf8')));
 check('potential prefix no learned skill',()=>assert.equal(call('mtRankRows','Advanced Fire (potential only)', ['Elementary','Intermediate','Advanced']).length,0));
 for(const [calendar,year,arc] of [['K418, 5th month, mid-Seedtide — early spring',418,'8'],['K422, spring (approx.)',422,'4-B'],['Unspecified',null,'8']]){
   const raw='### WORLD STATE [PANEL] ###\nArmored Dragon Calendar: '+calendar+' | Time: late morning\nLocation: Sharia\nCurrent Arc: [MT-ARC:'+arc+']\n***';
   const parsed=call('parseHud',raw),lines=call('worldLines',parsed),world=call('worldMushoku','partial-date',lines,{},[]);
   check('partial campaign year '+calendar,()=>assert.equal(world.year,year));
   check('partial saga year '+calendar,()=>assert.equal(world.saga.year,year));
   check('no fake day '+calendar,()=>assert.equal(world.day,null));
   check('no fake next date '+calendar,()=>assert.equal(world.saga.next,null));
 }
 const message=msg('chapter-source','assistant',full),chat=[message];chats.set('chapters-fixture',chat);
 await call('safeReadReply','chapters-fixture',chat,message);
 let st=await call('getChatState','chapters-fixture');
 check('open chapter from HUD',()=>assert.equal(st.chapters.list.length,1));
 check('source preserved',()=>assert.equal(st.chapters.list[0].fromId,message.id));
 await call('safeReadReply','chapters-fixture',chat,message);st=await call('getChatState','chapters-fixture');
 check('reread no duplicates',()=>assert.equal(st.chapters.list.length,1));
 check('no automatic AI calls',()=>assert.equal(calls.length,0));
 console.log('HUD consumers: '+checks+' checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
