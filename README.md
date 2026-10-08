# TAIPEI GRAND PRIX — 台北松山機場互動式 3D 概念賽道

**非官方概念設計 / UNOFFICIAL CONCEPT**。並非真實賽事，未宣稱 Formula 1 官方授權或 FIA 認證。

沿用既有自製 WebGL 場景，無需安裝套件，無外部 JavaScript 或素材請求。保留旋轉、平移、縮放、七個視角、日夜切換、建築／地標切換、自動環繞與同步賽道小地圖。

## 操作

- 本機：`python -m http.server 8000`，開啟 `http://localhost:8000/`。
- 左鍵／單指拖曳旋轉；右鍵或 Shift 拖曳／雙指拖曳平移。
- 滾輪／雙指開合／加減按鈕縮放。
- WebGL 模式方向鍵旋轉、`+` / `-` 縮放、`0` 重設。
- WebGL 不可用時進入 2D 備援；也可在網址加上 `?renderer=2d`。

## 發布

專用儲存庫：`nomowho/taipei-songshan-f1`。GitHub Pages 使用 `main` 分支根目錄，`.nojekyll` 關閉 Jekyll。

部署狀態與實際驗證見 `docs/RELEASE_QA.md`（發布驗證後更新）。未出現驗證紀錄前，不應把預期網址視為已上線。

## 測試與限制

`node --test tests/*.test.cjs`

場景仍為程序化概念沙盤，非照片級模型；場地、街廓、橋梁、賽道改建及安全空間不代表真實工程可行性。未使用參考海報中的虛構日期、輪次或官方標誌。參考圖保留在本機交接檔案，未公開提交。

詳見 `docs/PRODUCT_SPEC.md`、`docs/IMPLEMENTATION_NOTES.md` 與交接檢核文件。
