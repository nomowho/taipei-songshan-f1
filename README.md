# TAIPEI GRAND PRIX — 台北松山機場互動式 3D 概念賽道

**非官方概念設計 / UNOFFICIAL CONCEPT**。並非真實賽事，未宣稱 Formula 1 官方授權或 FIA 認證。

沿用既有自製 WebGL 場景，無需安裝套件，無外部 JavaScript 或素材請求。保留旋轉、平移、縮放、四個視角（全區、維修區、西側、東側）、日夜切換、建築／地標切換、自動環繞與同步賽道小地圖。

材質更新：住宅磁磚、玻璃帷幕、屋頂設備、金屬板、瀝青、水泥鋪面、樹冠與動態水面。`materials.js` 在本機產生原創貼圖並處理光照／投影；部署時須與 `index.html` 一起上傳。詳見 `docs/MATERIAL_UPGRADE.md`。

最新調整：手機小地圖上移、iPhone 相容繪圖路徑、無格線清水模、金屬及玻璃帷幕車庫、夜間屋緣燈條、8 台停放賽車與 20 個交錯起跑格。檢查紀錄及真機驗證限制見 `docs/MOBILE_AND_PIT_UPDATE.md`。

## 操作

- 本機：`python -m http.server 8000`，開啟 `http://localhost:8000/`。
- 左鍵／單指拖曳旋轉；右鍵或 Shift 拖曳／雙指拖曳平移。
- 滾輪／雙指開合／加減按鈕縮放。
- WebGL 模式方向鍵旋轉、`+` / `-` 縮放、`0` 重設。
- WebGL 不可用時進入 2D 備援；也可在網址加上 `?renderer=2d`。

## 發布

專用儲存庫：`nomowho/taipei-songshan-f1`。GitHub Pages 使用 `main` 分支根目錄，`.nojekyll` 關閉 Jekyll。

公開網站：[開啟 TAIPEI GRAND PRIX](https://nomowho.github.io/taipei-songshan-f1/)

2026-10-08 已驗證 Pages 建置成功、匿名 HTTP 200 與瀏覽器 3D 載入。測試範圍與限制見 `docs/RELEASE_QA.md`。

## 測試與限制

`node --test tests/*.test.cjs`

場景仍為程序化概念沙盤，非照片級模型；場地、街廓、橋梁、賽道改建及安全空間不代表真實工程可行性。未使用參考海報中的虛構日期、輪次或官方標誌。參考圖保留在本機交接檔案，未公開提交。

詳見 `docs/PRODUCT_SPEC.md`、`docs/IMPLEMENTATION_NOTES.md` 與交接檢核文件。
