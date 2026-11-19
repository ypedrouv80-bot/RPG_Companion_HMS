# HMS Reporter — Compatible 1.0 (Lumiverse)

Import `HMS_Reporter_Compatible.json` in Lumiverse's prompt preset importer. This is the adapted Reporter requested from the supplied original, distinct from the deliberately minimal `HMS_Compatible_MultiBot.json`.

Retained enabled: card/core/scenario/persona/examples, world-info slots, chat history, `{{memories}}` for the host's memory system, card post-history instructions, and the guarded `{{rpgc_request}}` Side panel slot. Host memory is independent of extension Observer mode; inspect the host memory configuration if old campaign facts are present there.

In RPG Companion HMS 1.6.0, Observer returns an empty Companion request. Active only requests the optional panel when **Optional companion JSON request** is enabled. The preset does not enable that setting itself, load missing lorebooks or generate absent HUD values. The request remains gated by the original OOC guard and the extension's start/control-turn checks.

Original prose/voice, Minds portrayal and fight-style blocks remain available but off by default. The old cached Minds state slot stays off (the current extension's Minds macro is empty). The adapted frame supports the card's own HUD dialect, including HP Chronicle; forced HUD prefills, model-specific tuning and visible planning are removed. Sampler overrides are off.

The minimal Multi-Bot preset is still an alternative; choose one preset, not both. This JSON is for Lumiverse, not SillyTavern. Original credits preserved in the preset metadata.

Validation: JSON parsing, preserved integration-slot content, exactly one request handshake, disabled prose options, empty prefill and absence of visible-planning macros in enabled blocks. No live importer/model session was performed.
