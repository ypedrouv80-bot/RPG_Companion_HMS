const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../dist/frontend.js'),'utf8').replaceAll('\r\n','\n');
function fn(name,indent=''){const start=source.indexOf(indent+'function '+name+'(');if(start<0)throw Error(name);return source.slice(start,source.indexOf('\n'+indent+'}',start)+indent.length+2);}
class Element{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.events={};}appendChild(x){this.children.push(x);return x;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.events[k]=v;}}
const sent=[],state={chatId:'a',settings:{companionPolicy:'observer'},observer:{snapshot:null}};
const ctx=vm.createContext({state,S:()=>state.settings,send:x=>sent.push(x),saveSettings:()=>sent.push('save'),T:x=>x,I18N_ATTRS:new Set(),
 document:{createElement:t=>new Element(t),createTextNode:t=>({text:String(t)})}});
vm.runInContext(fn('h')+'\n'+fn('companionPolicySelect','    ')+'\n'+fn('renderObserver','    '),ctx);
const render=()=>vm.runInContext('renderObserver()',ctx);
function nodes(xs){return xs.flatMap(x=>[x,...nodes(x.children||[])]);}
let n=nodes(render());assert(n.some(x=>x.text?.includes('Aguardando')));
const select=n.find(x=>x.tag==='select');assert.equal(select.value,'observer');assert.equal(select.children.length,2);
select.events.change({target:{value:'active'}});assert.equal(state.settings.companionPolicy,'active');assert(sent.includes('save'));
state.observer.snapshot={messageId:'x',swipeId:0,rows:[{text:'Inventory: <script>evil()</script>'}],warnings:['Sandbox conflicts with Arc 7'],raw:'HUD',latestReplyHasNoHud:true};
n=nodes(render());assert.equal(n.some(x=>x.tag==='script'),false);assert(n.some(x=>x.text==='Inventory: <script>evil()</script>'));
assert(n.some(x=>x.attrs?.role==='alert'));assert(n.some(x=>x.text?.includes('última leitura')));
const ignore=n.find(x=>x.tag==='button'&&x.children.some(y=>y.text?.includes('Ignorar')));ignore.events.click();assert.equal(sent.at(-1).type,'observer_ignore');
console.log('Observer UI: 10 assertions passed (actual shipped functions with mock DOM; no browser rendering claim).');
