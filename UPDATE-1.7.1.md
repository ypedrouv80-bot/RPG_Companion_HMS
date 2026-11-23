# 1.7.1 — Saga dates and grouped magic ranks

- Fixed the Mushoku saga panel printing K.null/K.0 when the arc catalog has no dated schedule.
- Preserve an explicitly reported campaign year when its month/day is approximate. Exact calendar arithmetic still requires a supported full date; no day or month is invented.
- An undated catalog now displays a route list, not a dated timeline. A missing next date no longer becomes “the last arc”. Route order does not mark events completed.
- Correct branch selection/highlighting and ordering, including Arc 4-B.
- Preserve original HUD values, selected Observer/Active behavior, storage, credits and compatibility profiles. This patch does not correct canonical facts written incorrectly by a model: a reported K418 remains reported K418.

## Install

Update the existing RPG Companion HMS extension using its GitHub source when this version is published, or import the 1.7.1 ZIP manually. Keep the same identifier and storage; do not run duplicate copies. Restart/reload the extension runtime and reread the selected reply. No new prompt/preset is required. Your installed copy was not modified by the development build.

## Validation

792 local checks passed: whole-backend mock Spindle tests, real reader functions, mock-DOM rendering, old/new HUD fixtures, partial dates, unknown dates, genuine dated timelines, branch display, Observer/Active noninterference and persistent HUD behavior. No real browser/runtime/model session was executed.

The supplied raw swipe confirmed two separate issues: the model itself wrote the reported date/location/ranks, and the reader dropped grouped rank-first magic. The reader now splits Elementary-ranked water, earth, wind, fire and Intermediate healing/detox, preserving the reported levels and self-taught note. Advanced-level aptitude alone grants no learned rank. English ordinal dates such as Seedtide 12th are supported.

Credits preserved: TenderTriper (Perch), Marinara, Wireless (Ryah), Pyropia and the contributors named in the project.
