// Six-Sided World 2.5.3 (customizable HUD) — compatibility checks for RPG Companion HMS 1.4.4.
// Runs the shipped backend functions in an isolated VM against the card's own fixtures: the six BASIC
// HUD examples, its real display regex, its greetings (with the new HUD guide page) and its arc keys.
// No storage, network, model generation or live Lumiverse session.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..'), source = fs.readFileSync(path.join(root, 'dist/backend.js'), 'utf8').replace(/\r\n/g, '\n');
const fx = p => path.join(__dirname, 'fixtures', p);
const checks = []; function check(name, ok) { checks.push({ name, passed: !!ok }); }
function fn(name) { const start = source.search(new RegExp('^(?:async )?function ' + name + '\\(', 'm')); if (start < 0) throw Error('Missing ' + name); const lineEnd = source.indexOf('\n', start); if (source.slice(start, lineEnd).trimEnd().endsWith('}')) return source.slice(start, lineEnd); const end = source.indexOf('\n}', start); if (end < 0) throw Error('Unclosed ' + name); return source.slice(start, end + 2); }
function constant(name) { const start = source.search(new RegExp('^const ' + name + ' =', 'm')); if (start < 0) throw Error('Missing ' + name); const end = source.indexOf(';\n', start); return source.slice(start, end + 1); }

const funcs = ['textMemo', 'textOf', 'lockKey', 'hudSemanticText', 'hudSemanticTextRead', 'hudFieldsFixed', 'findHud', 'findHudRaw', 'findHudAt', 'hmsRenderedPanelText', 'hudBlankInside', 'hudLineShaped', 'collapseDuplicateHudHeads', 'classifyHudLine', 'parseHud', 'hmsMarkBlocks', 'hmsMarkBlocksIn', 'mushokuLocationSegments', 'hudStyleFor', 'mtCalendar', 'mtCalendarDay', 'mtSkillsLine', 'mtRankRows', 'mtPowerViews', 'hmsSplitTop', 'spellMtStep', 'worldLines', 'worldOf', 'worldFind', 'worldAll', 'rewriteHud', 'hudLayout', 'hudLayoutRead', 'textHasHud', 'isHmsChat', 'renderHudCard',
    // 1.4.4
    'sixVisRow', 'sixVisShown', 'sixIsSixSided', 'sixRevAtLeast', 'sixVisGuidePage', 'sixVisApply', 'sixVisSaveNotes', 'sixVisRead', 'sixVisFrom', 'sixVisibility', 'sixVisibilityRead', 'sixControlTurn', 'sixControlReply', 'sixVisFill', 'arcSame', 'hmsNorm', 'readArcIdentity', 'safeSaga', 'safeArcDiagnostic', 'mtSaga', 'arcCheck', 'loreEntryHits', 'loreEscapeRe',
    'isHudSwap', 'diffHud', 'hmsProcessContent', 'hmsTimelineUncached', 'messageHud', 'trackingMessageVisible', 'catalogMessage', 'catalogPlain', 'catalogParsePage', 'catalogRead'];
const constants = ['HUD_HEAD_RE', 'HUD_SEP_RE', 'LOC_MARK_RE', 'LOC_ARROW_RE', 'LOC_LABEL_RE', 'HMS_BLOCK_FENCE_RE', 'MT_SKILL_SHORT', 'SPELL_ELEMENTS', 'SPELL_MT_WORDS', 'hudSemanticMemo', 'hmsNormMemo', 'hudLayoutCache',
    'SIX_VIS_GROUPS', 'SIX_VIS_KEEP', 'SIX_VIS_ESSENTIAL_RE', 'SIX_VIS_ROWS', 'SIX_VIS_CMD_RE', 'SIX_VIS_TOUCH_RE', 'SIX_VIS_ASK_RE', 'SIX_ARC_CODE_ONLY_RE', 'SIX_CTL_TOKEN_RE', 'SIX_VIS_BASIC', 'sixVisCache', 'MT_ROUTE_TITLES', 'ARC_KEY_RE',
    'hmsParseCache', 'CATALOG_SKIP_RE', 'CATALOG_START_RE', 'CATALOG_MOD_PAGE_RE', 'CATALOG_EXAMPLE_RE'];
