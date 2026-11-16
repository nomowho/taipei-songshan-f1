> 2026-11-16 共用排行榜擴至 TOP 10：後端合併舊版與現行版有效成績，每位車手只列最快圈；賽車畫面與完賽卡同步改為前十名判定。榜單超出畫面時可捲動，手機仍預設收合。

> 2026-11-16 手機與統計：排位賽入場提示手機可轉橫式；手機直式進入賽車畫面時顯示可關閉的橫式建議。新增可切換且記住選擇的合成音效（引擎、五燈、碰撞、完賽），預設關閉且不自動播放。賽道頁新增匿名瀏覽計數；現有 Sites／D1 服務另提供公開的每日瀏覽與約略獨立瀏覽器統計頁。統計不送出車手名字或 IP，遵守瀏覽器 Do Not Track；上線後才開始累計，無法追補歷史流量。

> 2026-11-16 資產與排位賽：蔣萬安與沈柏洋兩面賽道看板改為 1024×576 WebP（合計約 220 KB）；社群預覽改為 1200×675 JPEG（約 206 KB），移除三張舊預覽圖及兩張原始看板 PNG。車輛離開柏油路只會減速，只有碰到該側實際設有護欄的位置才觸發碰撞；護欄碰撞仍可繼續計算有效圈速。輸入車手名字時可選紅、黑、白、橘、藍、綠、粉紅七種車色，車體增加前後翼、側箱、進氣口、底板與外露輪胎細節。此為遊戲化概念模型，不代表特定車隊實車。

> 2026-11-16 賽道看板：移除遠見旅行箱看板及其圖片素材，保留綠色通勤與台北競速看板；WebGL 與 2D 備援版共用兩面看板設定。

> 2026-11-16 排位賽操作與成績卡：在「重新起跑」左側新增圖示暫停／繼續鍵；手動暫停凍結車輛與圈速，恢復後同一圈仍有效，離開分頁或視窗失焦仍會中止本圈。完賽卡以剛完成的圈速（千分之一秒）計算與共用榜首的差距，完賽卡名次比較該圈與其他車手最佳圈；共用排行榜仍依每位車手個人最佳成績。按「再跑一圈」後停在起跑準備狀態，必須再按「起跑」才開始五燈倒數。

> 2026-11-16 區段顏色修正：紫色改為超越所有車手「已提交的有效單圈」S1／S2／S3 各段最短時間，後端從所有驗證通過的圈速紀錄計算，包含未進前五名與非個人最快單圈；共用排行榜仍只列每位車手最快單圈。綠色表示本機此賽道區段紀錄改善，黃色表示未改善。全場資料尚未載入時不假裝有紫色。

> 2026-11-16 排位賽介面：依使用者截圖移除賽車畫面中浮動的下一彎資訊卡（箭頭、彎號、目標速度、距離、煞車文字及外框）。賽道旁的實體發光方向牌保留。

> 2026-11-15 入彎指引強化：22 彎的賽道旁預告牌由約 9.5 m 擴至 13.5 m，雙箭頭改為夜間發光材質，深色底板增加紅色頂條與青色發光邊框；長直線彎前可提早到 170 m，連續彎依相鄰彎距縮短至至少 90 m，避免順序錯亂。駕駛畫面同步改為大尺寸左右箭頭、彎號與距離，煞車提示以紅色凸顯。共用 3D／2D 賽道幾何不變。

> 2026-11-15 iPhone 排位賽觸控：以本機觸控事件測試重現兩個問題：煞車按鍵收到 `pointercancel` 會直接中止本圈、搖桿意外失去指標擷取後同一根手指移動無法再轉向。修正為按鍵取消只釋放該按鍵；搖桿持續由文件層追蹤，直到手指放開／取消，真正切離頁面仍中止本圈。尚待 iPhone Safari 實機驗證。

> 2026-11-15 iPhone 參觀模式：下方視角與模式按鈕加上 `touch-action:none`，阻止 Safari 將連點按鈕解讀為頁面雙點觸放大；3D 畫布原有單指旋轉、雙指縮放不變。尚待 iPhone Safari 實機確認。

> 2026-11-15 iPhone 橫向排位賽：TOP 5 成績面板避開左側動態島及安全區域，保留單一共用排行榜。iOS Safari 若仍顯示「新版／舊版」兩張榜單，表示分頁仍載入舊版腳本，需重新整理。

