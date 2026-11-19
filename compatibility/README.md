# Multi-bot compatibility — 1.6.0

## What is supported

The extension reads emitted state; installing a profile does not activate lorebook entries, add spells, rewrite a card or certify canon accuracy. Profiles are optional reading preferences, not model/personality overrides. Automatic detection uses explicit HUD signatures and can fall back to generic HMS.

| Profile | Input / scope |
|---|---|
| Mushoku Tensei | WORLD STATE, Panel/Collapsed, full sections, named magic/sword ranks |
| DanMachi | WORLD STATE; Falna, Tracks, chronology and other fields retained as written |
| Roshidere | Campaign Arc, chronology, school location and relationship/thread rows |
| Jujutsu Kaisen | Grades, cursed techniques and CE fields; not converted to Mushoku tiers |
| Assassin's Creed | WORLD STATE, location paths, synchronization and identity rows |
| Frieren | AHP dates, mana, grimoire, party and canon-event text |
| KonoSuba | Compact mixed arc/day/location row and pending gift/class fields |
| Classroom of the Elite | Arc branches, school/cohort/standings and private points |
| Overlord | Racial/job levels, classes, HP/MP and ability text |
| Harry Potter | [HP_LW_HUD] ... [/HP_LW_HUD], English and Russian labels |
| Danganronpa | Separate DR_CURRENT, DR_STORY_CURRENT and DR_WORLD_CURRENT metadata; no fabricated HUD |
| Cyberpunk | Generic WORLD STATE reading and Cyberpunk field/signature profile; no new card-level audit in this release |
| Baldur's Gate 3 | Generic WORLD STATE reading and BG3 field/signature profile; no conversion of spell slots to magic ranks |

The supplied Danganronpa files are lorebooks, not a complete narrator card. Its selectors are shown behind a disclosure because they may contain spoilers. A marker is not proof that its entry reached the model. Malformed newest markers are not replaced with older values.

## Presets

`preset/HMS_Compatible_MultiBot.json` is an **optional Lumiverse prompt preset** using the existing import schema. It carries card/persona/world-info/history slots, disables sampler overrides and removes model-specific prefills, forced prose rules and legacy Companion context macros. Importing a prompt preset changes your prompt setup; it is not necessary to enable HUD reading. Keep your own preset if preferred.

The extension's **Compatibility profile** selector is a separate setting. Choose Automatic or a world; it labels/interprets visible data without loading lore. `compatibility/profiles.json` documents the available IDs; it is not a prompt preset import.

`preset/HMS_Compatible_Instructions.txt` is a short optional instruction block for manual use with an existing preset on either host. The old HMS Reporter beta remains available as a historical file, not the default recommendation.

## Source review and limits

Reviewed the supplied JSON cards/lorebooks, the Harry Potter RAR, and the Assassin's Creed PNG metadata. The second Jujutsu file duplicated the same named card. The provided Frieren PNG path was unavailable; the attached Frieren JSON was reviewed instead. Third-party cards and full lorebooks are not redistributed by this update. Credits from the original HMS project remain intact; compatibility does not imply endorsement by other bot creators.

Tests use synthetic fixtures plus local inspection/replay of supplied HUD examples. Passing reader tests is not a live session certification or validation of every world mechanic, catalog spell or model output. The SillyTavern repository is a native tracking edition, not a complete port of Lumiverse simulation tools.