const lorePool = [];
const context = vm.createContext({HMSCompatibility:require("../compatibility/hud-profiles.js"),
    activeReadPass: null, settings: { hmsMode: 'auto', hmsGuard: true, hmsHudMath: false, hmsHudFormat: false }, hmsCache: new Map(),
    memoRead: (chat, key, read) => read(), logW: () => {}, getLorePool: () => lorePool, atlasSim: () => 0,
    mtArcList: () => [{ no: 1, title: 'Childhood', year: 407 }, { no: 2, title: 'Home Tutor', year: 412 }, { no: 3, title: 'Entry-Level Adventurer', year: 417 }, { no: 8, title: 'University', year: 423 }, { no: 9, title: 'University Bonds', year: 424 }],
    mtCanonSchedule: () => [],
    getChatState: async () => ({ pins: {} }), hmsCalNow: () => null, userNameCache: new Map(), applyPins: () => false,
    parseCompanion: () => ({ found: false }), partyRoster: () => [], immActive: () => false, enforceLocks: () => {}, botSidePanel: () => null,
    stripHiddenTags: x => x, hmsClock: () => null, companionResumeHud: () => null, stripCompanion: x => x, stripLeakedReasoning: x => x, chatApi: { getMessages: async () => [] }
});
vm.runInContext(funcs.map(fn).join('\n') + '\n' + constants.map(constant).join('\n'), context);
function call(name, ...args) { context.args = args; return vm.runInContext(name + '(...args)', context, { timeout: 2000 }); }
async function acall(name, ...args) { context.args = args; return await vm.runInContext(name + '(...args)', context, { timeout: 2000 }); }

