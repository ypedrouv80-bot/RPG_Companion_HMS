const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'dist/backend.js'),'utf8').replace(/\r\n/g,'\n');
const checks=[];function check(name,ok){checks.push({name,passed:!!ok});}
function fn(name){const start=source.search(new RegExp('^function '+name+'\\(','m'));if(start<0)throw Error('Missing '+name);const lineEnd=source.indexOf('\n',start);if(source.slice(start,lineEnd).trimEnd().endsWith('}'))return source.slice(start,lineEnd);const end=source.indexOf('\n}',start);if(end<0)throw Error('Unclosed '+name);return source.slice(start,end+2);}
function constant(name){const start=source.search(new RegExp('^const '+name+' =','m'));if(start<0)throw Error('Missing '+name);return source.slice(start,source.indexOf(';\n',start)+1);}
const funcs=['textMemo','textOf','lockKey','hudSemanticText','hudSemanticTextRead','hudFieldsFixed','findHud','findHudRaw','findHudAt','hmsRenderedPanelText','hudBlankInside','hudLineShaped','collapseDuplicateHudHeads','classifyHudLine','parseHud','hmsMarkBlocks','hmsMarkBlocksIn','mushokuLocationSegments','hudStyleFor','mtReportedYear','mtCalendar','mtCalendarDay','mtSkillsLine','mtPrefixRankRows','mtRankRows','mtPowerViews','hmsSplitTop','spellMtStep','worldLines','worldOf','worldFind','worldAll','rewriteHud','hudLayoutRead','textHasHud','isHmsChat','renderHudCard'];
const constants=['HUD_HEAD_RE','HUD_SEP_RE','LOC_MARK_RE','LOC_ARROW_RE','LOC_LABEL_RE','HMS_BLOCK_FENCE_RE','MT_SKILL_SHORT','SPELL_ELEMENTS','SPELL_MT_WORDS','hudSemanticMemo'];
const context=vm.createContext({HMSCompatibility:require('../compatibility/hud-profiles.js'),activeReadPass:null,settings:{hmsMode:'auto'},hmsCache:new Map()});
vm.runInContext(funcs.map(fn).join('\n')+'\n'+constants.map(constant).join('\n'),context);
function call(name,...args){context.args=args;return vm.runInContext(name+'(...args)',context,{timeout:1000});}
const body='Armored Dragon Calendar: K414, Rainveil 12, Stoneday | Time: Late afternoon\nSeason: Spring (calendar)\nLocation: Central Continent → Fittoa → Buena Village\nCurrent Arc: Arc 8: University [MT-ARC:8]\nCurrent Scene: A lesson\nRace: Human | Origin: Native | Age: 18\nRudeus Mode: Replacement\nGame Mode: Sandbox | Canon: Living | Guide: On\nHUD Style: Panel\nCalendar Profile: Themed\nMana Capacity: Modest | Reserve: 0 | Status: Exhausted\nMagic Tiers: Wind (Elementary), Water (Intermediate)\nCondition: Stable\nInventory: 0 coins\nNPCs Present: Tutor';
const prose='The tutor waits. Nothing advances until you decide.';
function hud(header,rows=body){return header+'\n'+rows+'\n***\n'+prose;}
for(const header of ['### WORLD STATE ###','### 🌐 WORLD STATE ###','### 🌍 WORLD STATE ###','### WORLD STATE [PANEL] ###','### WORLD STATE [COLLAPSED] ###','WORLD STATE','**WORLD STATE**'])for(const endings of ['\n','\r\n']){
 const input=hud(header).replaceAll('\n',endings),parsed=call('parseHud',input);
 check('detect '+header+' '+JSON.stringify(endings),!!parsed&&parsed.find.sepFound);
 check('world identity '+header+' '+JSON.stringify(endings),call('worldOf',call('worldLines',parsed))==='mushoku');
 check('values retained '+header+' '+JSON.stringify(endings),parsed?.lines.some(l=>l.key==='rudeus mode'&&l.fields[0].value==='Replacement')&&parsed?.lines.some(l=>l.key==='inventory'&&l.fields[0].value==='0 coins'));
 check('narrative outside '+header+' '+JSON.stringify(endings),!parsed?.lines.some(l=>l.text.includes(prose)));
 check('HMS auto '+header+' '+JSON.stringify(endings),call('isHmsChat',header+endings,null,[{role:'assistant',content:input}])===true);
}
const visual=body.replace(/^([^:\n]+):/gm,'📅 **$1:**');
check('bold Visual fields',call('parseHud',hud('### 🌐 WORLD STATE ###',visual)).lines.some(l=>l.key==='rudeus mode'&&l.fields[0].value==='Replacement'));
check('Visual calendar',call('mtCalendar',visual)?.month===4);
for(const mode of ['NPC','Player','Replacement','Off'])check('Rudeus mode preserved '+mode,call('parseHud',hud('### WORLD STATE [PANEL] ###',body.replace('Replacement',mode))).lines.find(l=>l.key==='rudeus mode').fields[0].value===mode);
for(const x of ['No HUD here.','The phrase WORLD STATE [PANEL] appears in dialogue.','### WORLD STATE [UNKNOWN] ###\nfoo: bar\n***','<think>'+hud('### WORLD STATE [PANEL] ###')+'</think>','Example\n```text\n'+hud('### WORLD STATE [PANEL] ###')+'\n```'])check('not a live state '+x.slice(0,45),call('parseHud',x)===null);
const months=['Deepfrost','Thawrise','Seedtide','Rainveil','Greengrowth','Suncrest','Highsun','Emberwane','Harvestmoon','Goldfall','Longnight','Frostfall'];
const familiar=['January','February','March','April','May','June','July','August','September','October','November','December'];
for(let i=0;i<12;i++)for(const name of [months[i],familiar[i]]){
 const date=call('mtCalendar',`Armored Dragon Calendar: K422, ${name} 30, Restday | Time: 16:40`);
 check('month '+name,date?.year===422&&date?.month===i+1&&date?.day===30&&date?.monthName===name);
}
for(const date of ['Armored Dragon Calendar: K414, Month 4, Day 12','Armored Dragon Calendar: K414, Rainveil (Month 4), Day 12'])check('old calendar '+date,call('mtCalendar',date)?.month===4);
check('legacy Year/Day',call('mtCalendar','Year: K.414 | Day: 200 | Time: 12:00')?.day===200);
for(const date of ['K414, Unknown 12','K414, Rainveil 31','K414, Rainveil 0','K414, Rainveil unknown','K414, Month 13, Day 2'])check('no date invention '+date,call('mtCalendar','Armored Dragon Calendar: '+date)===null);
const skills=call('mtSkillsLine','Skills: 🌪️ Wind — Elementary · 💧 Water — Intermediate · ⚔️ Sword God — Advanced · 🤫 Voiceless');
check('Compact names without dash suffix',JSON.stringify(skills?.magic)===JSON.stringify([['Wind','Elementary'],['Water','Intermediate']]));
check('Compact martial and voiceless',skills?.martial[0][0]==='Sword God'&&skills?.martial[0][1]==='Advanced'&&skills?.voiceless===true);
check('old Compact',call('mtSkillsLine','Skills: 💧Water Saint · 🪨Earth Adv · ⚔️Sword God Int')?.magic.length===2);
check('numeric ranks not fabricated',call('mtSkillsLine','Skills: 🌪️ Wind — 1')===null);
for(const style of ['CLASSIC','VISUAL','COMPACT','PANEL','CARD','COLLAPSED']){
 check('style command '+style,call('hudStyleFor',[{role:'user',content:`[HUD = ${style}]`}])===style.toLowerCase());
 check('style start '+style,call('hudStyleFor',[{role:'user',content:`HUD: ${style}`}])===style.toLowerCase());
 check('style state '+style,call('hudStyleFor',[{role:'assistant',content:hud('### WORLD STATE ###',body.replace('HUD Style: Panel','HUD Style: '+style))}])===style.toLowerCase());
}
for(const style of ['PANEL','COLLAPSED']){
 const input=hud(`### WORLD STATE [${style}] ###`);
 check('selector without command '+style,call('hudStyleFor',[{role:'assistant',content:input}])===style.toLowerCase());
 check('no double-render '+style,call('renderHudCard',input,{hudCard:true},null)===input);
 context.input=input;
 const rewritten=vm.runInContext("rewriteHud(input,items=>{items.find(x=>x.key==='inventory').text='Inventory: 1 coin';return true;})",context);
 check('rewrite preserves header and prose '+style,rewritten.changed&&rewritten.content.startsWith(`### WORLD STATE [${style}] ###`)&&rewritten.content.endsWith(prose));
}
check('latest explicit user style wins',call('hudStyleFor',[{role:'user',content:'HUD: Panel'},{role:'assistant',content:hud('### WORLD STATE [PANEL] ###')},{role:'user',content:'[HUD = COMPACT]'}])==='compact');
// Replay the real card regex pack, then read its actual generated HTML.
const pack=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/HMS_v2.5_Complete_Regex_Pack.json'),'utf8'));
function render(input){for(const r of pack)if(!r.disabled&&r.markdownOnly&&!r.promptOnly){const n=r.findRegex.lastIndexOf('/');input=input.replace(new RegExp(r.findRegex.slice(1,n),r.findRegex.slice(n+1)),r.replaceString)}return input;}
for(const style of ['PANEL','COLLAPSED']){
 const html=render(hud(`### WORLD STATE [${style}] ###`)),parsed=call('parseHud',html);
 check('rendered HTML detected '+style,parsed?.find.fromHtml&&parsed.find.sepFound);
 check('rendered HTML location '+style,parsed?.location?.includes('Buena Village'));
 check('rendered HTML Rudeus mode '+style,parsed?.lines.find(l=>l.key==='rudeus mode')?.fields[0]?.value==='Replacement');
 check('rendered HTML magic '+style,parsed?.lines.find(l=>l.key==='magic tiers')?.fields[0]?.value.includes('Wind — Elementary'));
 context.html=html;check('HTML never rewritten '+style,!vm.runInContext("rewriteHud(html,items=>{items[0].text='date changed';return true;})",context).changed);
}
// All actual examples from the released guide: saves are readable when deliberately imported.
const guide=fs.readFileSync(path.join(__dirname,'fixtures/HUD_STYLE_EXAMPLES.md'),'utf8').replaceAll('\r\n','\n');
for(const [i,m] of [...guide.matchAll(/```text\n([\s\S]*?)\n```/g)].entries())check('actual release example '+i,!!call('parseHud',m[1]));
check('fenced save readable',!!call('parseHud','```text\n'+hud('### WORLD STATE ###')+'\n```\n```text\n### SAVE NOTES ###\nSchema: MT-Standalone-2\n***\n```'));
// Original-world regression samples remain accepted by the shared reader.
for(const [name,rows] of [['rezero',"Deaths: 2\nWitch's Scent: Low\n◆ Lugunica → Inn"],['overlord','Overall Lvl: 100\nKarma: -500'],['cote','Cohort: Year 1\nPrivate Points: 3000'],['bg3','Date: 1492 DR\nLocation: Faerûn → Baldur’s Gate\nTadpole: Present']]){
 const parsed=call('parseHud',hud('### WORLD STATE ###',rows));check('legacy '+name,!!parsed&&call('worldOf',call('worldLines',parsed))===name);
}
// Read the actual Mushoku adapter with external lore lookup deliberately absent.
Object.assign(context,{isPlainObject:v=>v!==null&&typeof v==='object'&&!Array.isArray(v),mtManaTierLore:()=>null,worldLore:()=>null,worldSpellIndex:()=>null,techIndexFromCatalog:()=>null,spellIndexFromCatalog:()=>null,mtSaga:()=>null});
vm.runInContext(['worldMushoku','mtTraining','mtStanding'].map(fn).join('\n')+'\n'+['MT_MAGIC','MT_MARTIAL'].map(constant).join('\n'),context);
const world=call('worldMushoku','fixture',call('worldLines',call('parseHud',hud('### WORLD STATE [PANEL] ###',body+'\nDream Link: Estranged'))),{});
check('Mushoku adapter themed date',world.year===414&&world.month===4&&world.day===12);
check('Mushoku adapter approximate time',world.period==='Late afternoon');
check('Mushoku adapter current settings',world.rudeusMode==='Replacement'&&world.guide==='On'&&world.calendarProfile==='Themed'&&world.season==='Spring (calendar)');
check('Mushoku adapter actual dream standing',world.hitogami?.state==='Estranged'&&world.hitogami.dreams===null);
check('Mushoku adapter empty reserve preserved',world.reserve==='0');
new vm.Script(source,{filename:'backend.js'});check('backend syntax',true);
require('child_process').execFileSync(process.execPath,['--input-type=module','--check'],{input:fs.readFileSync(path.join(root,'dist/frontend.js'),'utf8')});check('frontend module syntax',true);
const failures=checks.filter(x=>!x.passed),report={checks:checks.length,passed:checks.length-failures.length,failures,scope:'Actual shipped reader functions extracted into an isolated VM; real bot regex HTML replay. No storage, network, model generation or live Lumiverse session.'};
fs.mkdirSync(path.join(root,'docs/compatibility/six-sided-v251'),{recursive:true});fs.writeFileSync(path.join(root,'docs/compatibility/six-sided-v251/tests.json'),JSON.stringify({report,checks},null,2));
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
