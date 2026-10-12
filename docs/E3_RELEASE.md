# E3 景觀比例、資訊欄與 iOS 繪圖調整（2026-10-12）

- 320 棵內場樹木高度減半：60–120 m → 30–60 m，保留六種樹形、原位置與冠幅。離線配置及重新計算路徑同步更新。
- 圓山飯店移除三級基地、平台與階梯，保留建築本體及屋頂；本體下移接地，沒有懸浮。保留五倍展示比例。
- 資訊卡只保留賽道路線、長度與圈數。刪除預估單圈、最高速目標、彎道／車隊、Pit Lane、概念估算、視角介紹與夜賽概念文字。非官方概念標示及圖資／品牌聲明保留。
- iPhone／iPad 的 WebGL 關閉 preserveDrawingBuffer，持續逐幀完整清除色彩及深度；保留原有停用陰影及抗鋸齒的相容設定。這是可回退的相容性調整，不宣稱已證實手機殘影的根因。

## 驗證與限制

- `node --test --test-concurrency=1 tests/*.test.cjs`：83/83 通過（13.47 秒）。
- 桌機瀏覽器相容模式＋390×844 畫面已操作旋轉、平移、縮放及日夜切換，沒有 console error，觀察中無黑色殘影。
- 本環境無實體 iPhone Safari，尚未確認真機殘影消失；已詢問使用者殘影是否在停止手勢後仍存在。
- 根據 [WebGL 規格](https://registry.khronos.org/webgl/specs/latest/1.0/)，preserveDrawingBuffer 預設為 false；場景本來就逐幀重繪，無須保留已呈現畫面。[WebKit 歷史問題](https://bugs.webkit.org/show_bug.cgi?id=159608) 僅作排查參考，不作為目前 iPhone 問題的證據。
- Pages 已成功建置功能 commit `6b3fa137d6adc8284b17113e8864763b6affd8e8`。13 個公開資產 HTTP 200 且逐位元組符合提交內容。
- 公開網址 https://nomowho.github.io/taipei-songshan-f1/?release=e3 已在瀏覽器確認 LIVE 3D、精簡資訊卡、日夜切換，無 console error。
