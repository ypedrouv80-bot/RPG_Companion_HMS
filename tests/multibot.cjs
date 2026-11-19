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

const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/multibot.json'),'utf8'));
for(const fixture of fixtures){const hud=call('parseHud',fixture.text);check(fixture.id+' HUD',()=>assert(hud));check(fixture.id+' location',()=>assert(hud.location?.length));check(fixture.id+' arc',()=>assert(hud.arc));const snap=call('safeSnapshot',[msg('m','assistant',fixture.text)]);check(fixture.id+' snapshot',()=>assert(snap?.rows.length));}
const selector=call('safeSnapshot',[msg('m','assistant','<!-- DR_CURRENT MAIN | Imposter=IM_P05 -->')]);check('Danganronpa metadata only',()=>assert.equal(selector.kind,'selectors'));check('Danganronpa no invented HUD',()=>assert.equal(selector.rows.length,0));


const oldChapter={chapters:{list:[{id:'c1',kind:'arc',title:'Chapter 1',titleByUser:false,fromId:'arc-start',status:'open'}],open:{},knowledge:[]}};
check('arc title follows source HUD',()=>assert.equal(call('chaptersPanel',oldChapter,[msg('arc-start','assistant',fixtures[0].text)]).list[0].title,call('parseHud',fixtures[0].text).arc));

check('guide example is not current state',()=>assert.equal(call('safeSnapshot',[msg('guide','assistant','THE WORLD STATE PANEL — one example, from a campaign already underway.\n'+fixtures[0].text)]),null));
console.log('Multi-bot backend: '+checks+' checks passed');
