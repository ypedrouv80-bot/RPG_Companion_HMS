# Compatibility validation

Run the four commands documented in `../UPDATE-1.5.0.md` with Node.js. No package install is required. Tests use local fixtures; no user chat exports, storage, authentication data or novel text are included.

`observer-active.cjs` evaluates the entire shipped backend in a mock Spindle host and invokes its registered interceptor/macros/events/actions. It verifies noninterference, state isolation, exact HUD sources, optional active requests and immutable reply text. `observer-ui.cjs` evaluates the shipped UI helpers with a minimal DOM, including safe text nodes and the mode selector. These are not live browser or model tests.

Backend and frontend distribution files are the maintained source in this repository, as in the baseline release. The SAFE_COMPANION section documents the new read/prompt boundary. Do not enable a second old copy of the extension alongside this one.

1.5.3: `node tests/hud-consumers.cjs` valida os cartões finais, três formatos de HUD e capítulos; observer-ui também testa gerações familiares em português/inglês.