> 2026-11-15 排行榜修正：排位賽側邊欄只顯示一張共用 TOP 5，合併舊版與新版有效圈速，依時間排序，同名車手只保留最快單圈。兩版本原始成績仍各自保存在資料庫；提交新圈速仍使用目前版本。

> 2026-11-15 操控調校：手機維持預設自動油門、可切手動；煞車後油門約 0.3 秒逐步回到全開。300 km/h 煞停實測由約 69 m 改為約 87 m。排位賽依下一彎、目前速度與煞車距離顯示「準備煞車／現在煞車」及概念目標速度。新增穩定／標準轉向，手機預設穩定、電腦預設標準，兩者可切換且保留最大舵角。新版成績用 `taipei-handling-v2` 榜單，舊成績保留在原版本。133 項前端測試及 9 項後端測試通過；桌機、手機直式與橫式 Chromium 預覽已檢查，尚未以 iPhone Safari 實機驗證。

> 2026-11-15 iPad／iPhone 畫面空間：新增 `manifest.webmanifest`、主畫面圖示與 Apple 網頁 App meta，讓 Safari「分享 → 加入主畫面 → 以網頁 App 開啟」可在獨立視窗開站，移除 Safari 網址與分頁列。支援 Fullscreen API 的觸控平板在排位賽顯示「全螢幕」按鈕；返回參觀時退出全螢幕。修正橫式高度增加後操作按鈕被拉滿整列的 CSS。已以 Chromium 觸控模擬驗證進出與版面；尚未用 iPadOS／iOS Safari 實機驗證。一般 Safari 分頁無法由網站自行永久隱藏瀏覽器工具列；網頁 App 需使用者親自加入主畫面。

> 2026-11-15 入彎方向提醒：22 個彎的左右方向由共用賽道線前後 45 公尺曲率計算，3D 與 2D 備援共用；每彎在前方 90 公尺與彎心各設一塊賽道旁紅白方向牌（共 44 塊），牌面高過護欄；T1 因北側大型看板遮蔽，彎前牌改設南側。T1／T7／T10／T11／T16／T20 前另設 150／100／50 公尺距離牌。排位賽於彎前 300 公尺內顯示彎號、方向及距離，接近 150／50 公尺時換色。參考 FIA 賽事文件的煞車距離牌與方向箭頭照片，僅作概念視覺，不代表 FIA 認證。未於 iPhone Safari 實機驗證。

> 2026-11-15 手機排位賽新增第一人稱：排位賽上方可在駕駛座與追車視角間切換，不會重新起跑或更改計時。鏡頭跟隨既有平滑車輛位置，不增添晃動或額外繪圖通道；手機直式與橫式已驗證按鈕和畫面，尚未以 iPhone Safari 實機驗證。

> 2026-11-15 手機排位賽搖桿：觸控擷取失敗或手指滑出搖桿時，改由頁面層級繼續追蹤移動及放開／取消事件；新觸控可接手舊指標，避免方向卡住。轉向拖曳距離增加 10% 才達滿舵，降低小幅滑動時的靈敏度，同時保留滿舵能力。已用 Chromium 手機模擬重現並驗證；尚未以 iPhone Safari 實機驗證。

> 2026-11-13 手機排位賽：隱藏排位賽中的「賽道位置」小地圖，減少對駕駛視野的遮擋；控制改為左側圓形搖桿、右側大圓煞車，起跑／手動油門鍵在煞車內側。電腦排位賽和參觀模式的賽道示意圖仍顯示。

> 2026-11-13 手機排位賽控制：右側兩顆方向鍵改為圓形類比搖桿，水平拖曳可調整轉向強度，放手回中；左側煞車改為大圓形按鍵，保留兩指同時轉向／煞車及自動油門。排位賽移除暫停／救援按鈕與 P／R 快捷鍵；切換 App 或分頁將中止本圈，須重新起跑。

> 2026-11-13 社群分享：Open Graph／Twitter 預覽圖改為使用者提供的新版 1672×941《臺北夜間大獎賽概念海報》，賽道數據 7.402 km／22 彎與目前 `CircuitLayout` 相同；新檔名可避免沿用上一張圖片快取。網頁仍標示非官方概念設計。

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
