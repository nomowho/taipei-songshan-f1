# Release checklist, manual QA and GitHub Pages deployment

## Manual acceptance matrix

Desktop Chrome/Edge/Safari (as available):
- [ ] Site loads at its public HTTPS URL in a private/incognito session (not a locally authenticated editor).
- [ ] WebGL shows the 3D scene, no uncaught errors or missing resources in browser console.
- [ ] Left-drag rotates smoothly; right-drag pans; wheel zooms; zoom clamps safely; reset returns to start.
- [ ] All camera preset buttons target reasonable visible areas with no below-ground or disorienting jump.
- [ ] Mini-map matches route geometry; appears in correct layout and at device pixel ratio.
- [ ] Day/night, buildings, landmark labels, auto-orbit, + and - buttons work and update their active state.
- [ ] Public landing page identifies this as an unofficial concept, not a scheduled real Formula 1 event.

Mobile iOS Safari / Android Chrome (as available):
- [ ] Single-finger orbit, two-finger pan, pinch zoom; 3D gestures do not accidentally change page zoom.
- [ ] Buttons are tappable and not hidden behind safe areas, labels or overlay panels.
- [ ] Orientation / resizing / refresh do not break rendering; acceptable frame rate and memory.
- [ ] Graceful notice/fallback for WebGL unavailable / context lost, if testable.

Geographic and fact QA:
- [ ] Airport runway aligned east–west and accurately labeled as a concept retrofit.
- [ ] River north of airport; Taipei 101 southeast; correct rough site/landmark proportions.
- [ ] No factual claim about FIA safety homologation or sanctioned race.
- [ ] Dates, round numbers, track length and sponsor/official logos are not invented as factual claims.

## Deployment plan

Preferred target: **`nomowho/taipei-songshan-f1`** (new public repo dedicated to this concept; do not overwrite any unrelated user repo).

1. Confirm user's GitHub repository exists and Codex environment has **write permission** to that exact repo. If not, pause only the publish step and request GitHub authorization. Do not request access tokens in chat.
2. Commit the repo contents with descriptive messages; ensure `index.html` in repository root and `.nojekyll` present.
3. Configure GitHub Pages → Deploy from branch (default branch / root), or a tested Pages Actions workflow, using supported access.
4. Wait for success and validate the actual public URL from an unauthenticated browser. Expected pattern if repo and Pages are configured: `https://nomowho.github.io/taipei-songshan-f1/` — **not confirmed live until tested**.
5. Send exact repository URL, live URL, commit SHA, mobile/desktop test summary and unresolved issues.

## If permissions block publication

- Keep all source and instructions in repo/ZIP, and give the user exact GitHub authorization step or repo selection needed.
- Do not substitute an invented link or claim it has been published.
