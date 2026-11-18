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
 await new Promise(resolve=>setImmediate(resolve));
 // Capture payloads without depending on host transport wrappers.
 ctx.__sent=sent;run('toFrontend = value => __sent.push(value)');
 check('default observer',()=>assert.equal(run('settings.companionPolicy'),'observer'));
 const fullPanel=fs.readFileSync(path.join(__dirname,'fixtures/full-panel-sections.txt'),'utf8').replaceAll('\r\n','\n');
 const expected=fullPanel.split('\n').filter(x=>/^\*\*[^*]/.test(x));
 for(const ending of ['\n','\r\n']) {
     const input=fullPanel.replaceAll('\n',ending)+ending+'The tutor enters.';
     const parsed=call('parseHud',input);
     check('full panel all rows '+JSON.stringify(ending),()=>assert.equal(parsed.lines.length,expected.length));
     for(const row of expected)check('retained full row '+row.split(':')[0]+ending.length,()=>assert(parsed.lines.some(x=>x.text===row)));
     check('both eyes retained '+ending.length,()=>assert.equal(parsed.lines.filter(x=>x.key.startsWith('demon eye')).length,2));
     check('stops at actual star wall '+ending.length,()=>assert.equal(input.slice(parsed.find.bodyEnd).trimStart().startsWith('***'),true));
     check('no prose captured '+ending.length,()=>assert.equal(parsed.lines.some(x=>x.text.includes('tutor enters')),false));
 }
 check('legacy dashed final wall still ends',()=>assert.equal(call('parseHud','### WORLD STATE ###\nLocation: Road\n---\nThe guard waits.\n***').lines.length,1));
 check('missing star does not absorb prose',()=>assert.equal(call('parseHud','### WORLD STATE ###\nLocation: Road\n---\nThe guard waits.').lines.length,1));
 check('migration existing settings',()=>{const x=call('migrateSettings',{settingsVersion:9,hmsMode:'off',hmsCompanion:true});assert.equal(x.companionPolicy,'observer');assert.equal(x.activePanelRequest,false);assert.equal(x.hmsMode,'off');});
 const old=msg('old','assistant',hud('[MT-ARC:8]','Inventory: old gold'));
 chats.set('A',[old,start]);db.set('chats/A.json',{v:2,seed:{infoBox:{location:{value:'Sharia, K416'}}}});
 const prompt=[{role:'system',content:'card + lorebook'},{role:'user',content:start.content}];
 const serialized=JSON.stringify(prompt);
 check('observer interceptor identity',()=>{});assert.equal(await interceptor(prompt,{chatId:'A'}),prompt);
 check('observer no prompt mutation',()=>assert.equal(JSON.stringify(prompt),serialized));
 for(const name of ['rpgc_request','rpgc_minds','rpgc_chronicle','rpgc_on','rpgc_marks','rpgc_emoji','rpgc_fight'])check('macro '+name,()=>{}),assert.equal(await macros.get(name)({chatId:'A',env:{}}),'');
 await call('safePushState','A');check('start has no old snapshot',()=>assert.equal(sent.at(-1).observer.snapshot,null));
 const sid=call('safeStorageId','A');check('new state namespace',()=>assert.notEqual(sid,'A'));
 const st=await call('getChatState','A');check('new campaign has no old seed',()=>assert.equal(st.seed,null));
 check('old storage preserved',()=>assert.equal(db.get('chats/A.json').seed.infoBox.location.value,'Sharia, K416'));
 const a=msg('a','assistant',hud());chats.set('A',[old,start,a]);
 await events.get('GENERATION_ENDED')({chatId:'A',messageId:'a'},'u');
 check('observer reads real reply',()=>assert.equal(sent.at(-1).observer.snapshot.messageId,'a'));
 check('observer preserves approximate time',()=>assert.match(sent.at(-1).observer.snapshot.rows[0].text,/approx/));
 check('observer no inferred health/mana',()=>assert.equal(sent.at(-1).observer.snapshot.rows.some(x=>/Health: 100|Mana/.test(x.text)),false));
 check('observer no message writes',()=>assert.equal(writes.length,0));check('observer no AI',()=>assert.equal(calls.length,0));
 const before=JSON.stringify(chats.get('A'));await processor({origin:'render',isUser:false,content:a.content,chatId:'A'});
 check('renderer keeps source',()=>assert.equal(JSON.stringify(chats.get('A')),before));
 await frontend({type:'observer_ignore',chatId:'A'},'u');check('ignored source unavailable',()=>assert.equal(sent.at(-1).observer.snapshot,null));
 a.content=hud('[MT-ARC:7] — Northern Adventurer','Inventory: 0 coins');chats.set('A',[old,start,a]);await call('safePushState','A');
 check('edited source readable again',()=>assert.equal(sent.at(-1).observer.snapshot.messageId,'a'));
 check('zero kept',()=>assert(sent.at(-1).observer.snapshot.rows.some(x=>x.text==='Inventory: 0 coins')));
 const b=msg('b','assistant',hud('[MT-ARC:Sandbox] · Northern Adventurer (Memory 6)'));chats.set('A',[old,start,a,b]);await call('safePushState','A');
 check('screenshot conflict reported',()=>assert.match(sent.at(-1).observer.snapshot.warnings[0],/Sandbox|SANDBOX/));
 check('screenshot not silently repaired',()=>assert.match(sent.at(-1).observer.snapshot.arc,/Sandbox/));
 const localized='📖 Arco 2 — Home Tutor [Memory 1]';
 for (const label of ['Current Arc','Arco','Arco Atual']) {
     const input=hud(localized).replace('Current Arc:',label+':'),parsed=call('parseHud',input),report=call('arcCheck','A',parsed);
     check('photo label recognized '+label,()=>assert.equal(report.arcId,'2'));
     check('photo no false missing warning '+label,()=>assert.equal(report.ok,true));
     check('photo source preserved '+label,()=>assert.equal(parsed.arc,localized));
     check('photo cannot prove activation '+label,()=>assert.equal(report.activation,'unverified'));
 }
 check('memory not arc',()=>assert.equal(call('readArcIdentity','[Memory 1]'),null));
 check('Portuguese branch',()=>assert.equal(call('readArcIdentity','📖 Arco 3-B — The Silent Road').id,'3-B'));
 check('mixed label saga does not use year fallback',()=>assert.equal(call('mtSaga','A',410,localized,null).current,2));
 check('old false claim removed from active UI',()=>assert.equal(fs.readFileSync(path.join(root,'dist/frontend.js'),'utf8').includes('`The Arc line "${ac.arc}" loads no arc entry'),false));
 check('specific title does not match shorter title',()=>assert.equal(call('safeArcDiagnostic',call('parseHud',hud('[MT-ARC:9] University Bonds'))),null));
 check('sandbox no date fallback',()=>assert.equal(call('mtSaga','A',421,'[MT-ARC:Sandbox] · Northern Adventurer',null).current,null));
 check('numeric code with title',()=>assert.equal(call('mtSaga','A',416,'[MT-ARC:7] · Northern Adventurer',null).current,7));
 check('unknown year no invented next date',()=>assert.equal(call('mtSaga','A',null,'[MT-ARC:7]',null).next,null));
 for(const code of ['7','3-B','Sandbox'])check('arc marker '+code,()=>assert(call('parseHud',hud('[MT-ARC:'+code+']'))));
 check('quoted start not reset',()=>assert.equal(call('safeIsStart',msg('q','user','Example:\nMushoku_Start_Handler')),false));
 check('fenced start not reset',()=>assert.equal(call('safeIsStart',msg('q','user','```\nMushoku_Start_Handler\n```')),false));
 const saved=msg('save','user','Mushoku_Continue_Handler\n'+hud());
 check('continue not fresh start',()=>assert.equal(call('safeIsStart',saved),false));
 check('continue reads supplied HUD',()=>assert.equal(call('safeSnapshot',[saved]).kind,'save'));
 const failed=msg('failed','assistant','(OOC: reference unavailable.)');
 check('failed new setup has no phantom scene',()=>assert.equal(call('safeSnapshot',[old,start,failed]),null));
 const control=msg('ctl','user','[HUD = SHOW]'),answer=msg('ans','assistant','Settings shown.');
 check('control preserves prior reading',()=>assert.equal(call('safeSnapshot',[start,a,control,answer]).messageId,'a'));
 chats.set('B',[msg('b-start','user','Mushoku_Start_Handler\nStart at Arc 8 (Custom)')]);await call('safePushState','B');
 check('chat isolation',()=>assert.equal(sent.at(-1).observer.snapshot,null));
 await frontend({type:'world_moves',chatId:'A'},'u');check('observer blocks active action',()=>assert.equal(calls.length,0));
 run("settings.companionPolicy='active';settings.activePanelRequest=false");
 check('active no optional injection by default',()=>{});assert.equal(await interceptor(prompt,{chatId:'A'}),prompt);
 run('settings.activePanelRequest=true');chats.set('A',[start]);
 check('active setup no injection',()=>{});assert.equal(await interceptor(prompt,{chatId:'A'}),prompt);
 chats.set('A',[start,a,msg('u2','user','I ask about Counter Arrow.\n[OOC: GUIDE = ON]')]);
 const active=await interceptor(prompt,{chatId:'A'});check('active optional request',()=>assert.equal(active.messages.length,3));
 const injected=active.messages[1].content;
 check('active no stale scene/styles',()=>assert(!/Sharia|K416|<ofilter|<lie |font color|current scene|User.s Stats/.test(injected)));
 check('active immutable messages',()=>assert.equal(JSON.stringify(prompt),serialized));
 check('active repeat no duplicate',()=>{});assert.equal(await interceptor(active.messages,{chatId:'A'}),active.messages);
 for(const type of ['quiet','impersonate','continue']){check('no request '+type,()=>{});assert.equal(await interceptor(prompt,{chatId:'A',generationType:type}),prompt);}
 chats.set('A',[start,a,msg('ooc','user','[OOC: explain the rules]')]);check('OOC no request',()=>{});assert.equal(await interceptor(prompt,{chatId:'A'}),prompt);
 chats.set('A',[start,a]);
 const writeAt=writes.length;await call('safeReadReply','A',[start,a],a);
 check('active reader stores metadata',()=>assert.equal(writes.length,writeAt+1));
 check('active reader never rewrites HUD',()=>assert.equal(Object.hasOwn(writes.at(-1).p,'content'),false));
 check('active no silent catch-up call',()=>assert.equal(calls.length,0));
 await call('setSwipeData','A',a,{infoBox:{}},{content:'unwanted replacement'});
 check('old tracker update cannot replace content',()=>assert.equal(Object.hasOwn(writes.at(-1).p,'content'),false));
 run("settings.companionPolicy='observer'");
 await assert.rejects(call('quietCall',{},100,'A'),/Observer/);checks++;
 console.log(JSON.stringify({checks,passed:checks,scope:'Entire shipped backend in mock Spindle; no live UI or model evaluation'},null,2));
 fs.mkdirSync(path.join(root,'docs/compatibility/v1.5'),{recursive:true});fs.writeFileSync(path.join(root,'docs/compatibility/v1.5/tests.json'),JSON.stringify({checks,passed:checks,failures:[],scope:'Entire shipped backend in mock Spindle; no live UI or model evaluation'},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
