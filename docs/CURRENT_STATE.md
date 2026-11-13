> 2026-11-13 社群分享：Open Graph／Twitter 預覽圖改為使用者提供的 1672×941《臺北夜間大獎賽概念海報》，以新檔名更新分享網址。海報內 4.37 km／14 彎為視覺示意，與網站互動賽道數據不同；網頁仍標示非官方概念設計。

> 2026-11-13 排位賽進場：在「準備上場」提示使用電腦與鍵盤操作可獲得最佳體驗，並說明手機仍可觸控參賽。

> 2026-11-13 成績卡秒差：第 1 名顯示領先第 2 名秒數；只有一筆有效成績時明示暫無其他成績。其他名次維持顯示與榜首差距，並在排行榜回傳後更新。電腦鍵盤煞車僅用空白鍵；S／↓ 不再煞車，觸控煞車鍵維持可用。

> 2026-11-12 CTA1：排位賽入口改為紅底白字主按鈕，電腦 16px／52px 高，手機 14px／48px 高並加寬；調整手機右側工具與操作列間距。

> 2026-11-12 HANDS2：手機控制區左右互換，左側為煞車／起跑（手動模式含油門），右側為左右轉向；保留方向鍵內部的左、右順序。

> 2026-11-12 AUTO2：電腦版也預設自動油門，按「起跑」後只需鍵盤轉向與煞車；可切換手動。電腦與手機各自保存模式偏好。自動模式不使用 W／↑ 油門鍵；手動模式仍可使用。看板位置維持 MOBILE1。

> 2026-11-12 MOBILE1：手機預設收合 TOP 5／分段明細，保留 S1～S3 色條；新增可切回手動的自動油門，按起跑才加速、煞車優先。遠見與綠色通勤看板互換位置。詳見 [MOBILE1_RELEASE.md](MOBILE1_RELEASE.md)。

> 2026-11-11 BOARDS1：三張使用者原圖加入雙面賽道看板，涵蓋主直線後段與河岸回程；修正排位賽輸入名字時的背景繪圖負擔。詳見 [BILLBOARDS_RELEASE.md](BILLBOARDS_RELEASE.md)。

> 2026-11-11 QUALIFYING1：「單人試駕」改為「排位賽」，開始前輸入車手名字。新增 Sites／D1 跨裝置共用前五名，同名只留最快有效單圈；保留護欄碰撞有效。詳見 [QUALIFYING_RELEASE.md](QUALIFYING_RELEASE.md)。

> 2026-11-11 DRIVE2b：護欄碰撞改為只減速，不再取消圈速或分段成績；原本因救援、暫停、漏檢查點等原因無效的圈仍不計成績。

> 2026-11-11 DRIVE2a：依最新指示恢復原本試駕車大小及追車視角；保留平滑化、三段計時、加速與效能調整。

> 2026-11-11 DRIVE2：試駕車體放大 2 倍，修正固定步進與鏡頭造成的跳動、降低試駕繪圖負擔；加速提高 50%、極速上限 360 km/h。新增地圖共用邊界的 S1／S2／S3 計時與本機歷史紀錄黃綠紫比較。詳見 [DRIVE2_RELEASE.md](DRIVE2_RELEASE.md)。

> 2026-11-11 DRIVE1：新增單人試駕、追車鏡頭、鍵盤／多點觸控、車速圈速、護欄碰撞與救援。保留參觀模式；96 項測試通過。本階段未實作多人連線。詳見 [DRIVE1_RELEASE.md](DRIVE1_RELEASE.md)。

> 2026-10-13 E9：三座台北站獎盃改用專用拋光金屬材質，金色環帶與銀色塔身依視角呈現高光。使用解析式環境／展場燈光反射近似，未使用即時場景鏡面或光線追蹤；2D 備援沿用金銀配色。8 項材質、幾何及 framebuffer 測試通過；本機 3D 日夜畫面及 console 檢查正常。未做 iPhone 實機驗證。

