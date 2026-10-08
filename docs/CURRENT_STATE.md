> 本文件記錄原始交接狀態。2026-10-08 接手修正及已完成部署的狀態請以 [RELEASE_QA.md](RELEASE_QA.md) 與 [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) 為準。

# Current code and handoff reality

## Available source

- `index.html`: self-contained static HTML/CSS/JavaScript; one `canvas#view` for interactive **custom WebGL** rendering, with **2D fallback** when WebGL unavailable. No NPM scripts or external JS imports in the current version.
- `.nojekyll`: GitHub Pages compatibility convenience.
- `references/`: design renders/poster + two screenshots of previously tested scene.
- No original photogrammetry, orthophoto textures, imported 3D assets, architectural CAD, real aerial basemap, map API keys or licensed F1 media are provided.

## Current features found in code

- Orbit (left mouse / 1 touch), pan (right mouse / 2 touches), wheel/pinch zoom and +/- buttons.
- Preset views `overview`, `top`, `pits`, `west`, `east`, `city`, `reset`.
- Toggles: night/day (`#night`), buildings (`#buildings`), landmark labels (`#labels`), auto-spin (`#auto`).
- Procedural track via Catmull–Rom anchor points and a synced mini-map; estimated loop length computed in JS.
- Runway/apron/terminal approximations, procedural city buildings, river, a simplified 101 landmark, small animated cars, spectators/stands/lighting.
- Informal “unofficial concept / not FIA-approved” disclosures in UI and README.

## Limitations and cautions

- The geometry is schematic and generated from hard-coded coordinates; it is not survey-grade or photorealistic, and some real-world locations/materials may be inaccurate.
- Current UI can look dense on smaller devices; recheck with real mobile viewport and WebGL performance.
- Prior assistant supplied a temporary HTML file and generated ZIPs. **No successfully published GitHub Pages site or verified public URL is established in this handoff**.
- GitHub connector was previously installed only for organization `lifehacker-tw` with no push permission to the needed repo. User account is `nomowho`, but a new personal repo and access authorization have **not** been verified. Codex should ask for the minimum required user authorization instead of claiming deployment.
- Prior image poster includes a fictional `NOVEMBER 2026` date, `ROUND 23`, `5.621 KM`, `16 TURNS`, `1.2 KM` longest straight and F1-style official branding. Do NOT present these as actual event facts. In-code loop may report ~5.44 km, not 5.621 km.

## Recommended code evolution

- First deploy **working current static site** without rebuilding, then improve incrementally. To extend significantly, modularize scripts and add tests; Three.js or a higher-level renderer is optional, NOT mandatory.
- Any external library, basemap or 3D data must have explicitly documented source, licensing, attribution, loading strategy and offline/failure behavior.
- Performance goals are aspirational, not verified current state: target smooth interactions on mid-range mobile and desktop, control texture sizes and frame pacing.