const prose = 'Rain drums on the shelter roof. Nothing advances until you decide.';
const examples = fs.readFileSync(fx('v253/HUD_STYLE_EXAMPLES.md'), 'utf8').replaceAll('\r\n', '\n');
const basic = [...examples.matchAll(/## (\w+) — BASIC fixture\s*```text\n([\s\S]*?)\n```/g)].map(m => ({ style: m[1], hud: m[2] }));
check('six BASIC fixtures found', basic.length === 6);

// 1. Every BASIC style reads, is Mushoku, keeps the essential rows and names its arc
for (const { style, hud } of basic) for (const eol of ['\n', '\r\n']) {
    const tag = `${style} ${JSON.stringify(eol)}`;
    const input = (hud + '\n' + prose).replaceAll('\n', eol), parsed = call('parseHud', input);
    check('BASIC detect ' + tag, !!parsed && parsed.find.sepFound);
    check('BASIC world ' + tag, call('worldOf', call('worldLines', parsed)) === 'mushoku');
    check('BASIC HMS auto ' + tag, call('isHmsChat', 'x', null, [{ role: 'assistant', content: input }]) === true);
    check('BASIC arc named from its code ' + tag, parsed && parsed.arc === 'Arc 8: University [MT-ARC:8]');
    check('BASIC Rudeus Mode ' + tag, parsed?.lines.some(l => l.key === 'rudeus mode' && l.fields[0].value === 'Replacement'));
    check('BASIC location ' + tag, String(parsed?.location || '').includes('roadside shelter'));
    check('BASIC calendar ' + tag, call('mtCalendar', input)?.month === 4 && call('mtCalendar', input)?.day === 12);
    check('BASIC prose outside ' + tag, !parsed?.lines.some(l => l.text.includes('Rain drums')));
    check('BASIC rows all essential ' + tag, parsed?.lines.every(l => call('sixVisRow', l.text) === 'ESSENTIAL'));
}
// 2. Through the card's real display regex (Panel/Collapsed are drawn by the bot)
const pack = JSON.parse(fs.readFileSync(fx('HMS_v2.5_Complete_Regex_Pack.json'), 'utf8'));
function render(input) { for (const r of pack) if (!r.disabled && r.markdownOnly && !r.promptOnly) { const n = r.findRegex.lastIndexOf('/'); input = input.replace(new RegExp(r.findRegex.slice(1, n), r.findRegex.slice(n + 1)), r.replaceString); } return input; }
for (const { style, hud } of basic.filter(x => /PANEL|COLLAPSED/.test(x.style))) {
    const html = render(hud + '\n' + prose), parsed = call('parseHud', html);
    check('BASIC rendered HTML read ' + style, parsed?.find.fromHtml && parsed.find.sepFound);
    check('BASIC rendered HTML arc code ' + style, /MT-ARC:8/.test(parsed?.arc || '') && /University/.test(parsed?.arc || ''));
    check('BASIC rendered HTML Rudeus ' + style, parsed?.lines.find(l => l.key === 'rudeus mode')?.fields[0]?.value === 'Replacement');
    check('BASIC style from header ' + style, call('hudStyleFor', [{ role: 'assistant', content: hud + '\n' + prose }]) === style.toLowerCase());
}
// 3. The bare arc code: route title, sub-arcs, sandbox, saga position, chapter identity
const arcOf = rows => call('parseHud', `### WORLD STATE ###\nArmored Dragon Calendar: K414, Rainveil 12, Stoneday | Time: 09:00\n${rows}\n***\n${prose}`).arc;
check('arc 3-B title', arcOf('Current Arc: [MT-ARC:3-B]') === 'Arc 3-B: The Silent Road [MT-ARC:3-B]');
check('arc sandbox code', arcOf('Current Arc: [MT-ARC:Sandbox]') === 'Sandbox [MT-ARC:Sandbox]');
check('arc unknown code kept', arcOf('Current Arc: [MT-ARC:99]') === 'Arc 99 [MT-ARC:99]');
check('2.5.1 arc line unchanged', arcOf('Current Arc: Arc 8: University [MT-ARC:8]') === 'Arc 8: University [MT-ARC:8]');
check('Era / Arc label (upkeep) code', arcOf('Era / Arc: [MT-ARC:8]') === 'Arc 8: University [MT-ARC:8]');
const saga = call('mtSaga', 'x', 423, '[MT-ARC:8]', { year: 423, month: 4, day: 1 });
check('saga reads bare code as the arc', saga?.current === 8 && saga.participation === 'explicit' && saga.personalArc === null);
const sagaB = call('mtSaga', 'x', 418, '[MT-ARC:3-B]', null);
check('saga sub-arc from code', sagaB?.current === 3 && sagaB.part === 'B');
check('saga sandbox code', call('mtSaga', 'x', 414, '[MT-ARC:Sandbox]', null)?.participation === 'personal');
check('saga 2.5.1 line unchanged', call('mtSaga', 'x', 423, 'Arc 8: University [MT-ARC:8]', null)?.current === 8);
check('chapter: 2.5.1 arc and 2.5.3 code are the same arc', call('arcSame', 'Arc 8: University [MT-ARC:8]', arcOf('Current Arc: [MT-ARC:8]')));
check('chapter: sandbox title and code are the same arc', call('arcSame', 'Sandbox — village life [MT-ARC:Sandbox]', 'Sandbox [MT-ARC:Sandbox]'));
check('chapter: a new arc is still a turn', !call('arcSame', 'Arc 8: University [MT-ARC:8]', 'Arc 9: University Bonds [MT-ARC:9]'));
check('chapter: other worlds compare as before', call('arcSame', 'Arc 2: A Week at the Mansion', 'arc 2: a week at the mansion') && !call('arcSame', 'Arc 2: A', 'Arc 3: B'));
// arc check against the card's own arc keys: no false alarm on the bare code, a real typo still flagged
lorePool.push(...JSON.parse(fs.readFileSync(fx('v253/arc_keys.json'), 'utf8')).entries);
const arcHud = rows => call('parseHud', `### WORLD STATE ###\nArmored Dragon Calendar: K414, Rainveil 12, Stoneday | Time: 09:00\n${rows}\n***\n${prose}`);
for (const code of ['1', '2-B', '3-H', '8', '23']) check('arc check passes [MT-ARC:' + code + ']', call('arcCheck', 'x', arcHud(`Current Arc: [MT-ARC:${code}]`))?.ok === true);
check('arc check flags a bad code', call('arcCheck', 'x', arcHud('Current Arc: [MT-ARC:3B]'))?.ok === false);
check('arc check skips the sandbox code', call('arcCheck', 'x', arcHud('Current Arc: [MT-ARC:Sandbox]')) === null);
check('arc check 2.5.1 line still passes', call('arcCheck', 'x', arcHud('Current Arc: Arc 8: University [MT-ARC:8]'))?.ok === true);

// 4. Row groups, from the 2.5.1 full HUD (every optional group) in Classic and Visual
const full = 'Armored Dragon Calendar: K414, Rainveil 12, Stoneday | Time: Late afternoon\nSeason: Spring (calendar)\nLocation: Central Continent → Fittoa → Buena Village\nCurrent Arc: [MT-ARC:8]\nCurrent Scene: A lesson with a local tutor\nRace: Human | Origin: Native | Age: 18\nRudeus Mode: Replacement\nGame Mode: Sandbox | Canon: Off-Screen | Guide: On\nHUD Style: CLASSIC\nCalendar Profile: Themed\nMana Capacity: Modest | Reserve: Half | Status: Tired\nMagic Tiers: Wind (Elementary), Water (Intermediate)\nLanguages: Human Tongue (Fluent, reads)\nTraining: Wind spell control\nDream Link: Estranged\n[DEMON EYE: Foresight]\nCondition: Stable\nInjuries: Bruised ribs (treated)\nEquipment: Travel clothes\nInventory: 0 coins\nStanding: Commoner\nBonds: Trusted tutor\nActive Paths: Find the tutor’s brother\nNext Canon Event: The entrance exam\nNPCs Present: Tutor';
const want = { 'armored dragon calendar': 'ESSENTIAL', season: 'ESSENTIAL', location: 'ESSENTIAL', arc: 'ESSENTIAL', 'rudeus mode': 'ESSENTIAL', condition: 'ESSENTIAL', 'current scene': 'SCENE', race: 'IDENTITY', 'game mode': 'POLICIES', 'hud style': 'POLICIES', 'calendar profile': 'POLICIES', 'mana capacity': 'MANA', 'magic tiers': 'SKILLS', languages: 'SKILLS', training: 'SKILLS', 'dream link': 'DREAM', 'module:DEMON EYE:foresight': 'GIFTS', injuries: 'HEALTH', equipment: 'EQUIPMENT', inventory: 'INVENTORY', standing: 'SOCIAL', bonds: 'BONDS', 'active paths': 'PATHS', 'next canon event': 'CANON', 'npcs present': 'NPCS' };
const fullHud = call('parseHud', '### WORLD STATE ###\n' + full + '\n***\n' + prose);
const visualFull = full.split('\n').map(l => /^\[/.test(l) ? l : '🔹 ' + l.replace(/^([^:]+):/, '**$1:**')).join('\n');
const visualHud = call('parseHud', '### 🌐 WORLD STATE ###\n' + visualFull + '\n***\n' + prose);
for (const [key, group] of Object.entries(want)) {
    check('row group ' + key, call('sixVisRow', fullHud.lines.find(l => l.key === key)?.text) === group);
    check('row group Visual ' + key, call('sixVisRow', visualHud.lines.find(l => l.key === key)?.text) === group);
}
check('Compact Skills row', call('sixVisRow', 'Skills: 🌪️ Wind — Elementary · 💧 Water — Intermediate') === 'SKILLS');
check('Party Mode player row essential', call('sixVisRow', 'Player: Aisha — Human, 12') === 'ESSENTIAL');
check('unknown custom row', call('sixVisRow', 'Weather: Rain') === 'CUSTOM');

// 5. Field settings, read from the chat as the card applies them
const greet = JSON.parse(fs.readFileSync(fx('v253/greetings.json'), 'utf8'));
const swipes = [greet.first_mes, ...greet.alternate_greetings];
check('card has 13 alternate greetings', greet.alternate_greetings.length === 13);
const opening = { id: 'g', role: 'assistant', content: greet.first_mes, swipes, swipe_id: 0 };
const A = (id, content) => ({ id, role: 'assistant', content }), U = (id, content) => ({ id, role: 'user', content });
const basicHud = basic[0].hud + '\n' + prose;
const fullReply = '### WORLD STATE ###\n' + full + '\n***\n' + prose;
const vis = chat => call('sixVisibility', chat);
check('aware from the card\'s HUD guide greeting', vis([opening]).aware === true && vis([opening]).final.profile === 'BASIC');
check('legacy chat (no 2.5.3 sign) not aware', vis([U('u', 'Start at Arc 8'), A('a', fullReply.replace('Current Arc: [MT-ARC:8]', 'Current Arc: Arc 8: University [MT-ARC:8]'))]).aware === false);
check('aware from a bare arc code', vis([A('a', basicHud)]).aware === true);
check('aware from a Visual bare arc code', vis([A('a', '### 🌐 WORLD STATE ###\n**Armored Dragon Calendar:** K414, Rainveil 12\n🧭 **Current Arc:** [MT-ARC:8]\n***\nx')]).aware === true);
let v = vis([opening, U('u1', '[HUD = BASIC]\n[HUD = PANEL]\n[HUD SKILLS = ON]\n[HUD = SHOW]'), A('a1', basicHud)]);
check('guide example: SKILLS on, the rest off', v.final.on.SKILLS === true && v.final.on.BONDS === false && v.final.profile === 'CUSTOM');
check('state recorded per reply', v.at.get('a1') === v.final);
v = vis([opening, U('u1', '[hud = full]'), A('a1', fullReply), U('u2', '[HUD BONDS=OFF] [HUD npcs = off]'), A('a2', basicHud)]);
check('FULL then case-insensitive OFF commands', v.at.get('a1').on.BONDS === true && v.final.on.BONDS === false && v.final.on.NPCS === false && v.final.on.MANA === true && v.final.full === true);
v = vis([opening, U('u1', '[HUD FOO = ON]')]);
check('unknown group changes nothing', v.final === call('sixVisibility', [opening]).final || (v.final.profile === 'BASIC' && !Object.values(v.final.on).some(Boolean)));
v = vis([opening, U('u1', 'Here is what I will send later:\n```text\n[HUD = FULL]\n```')]);
check('commands in a code block are quotes, not commands', !Object.values(v.final.on).some(Boolean));
v = vis([opening, A('a0', '[HUD = FULL] is how you would enable everything.')]);
check('commands the bot writes are never applied', !Object.values(v.final.on).some(Boolean));
// a save, pasted into a new chat to continue
const saveNotes = (body) => '```text\n' + fullReply.split('\n***')[0] + '\n***\n```\n```text\n### SAVE NOTES ###\nSchema: MT-Standalone-2\nSystem revision: 2.5.3\n' + body + '\n***\n```';
v = vis([U('u1', 'Mushoku_Continue\n' + saveNotes('HUD style: Panel | Field profile: CUSTOM\nON: SKILLS, MANA\nOFF: IDENTITY, SCENE, POLICIES, GIFTS, DREAM, HEALTH, EQUIPMENT, INVENTORY, SOCIAL, BONDS, PATHS, CANON, NPCS'))]);
check('save notes: aware, CUSTOM groups', v.aware && v.final.profile === 'CUSTOM' && v.final.on.SKILLS && v.final.on.MANA && !v.final.on.BONDS);
v = vis([U('u1', saveNotes('HUD Fields: CUSTOM — BONDS: ON; SKILLS: OFF; MANA: ON'))]);
check('save notes: per-group flags', v.final.on.BONDS === true && v.final.on.SKILLS === false && v.final.on.MANA === true && v.final.on.IDENTITY === false);
v = vis([U('u1', saveNotes('Calendar profile: Themed'))]);
check('2.5.3 save with no field settings resumes BASIC', v.aware && v.final.profile === 'BASIC');
check('save style read by hudStyleFor', call('hudStyleFor', [U('u1', saveNotes('HUD Style: CARD'))]) === 'card');
// the card's own [HUD SETTINGS] and [HUD HELP] answers
v = vis([opening, U('u1', '[HUD SETTINGS]'), A('a1', 'HUD settings — style: Panel · profile: CUSTOM\nIDENTITY: OFF · SCENE: OFF · POLICIES: OFF · MANA: ON · SKILLS: ON · GIFTS: OFF · DREAM: OFF · HEALTH: OFF · EQUIPMENT: OFF · INVENTORY: ON · SOCIAL: OFF · BONDS: OFF · PATHS: OFF · CANON: OFF · NPCS: OFF')]);
check('[HUD SETTINGS] answer read', v.final.on.MANA && v.final.on.INVENTORY && !v.final.on.BONDS && v.final.profile === 'CUSTOM');
v = vis([opening, U('u1', '[HUD HELP]'), A('a1', greet.alternate_greetings[12] + '\n\nCurrent profile: BASIC (all optional groups OFF).')]);
check('[HUD HELP] answer: example commands not applied', v.final.profile === 'BASIC' && !Object.values(v.final.on).some(Boolean));

// 6. Answers to HUD commands carry no HUD by design
for (const t of ['[HUD SETTINGS]', '[HUD HELP]', '[HUD BONDS = OFF]', '[HUD SHOW BONDS]', '[HUD = PANEL]', '[HUD = BASIC]\n[HUD SKILLS = ON]', '[HELP]', 'Mushoku_Save'])
    check('control turn ' + JSON.stringify(t), call('sixControlTurn', t) === true);
for (const t of ['[HUD = SHOW]', '[HUD = BASIC] [HUD = SHOW]', 'I bow to the tutor. [HUD = PANEL]', 'Start at Arc 8', ''])
    check('story turn ' + JSON.stringify(t), call('sixControlTurn', t) === false);
const ctlChat = [opening, U('u1', 'Hello'), A('a1', basicHud), U('u2', '[HUD SETTINGS]'), A('a2', 'Profile: BASIC. All optional groups OFF.')];
check('control reply found', call('sixControlReply', ctlChat, ctlChat[4]) === true && call('sixControlReply', ctlChat, ctlChat[2]) === false);

// 7. The guard, through the shipped hmsProcessContent
const run = async (chat, content, prev) => (await acall('hmsProcessContent', 'c', content, prev, 'normal', {}, chat)).guard;
(async () => {
    const prevFull = call('parseHud', fullReply);
    let chat = [opening, U('u1', 'Start'), A('a1', fullReply), U('u2', 'I wait.'), A('a2', basicHud)];
    let g = await run(chat, basicHud, prevFull);
    check('guard: BASIC hides rows, flags none', g.missing.length === 0 && !g.swapped && g.hidden?.count === 18 && g.hidden.profile === 'BASIC');
    check('guard: hidden groups listed', ['BONDS', 'SKILLS', 'NPCS', 'IDENTITY'].every(x => g.hidden.groups.includes(x)));
    check('guard: Injuries ending is still "healed", not hidden', !g.hidden.groups.includes('HEALTH'));
    chat = [opening, U('u0', '[HUD = BASIC] [HUD BONDS = ON]'), A('a1', fullReply), U('u2', 'I wait.'), A('a2', basicHud)];
    g = await run(chat, basicHud, prevFull);
    check('guard: a group switched ON and left out is still flagged', g.missing.length === 1 && g.missing[0].key === 'bonds' && g.hidden.count === 17);
    const legacy = [U('u1', 'Start at Arc 8'), A('a1', fullReply.replace('[MT-ARC:8]', 'Arc 8: University [MT-ARC:8]')), U('u2', 'I wait.')];
    const legacyBasic = basicHud.replace('[MT-ARC:8]', 'Arc 8: University [MT-ARC:8]');
    g = await run(legacy, legacyBasic, call('parseHud', legacy[1].content));
    check('guard: legacy chat unchanged (swap or drops reported)', (g.swapped || g.missing.length > 0) && !g.hidden);
    // no HUD after a HUD command: not a render fault; after a story turn: still one
    g = await run([opening, U('u1', 'x'), A('a1', basicHud), U('u2', '[HUD SETTINGS]')], 'Profile: BASIC. Style: Panel.', call('parseHud', basicHud));
    check('guard: [HUD SETTINGS] answer is not a missing HUD', g.noHud === false);
    g = await run([opening, U('u1', 'x'), A('a1', basicHud), U('u2', '[HUD BONDS = OFF]')], 'Bonds will be hidden from the HUD.', call('parseHud', basicHud));
    check('guard: toggle answer is not a missing HUD', g.noHud === false);
    g = await run([opening, U('u1', 'x'), A('a1', basicHud), U('u2', 'I open the door.')], 'You open the door.', call('parseHud', basicHud));
    check('guard: story reply without HUD still flagged', g.noHud === true);
    g = await run([opening, U('u1', 'x'), A('a1', basicHud), U('u2', '[HUD = SHOW]')], 'Nothing.', call('parseHud', basicHud));
    check('guard: [HUD = SHOW] without HUD still flagged', g.noHud === true);

    // 8. Last known values: the timeline keeps hidden rows (display only)
    const e1 = { msg: A('a1', fullReply), hud: call('parseHud', fullReply) }, rawBasic = call('parseHud', basicHud), e2 = { msg: A('a2', basicHud), hud: rawBasic };
    chat = [opening, U('u1', 'Start'), e1.msg, U('u2', 'I wait.'), e2.msg];
    let tl = [e1, e2];
    call('sixVisFill', chat, tl);
    const keptKeys = (e2.hud.kept || []).map(l => l.key);
    check('kept: lasting rows carried', ['race', 'game mode', 'hud style', 'calendar profile', 'mana capacity', 'magic tiers', 'languages', 'training', 'dream link', 'module:DEMON EYE:foresight', 'equipment', 'inventory', 'standing', 'bonds', 'active paths'].every(k => keptKeys.includes(k)));
    check('kept: momentary rows not carried', !['current scene', 'npcs present', 'injuries', 'next canon event'].some(k => keptKeys.includes(k)));
    check('kept: rows marked and sourced', e2.hud.kept.every(l => l.kept && l.keptFrom === 'a1'));
    check('kept: the reply\'s own HUD untouched', e2.rawHud === rawBasic && rawBasic.lines.length === 6 && !rawBasic.kept);
    check('kept: essential rows from the reply itself', e2.hud.lines.filter(l => !l.kept).length === 6 && e2.hud.lines.find(l => l.key === 'arc').text.includes('[MT-ARC:8]'));
    // the Mushoku card reads them
    Object.assign(context, { isPlainObject: x => x !== null && typeof x === 'object' && !Array.isArray(x), mtManaTierLore: () => null, worldLore: () => null, worldSpellIndex: () => null, techIndexFromCatalog: () => null, spellIndexFromCatalog: () => null, mtEventLedger: () => [] });
    vm.runInContext(['worldMushoku', 'mtTraining', 'mtStanding'].map(fn).join('\n') + '\n' + ['MT_MAGIC', 'MT_MARTIAL'].map(constant).join('\n'), context);
    const w = call('worldMushoku', 'x', call('worldLines', e2.hud), {});
    check('world card: hidden mana and identity still shown', w.mana === 'Modest' && w.race === 'Human' && w.age === 18);
    check('world card: essentials from the BASIC reply', w.rudeusMode === 'Replacement' && w.period === 'Late afternoon' && w.month === 4);
    const wRaw = call('worldMushoku', 'x', call('worldLines', rawBasic), {});
    check('world card without fill would lose them (control)', wRaw.mana === null && wRaw.race === null);
    // a group switched ON and left out is not carried
    const f1 = { msg: A('a1', fullReply), hud: call('parseHud', fullReply) }, f2 = { msg: A('a2', basicHud), hud: call('parseHud', basicHud) };
    call('sixVisFill', [opening, U('u0', '[HUD BONDS = ON]'), f1.msg, U('u2', 'x'), f2.msg], [f1, f2]);
    check('kept: an ON group is not carried', !(f2.hud.kept || []).some(l => l.key === 'bonds') && (f2.hud.kept || []).some(l => l.key === 'mana capacity'));
    // Compact merges SKILLS into one row: when it prints that row, the Classic skill rows are not added back
    const compactHud = basicHud.replace('Condition: Stable', 'Skills: 🌪️ Wind — Elementary · 💧 Water — Intermediate\nCondition: Stable');
    const c1 = { msg: A('a1', fullReply), hud: call('parseHud', fullReply) }, c2 = { msg: A('a2', compactHud), hud: call('parseHud', compactHud) };
    call('sixVisFill', [opening, U('u0', '[HUD = COMPACT]'), c1.msg, c2.msg], [c1, c2]);
    check('kept: a printed group is not duplicated', !(c2.hud.kept || []).some(l => /magic tiers|languages|training/.test(l.key)));
    // the same through the shipped timeline reader (as every panel reads it)
    const tlChat = [opening, U('u1', 'Start'), A('a1', fullReply), U('u2', '[HUD = BASIC]'), A('a2', 'HUD set to BASIC.'), U('u3', 'I wait.'), A('a3', basicHud)];
    tl = call('hmsTimelineUncached', tlChat, 300);
    check('timeline: control answer is not a HUD entry', tl.length === 2 && tl[1].msg.id === 'a3');
    check('timeline: last entry carries hidden rows', (tl[1].hud.kept || []).some(l => l.key === 'bonds') && tl[1].rawHud && tl[1].rawHud.lines.length === 6);
    check('timeline: first entry is the reply as written', !tl[0].hud.kept);
    // legacy chats: no fill at all
    const l1 = { msg: A('a1', legacy[1].content), hud: call('parseHud', legacy[1].content) }, l2 = { msg: A('a2', legacyBasic), hud: call('parseHud', legacyBasic) };
    call('sixVisFill', [U('u1', 'Start at Arc 8'), l1.msg, U('u2', 'x'), l2.msg], [l1, l2]);
    check('kept: legacy chat untouched', !l2.hud.kept && !l2.rawHud);

    // 9. The new game builder leaves the HUD guide page out
    const cat = call('catalogRead', [opening]);
    check('catalog: HUD guide page is not a builder page', cat && !cat.pages.some(p => /Choose what you see/i.test(p.title)) && !cat.pages.some(p => p.items.some(i => /^(?:IDENTITY|BONDS|NPCS)$/.test(i.cmd))));
    check('catalog: the Six catalogs are all still there', cat && cat.pages.length === 11 && cat.handler === 'Mushoku_Start_Handler');
    check('catalog: guide page marked reference', call('catalogParsePage', greet.alternate_greetings[12], 13).reference === true);

    // 10. Styles: BASIC rows have no HUD Style row any more; the player's command and pasted saves decide
    check('style: BASIC keeps the chosen style', call('hudStyleFor', [U('u1', '[HUD = CARD]'), A('a1', basicHud), U('u2', '[HUD = BASIC]'), A('a2', basicHud)]) === 'card');
    check('style: BASIC/FULL/SHOW are not styles', call('hudStyleFor', [U('u1', '[HUD = BASIC] [HUD = FULL] [HUD = SHOW]')]) === null);

    new vm.Script(source, { filename: 'backend.js' }); check('backend syntax', true);
    require('child_process').execFileSync(process.execPath, ['--input-type=module', '--check'], { input: fs.readFileSync(path.join(root, 'dist/frontend.js'), 'utf8') }); check('frontend module syntax', true);
    const fe = fs.readFileSync(path.join(root, 'dist/frontend.js'), 'utf8');
    check('frontend shows hidden rows note', fe.includes('rows hidden by the bot\\u2019s HUD settings') && fe.includes("state.hms?.hudKept"));
    const failures = checks.filter(x => !x.passed), report = { checks: checks.length, passed: checks.length - failures.length, failures, scope: 'Shipped backend functions in an isolated VM against the 2.5.3 card fixtures (BASIC examples, real display regex, greetings, arc keys); hmsProcessContent run with storage and side-panel stubs. No network, model generation or live Lumiverse session.' };
    fs.mkdirSync(path.join(root, 'docs/compatibility/six-sided-v253'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs/compatibility/six-sided-v253/tests.json'), JSON.stringify({ report, checks }, null, 2));
    console.log(JSON.stringify(report, null, 2)); if (failures.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
