# Project guidance for Codex — Taipei Songshan Grand Prix 3D

- Reply to the user in Traditional Chinese (Taiwan terminology). User needs a **working, publicly shareable interactive 3D site**, not a static poster.
- Read `docs/PRODUCT_SPEC.md` before major feature work, `docs/CURRENT_STATE.md` when modifying rendering or layout, and `docs/QA_AND_DEPLOY.md` before delivery/deployment. These files are the project source of truth.
- Start with the existing working `index.html`; keep it usable while improving fidelity. Do **not** discard functionality or replace the interactive scene with a flat image/video.
- Geographic orientation matters: Songshan airport runway is roughly east–west; Keelung River is to the north; Taipei 101 is southeast of the airfield. Treat procedurally generated city blocks as placeholders, not surveyed GIS data. Validate factual measurements against credible sources before asserting them.
- Prioritize: (1) preserve interactions; (2) reliable public deployment; (3) accurate geography/layout; (4) richer photorealistic presentation; (5) performance and accessibility.
- Conceptual track and event only. Prominently display `非官方概念設計 / UNOFFICIAL CONCEPT` in the live web UI. Do not present this as a sanctioned Formula 1 event or an FIA-certified course. The poster in `references/` is visual inspiration **only**; its date, round, length and branding claims are fictional and must not be published as real facts. Do not assume trademark permission for official F1 logos.
- For complex refactors, explain the plan first; run relevant smoke tests before declaring completion. Capture desktop/mobile screenshots if browser tooling is available. Preserve default mouse, touch, keyboard, and UI controls.
- Do not commit secrets or invent URLs, deployment success, browser tests, or real-world map accuracy. Publishing requires the user's own account authorization where necessary.
- When done: report changed files, commands/tests and outcomes, working public URL (if actually verified), deployment blockers (if any), and clearly separate implemented work from proposed work.
