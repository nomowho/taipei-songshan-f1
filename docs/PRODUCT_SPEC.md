# Taipei Songshan F1 — Product requirements and creative intent

Status: **handoff / concept project**. Owner's primary need: make an interactive 3D experience, publish it, and share a URL with colleagues. Language: Traditional Chinese (Taiwan). English event labels may be included.

## 1. Vision

Reimagine **Taipei Songshan Airport** as a near-future Formula 1-style metropolitan circuit, presented through a premium, photorealistic-looking, interactive 3D masterplan. The airport and real urban surroundings should be immediately recognizable, not a generic fantasy megacity. Visual language: premium F1 broadcast / architectural visualization, restrained high-tech UI, sophisticated red/black/white accents, tasteful cyan/white night lighting, crisp camera motion, dense but plausible Taipei urban context. Avoid AI-looking architecture, arbitrary skyscrapers or implausible rivers.

## 2. User journey

- Colleague receives a public HTTPS link, opens it in desktop/mobile browser without creating an account or downloading an app.
- Page loads directly into a polished **20%-more-overhead bird's-eye** three-quarter view that makes the circuit legible.
- With mouse or touch, user can orbit freely, pan and zoom; explore the runway straight, hairpins, pit building, tower, stands, river and Taipei 101.
- One tap/click changes to preset perspectives: overall aerial, orthographic overhead, pit/paddock, west corners, east corners, city/Taipei 101, reset. A clickable track mini-map and landmark information are desirable.
- The experience stays fluid on mobile, has a graceful low-end fallback, and labels make clear it is an **unofficial conceptual design**, not an actual scheduled race.

## 3. Geography — important corrections from earlier visuals

- Scene based on **Songshan Airport (TSA / RCSS)** location and relative setting, NOT a fictional airport island or a transposed Taipei skyline.
- Actual runway is approximately **2,605 m**, roughly east–west. Distinguish real runway facts from made-up circuit geometry.
- Keelung River belongs **north of the airport** with realistic riverside road/bridges, not magically circling all four sides.
- Taipei 101 belongs **southeast of the airport**; from an overhead or northwest viewpoint, it should be correctly positioned/oriented and not placed due north or unrealistically close to the runway.
- Airport terminal/apron/control tower should occupy plausible locations; surrounding dense city fabric, roads/overpasses and mountains must respect real regional scale. Increase site fidelity with **real geospatial reference imagery/OSM building footprints/DEM** if feasible, obeying data licensing and attribution. If accuracy is not verified, label it conceptual.
- Preserve important site proportions; fictional turns and spectator spaces should not require silently destroying real residential districts. If track layout exceeds airport grounds, visualize and disclose this conceptual redevelopment assumption.

## 4. Circuit masterplan (fictional)

- A continuous, raceable-looking circuit using the runway as a signature high-speed straight and adding a varied series of slow/medium/high-speed turns.
- Ensure route makes one visually continuous loop: believable entry/exit, curbs, runoff, barriers, service lanes, marshal/service access and realistic pit entrance/exit.
- Pit straight, pit lane, paddock, garages, race control/media tower, large grandstands, pedestrian crossing and event hospitality areas.
- Make the circuit overview readable; the **mini-map should match the exact 3D route**, not an independently invented line.
- Circuit length/number of turns, longest straight and potential FIA safety requirements are **estimates** unless measured/verified. Existing draft displays a ~5.44 km concept track; recompute if geometry changes.

## 5. Interaction and UI (minimum functional contract)

| Action | Desktop | Mobile/tablet |
|---|---|---|
| Rotate/orbit | Left mouse drag | One-finger drag |
| Pan | Right mouse drag (or Shift + drag) | Two-finger drag |
| Zoom | Mouse wheel and +/- buttons | Pinch and +/- buttons |
| Presets | UI buttons | Large touch-friendly buttons |
| Theme | Day/night toggle | Day/night toggle |
| Visibility | Buildings + labels toggle | Buildings + labels toggle |
| Tour | Start/stop auto-orbit | Start/stop auto-orbit |
| Reset | Return to initial bird's-eye view | Same |

Keep camera movement eased, target and zoom bounded, UI readable. Touch must scroll/control map without unintended browser gestures. All toggles need visible state. Escape hatch if no WebGL or lost context. Keyboard navigation and accessibility labels are desirable.

## 6. Visual priorities

1. *Authenticity first*: Taipei geography, site scale, real materials and recognizable landmarks.
2. *Cinematic next*: blue-hour/night setting, believable floodlights, glass/metal paddock, controlled lighting; avoid excessive glowing neon.
3. *Professional event UI*: title `TAIPEI GRAND PRIX`, location `SONGSHAN AIRPORT CIRCUIT`, track schematic, legend, optional tasteful motion.
4. *Brand safety*: display `UNOFFICIAL CONCEPT / 非官方概念設計`. Do not claim official F1 endorsement, invent a sanctioned event date, or use unlicensed official marks in production. `references/visual_direction_poster.png` captures requested mood, **not approved factual copy**.

## 7. Reference images

- `references/visual_direction_aerial.png`: photorealistic *mood* reference for airport-circuit urban panorama. Geographical details are generative and may be inaccurate.
- `references/visual_direction_poster.png`: red/black/white promotional hierarchy and circuit-outline panel. Fictional date/round/metrics/markings, not actual event data.
- `references/current_webgl_overview.png`: screenshot of current programmatic scene overview.
- `references/current_webgl_pits.png`: screenshot of current scene pit-area view.

## 8. Prioritized backlog

**P0: shareable usable version**
- Retain existing 3D controls and all presets; remove crashing JS and mobile gesture issues if any.
- Publish to a **new, dedicated public GitHub repo** `nomowho/taipei-songshan-f1` if access is authorized, enable GitHub Pages, and verify an actual reachable HTTPS URL from a clean browser session.
- Keep demo live with explicit unofficial-concept disclaimer. Supply URL and quick usage guide.

**P1: geographic and aesthetic credibility**
- Audit airport site, river, 101, terminals and north orientation against credible mapping data.
- Replace at least key areas' invented building silhouettes/roads with more geographically faithful architecture; improve shader/material/lighting quality without sacrificing frame rate.
- Add detail for pit boxes, fencing, curbs, grandstands, floodlights, skyline and site landscaping.
- Improve camera default to show 20% more overhead compared with the original illustrative angle. Do not move Taipei 101 to an inaccurate quadrant to fit composition.

**P2: polished experience**
- Click/tap landmark markers for explanatory overlay (real vs fictional attribution).
- Optional cinematic flythrough, photo mode/screenshot button, toggle site layers and share-view URL parameter.
- Performance optimizations (instancing, LOD, optimized geometry or renderer choice); robust fallback; SEO/social metadata with honest concept description.

## 9. Explicitly not requested

- An actual FIA Grade 1 certification, civil engineering/safety approval, licensed official F1 promotion, ticket sales, a scheduled 2026 Taipei Grand Prix, or verified event dates. This is visual/concept design.

## 10. Acceptance

See `docs/QA_AND_DEPLOY.md`. “Done” means a real published interactive website that responds to mouse and touch, shows the correct general city/airport orientation, and honestly labels fictional aspects. A rendered video/image alone is not acceptable.