> 2026-10-13 E8：Paddock 與航廈間新增 160 × 112 公尺概念頒獎廣場，含不對稱流線金屬拱頂、環形階梯、夜間燈帶、冠亞季軍台，以及結合台北 101 分節輪廓、金色環帶與河流意象的台北站展示獎盃。與既有建物至少約 45 公尺、賽道邊緣約 55 公尺（依場景幾何計算，非實地測量）。3D／2D 共用模型；修正招牌 P 字型與 2D 舞台地坪排序。17 項相關測試通過，地坪調整後另重跑 4 項幾何／碰撞測試通過；本機日夜、平移、縮放及 2D 備援檢查完成。保留既有 UI、維修區預設視角與非官方聲明；未做 iPhone 實機驗證。

> 2026-10-13 E7：Paddock 朝市區側新增 F1 FAN STORE 大型金屬曲頂紀念品店及 6 個周邊攤位（帽子、車衣、模型、頭盔、旗幟、禮品）。移除西端與東南側兩塊舊矩形碎石鋪面及各自外側短牆；3D、2D 共用配置。40 項相關測試通過；本機日夜、平移旋轉縮放與 2D 備援驗證正常，無 console error。此場景仍是非官方概念，非安全認證設計。

> 2026-10-13 E6：Paddock 前方兩側新增 6 攤小吃與 4 台麵包攤車，含條紋遮棚、暖色招牌、展示櫃、桌椅及 20 位攤販／顧客。3D 與 2D 共用模型，保留中央車庫通道。完整測試 85 項已通過（含新增模型與整個場景的碰撞檢查）；2026-10-13 經使用者確認後完成瀏覽器驗證：3D 日／夜景、平移與縮放、2D 備援及公開網站皆可顯示攤位，無 console error；中央車庫和 Pit Lane 保持暢通。未進行 iPhone 實機驗證。

> 2026-10-12 E5：基隆河標示改為 OSM 河道中心線座標（x=0、z≈757），高度貼齊河面；3D 與 2D 備援共用同一標示位置。

> 2026-11-13 排位賽體驗：新增依實際 7.4 公里賽道繪製的車輛位置／下一彎小地圖、五盞紅燈起跑、有效圈成績卡與「再跑一圈」；首頁補上 Open Graph／Twitter 分享資訊及 1200×630 夜景預覽圖。小地圖使用 `CircuitLayout` 路徑與彎道，不另維護賽道座標。名次依共用排行榜回傳更新，榜外僅顯示未進前五。

> 2026-10-12 E4：3D 與 2D 備援首次開啟均直接定位維修區／起跑區，初始相機及按鈕同步，無全區飛入動畫。

> 2026-10-12 E3 樹高、圓山飯店、精簡資訊與 iOS 相容設定請以 [E3_RELEASE.md](E3_RELEASE.md) 為準。

> 2026-10-12 E2 資訊屏、雙面看板與細節縮放請以 [E2_RELEASE.md](E2_RELEASE.md) 為準。

> 2026-10-12 最新 E1 景觀與賽事設施更新請以 [E1_RELEASE.md](E1_RELEASE.md) 為準。

> 2026-10-11 最新 D1 場館、維修區與飛機船艇更新請以 [D1_RELEASE.md](D1_RELEASE.md) 為準。

> 2026-10-11 C1 配置與起跑設施請以 [C1_RELEASE.md](C1_RELEASE.md) 為準。

> 2026-10-09 最新 B1 操作、加寬賽道與觀賽空間更新請以 [B1_RELEASE.md](B1_RELEASE.md) 為準。

> 2026-10-09 A1 配置與地標更新請以 [A1_RELEASE.md](A1_RELEASE.md) 為準；以下為歷史交接紀錄。

> 本文件記錄原始交接狀態。2026-10-08 接手修正及已完成部署的狀態請以 [RELEASE_QA.md](RELEASE_QA.md)、[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) 及後續 [MATERIAL_UPGRADE.md](MATERIAL_UPGRADE.md) 為準。材質版本新增同目錄的 `materials.js`，部署時不可遺漏。

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
