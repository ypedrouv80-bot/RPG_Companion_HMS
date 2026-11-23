const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),backend=fs.readFileSync(path.join(root,'dist/backend.js'),'utf8').replaceAll('\r\n','\n'),front=fs.readFileSync(path.join(root,'dist/frontend.js'),'utf8').replaceAll('\r\n','\n');
function fn(src,name,indent=''){const start=src.indexOf(indent+'function '+name+'(');assert(start>=0,name);return src.slice(start,src.indexOf('\n'+indent+'}',start)+indent.length+2);}
class Element{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.events={};}appendChild(x){this.children.push(x);return x;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.events[k]=v;}}
const state={open:{},hms:{hud:null}},ctx=vm.createContext({state,Number,Set,parseInt,T:x=>x,TT:(s,...args)=>s.replace(/\{(\d+)\}/g,(_,n)=>args[+n]),hudSemanticText:x=>String(x).replace(/\*\*/g,''),canonDivergenceRows:()=>[],uiSetting:()=>false,render(){},I18N_ATTRS:new Set(),SW:(_,x)=>x,
 MT_ROUTE_TITLES:{'1':'Infancy','2':'Home Tutor','3':'Adventure','4':'Voyage','8':'University','9':'University Bonds','4-B':'Southbound Search'},
 document:{createElement:t=>new Element(t),createTextNode:t=>({text:String(t)})}});
vm.runInContext(['mtReportedYear','mtCalendar','safeSaga'].map(n=>fn(backend,n)).join('\n')+fn(front,'h')+fn(front,'renderMtSaga','    '),ctx);
const call=(name,...args)=>{ctx.args=args;return vm.runInContext(name+'(...args)',ctx);};
const nodes=x=>[x,...(x.children||[]).flatMap(nodes)],text=x=>nodes(x).map(n=>n.text||'').join('');
let checks=0;const check=(name,f)=>{try{f();checks++;}catch(e){e.message=name+': '+e.message;throw e;}};
for(const [row,year] of [
 ['Armored Dragon Calendar: K418, 5th month, mid-Seedtide — early spring | Time: late morning',418],
 ['Date: K422, spring (approx.)',422],['Date: Harvestmoon 16, K417 · Lightday',417],['Year: K.420 | Day: 15',420],
 ['Date: Unknown\nBirth: K407',null],['Birth: K407',null],['Date: K418 or K422',null],['Date: K.null',null],['Date: K12345',null]
 ])check('reported year '+row,()=>assert.equal(call('mtReportedYear',row),year));
check('partial date does not acquire a day',()=>assert.equal(call('mtCalendar','Armored Dragon Calendar: K418, 5th month, mid-Seedtide'),null));
check('legacy complete date still parsed',()=>assert.equal(call('mtCalendar','Armored Dragon Calendar: K420, Month 4, Day 12').day,12));
for(const year of [null,418]){
 const saga=call('safeSaga','8',year,'[MT-ARC:8]',null),view=call('renderMtSaga',saga),s=text(view);
 check('unknown boundaries '+year,()=>assert.equal(saga.from,null));
 check('no null/zero/NaN output '+year,()=>assert(!/K\.(?:null|undefined|NaN|0)\b|NaN|the last arc/.test(s)));
 check('no false timeline '+year,()=>assert(!nodes(view).some(x=>x.attrs?.role==='img')));
 check('current arc retained '+year,()=>assert(s.includes('Arc 8: University')));
 check('reported year or honest absence '+year,()=>assert(s.includes(year===null?'Campaign year not stated':'K.418')));
 check('no automatic completion '+year,()=>assert(!nodes(view).some(x=>x.className==='past')));
}
const branch=call('safeSaga','4-B',422,'[MT-ARC:4-B]',null),branchView=call('renderMtSaga',branch);
check('branch rendered once',()=>assert(text(branchView).includes('Arc 4-B: Southbound Search')&&!text(branchView).includes('4-B-B')));
check('branch highlighted',()=>assert(nodes(branchView).some(x=>x.tag==='li'&&x.className==='cur'&&text(x).includes('Arc 4-B'))));
const dated={year:422,from:417,to:424,current:8,part:null,participation:'explicit',arcs:[{no:7,title:'North',year:420},{no:8,title:'University',year:422},{no:9,title:'Bonds',year:null},{no:12,title:'Labyrinth',year:424}],next:{no:12,inYears:2},events:[]};
check('genuine dated timeline retained',()=>assert(nodes(call('renderMtSaga',dated)).some(x=>x.attrs?.role==='img')));
check('undated entries not placed at year zero',()=>assert(!text(call('renderMtSaga',dated)).includes('K.null')));
check('empty list handled',()=>assert(!/K\.(null|undefined|0)/.test(text(call('renderMtSaga',{...dated,year:null,arcs:[],next:null})))));
console.log('Saga dates: '+checks+' checks passed (actual parser/renderer functions, mock DOM).');
