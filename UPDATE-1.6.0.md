# 1.6.0 — Multi-bot HUD profiles and optional preset

- Added reading profiles for the supplied Living World cards, retaining each world's own fields and rank vocabulary.
- Added Harry Potter Chronicle delimiters and English/Russian field labels.
- Added separate Danganronpa routing metadata with malformed-marker handling; no invented location/abilities or claim of lore activation.
- Read Campaign Arc and compact mixed arc/location rows.
- Recognized explicit world-prefixed Start_Handler commands as campaign boundaries.
- Added a selectable compatibility profile in the mode controls.
- Added the optional HMS Compatible Multi-Bot Lumiverse preset, with no model-specific prefill or forced narrative style. Existing presets remain usable.
- Arc chapter display names now use the source HUD when available, preserving user-edited titles.
- Corrected the displayed backend and drawer version labels.

See compatibility/README.md for world-by-world scope and preset instructions. Preserve storage and restart/reload the extension after updating.

Validation: existing 618 checks plus 60 multi-bot/backend checks; native SillyTavern adapter has 57 separate simulated checks. These are not live Lumiverse/SillyTavern/model certifications. Canon accuracy and full mechanical parity across worlds are not claimed.

Credits: TenderTriper (Perch), Marinara, Wireless (Ryah), Pyropia and other contributors named in the original project. Compatibility adaptation requested by Mazaki.
