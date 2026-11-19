# RPG Companion HMS 1.7.0

- Fixed WORLD STATE parsing across blank lines, bold section headings and internal dashed dividers. The reported salon fixture now yields all 40 rows, including Bonds and NPCs Present, instead of five.
- Recognizes a shared magic rank in Earth/Water/Fire/Wind (Imperial).
- Adds optional **Persistent HUD**: stores/replays the complete state and accepts revision-checked changed-row updates. An omitted row never deletes a field. Unknown IDs, stale revisions and malformed updates trigger a full-state recovery request in Active mode.
- Chat rendering can hide full HUD/update envelopes while retaining the original message for replay and export.
- Observer remains prompt-free. Active persistence sends one current-state snapshot and omits recognized earlier HUD copies from the outgoing assistant history; no extra model call is added.
- Persistent mode is off by default and currently targets HMS WORLD STATE HUDs. Other compatibility profiles retain their existing reader.

## Enable
Update/restart the extension, then enable **HUD persistente** in the companion settings. Choose Active if this extension should request updates. Choose Observer if another writer (the Megumin fork) produces them. Enable only ONE update writer.

The first response must contain a complete original HUD. Later replies may contain RPGC_UPDATE changes. New fields or a rejected update require another complete HUD. To return to ordinary HUD output, disable persistence and ask for the full HUD again.

Use the existing HMS_Reporter_Compatible.json preset if you use the Reporter integration. It does not need a separate model or a second automatic generation. Current state still consumes context; this feature avoids repeated full-state output, not all state tokens.

## Validation
735 assertions across seven backend/UI-mock suites, including 57 sectioned/persistent HUD checks. No live Lumiverse UI session or real model generation was evaluated for this release. Persistent updates are opt-in and should be tried on a copied chat first.

Credits and the original project license are preserved. The newly authored compatibility/state-ledger.js module is MIT licensed.
