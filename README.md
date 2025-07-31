````markdown
# WEBTEST 自動化測試專案操作手冊

![Last Updated](https://img.shields.io/badge/Last%20Updated-2025--07--14-blue.svg)

本文件提供 Webtest 專案的標準操作流程與相關技術說明，旨在協助團隊成員快速上手並執行自動化測試。

---

## 🧭 目錄
- [1. ⚙️ 環境準備 (Environment Setup)](#1--環境準備-environment-setup)
- [2. 🚀 執行測試 (主要方式)](#2--執行測試-主要方式)
- [3. 📜 腳本與API功能詳解 (進階參考)](#3--腳本與api功能詳解-進階參考)
- [4. 🚌 乘車碼 (DoPayment) 相關腳本](#4--乘車碼-dopayment-相關腳本)
- [5. 🔬 其他特殊測試](#5--其他特殊測試)
- [6. 🛠️ 輔助分析工具](#6--輔助分析工具)

---

## 1. ⚙️ 環境準備 (Environment Setup)
在執行任何測試前，請務務必完成以下兩個環境設定。

### 1.1 確認 Node.js 版本
本專案依賴 Node.js 環境，請開啟終端機 (Command Prompt) 並輸入以下指令，確認版本號是否正確顯示。

```shell
C:\webtest> node -v
v18.12.1

C:\webtest> npm -v
8.19.2
````

### 1.2 啟動本地伺服器

> **⚠️ 重要提示**
>
> 所有測試都 **必須** 在本地伺服器啟動的狀態下進行。

請執行以下指令來開啟 Express.js 測試伺服器：

```shell
C:\webtest> node Express.js
```

伺服器啟動後，您可以在瀏覽器中開啟 `http://localhost:3000` 網頁，以利執行需要網頁介面的測試項目（如：現金儲值、付款、授權綁定）。

-----

## 2\. 🚀 執行測試 (主要方式)

為求方便快速，建議使用批次檔 (`.bat`) 的方式執行測試。

**📁 檔案路徑:** `C:\webtest\BAT\`

**🖱️ 操作方式:** 進入上述路徑，直接點擊對應的 `.bat` 檔案即可執行。

### 統一超商

  - `統一超商反掃扣款.bat`
  - `統一超商反掃退款交易.bat`
  - `統一超商儲值交易.bat`
  - `統一超商儲值退款.bat`
  - `綁定統一超商正式會員訂閱綁定_slack.bat` (會員訂閱綁定，含 Slack 通知)

### 康是美

  - `康事美反掃扣款.bat`
  - `康事美扣款後退款.bat`
  - `康事美查詢交易結果.bat`
  - `康事美掃瞄web付款Qrcode.bat`

### 博客來

  - `博客來反掃扣款.bat`
  - `博客來掃瞄web付款Qrcode.bat`

### 富利餐飲 (KFC) - 多步驟流程

1.  `Step1富利餐飲(KFC)產出跳轉付款URL.bat`
2.  `Step2富利餐飲(KFC)付款完成查詢交易結果.bat`
3.  `Step3富利餐飲(KFC)退款交易.bat`

### 星巴克

  - `星巴克(儲值)產出跳轉付款URL.bat`
  - `星巴克(悠遊生活)授權綁定_目前無法使用要V1切至V2.bat` (⚠️ **注意:** 目前無法使用)

### 授權綁定

  - `大都會車隊授權綁定.bat`
  - `元大證券投資信託授權綁定.bat`
  - `YOXI 授權綁定UAT.bat` (UAT 環境)

### 其他廠商

  - `剛鈺停車場反掃扣款.bat`
  - `和泰聯網付款Qrcode.bat`
  - `金箍棒JGBWeb掃瞄web付款Qrcode_UAT.bat` (UAT 環境)

-----

## 3\. 📜 腳本與API功能詳解 (進階參考)

此區段提供 `.js` 腳本與後端 API 的對應關係，供開發人員除錯或手動執行時參考。

| 腳本名稱 (.js)             | 功能說明                               | 對應 API      | 備註                                                   |
| -------------------------- | -------------------------------------- | ------------- | ------------------------------------------------------ |
| **反掃/Web掃碼支付** |                                        |               |                                                        |
| `cosmed.js`                | 康是美 - 反掃扣款                        | `ICPOF001`    |                                                        |
| `ai-rider.js`              | 剛鈺停車場 - 反掃扣款                    | `ICPOF001`    |                                                        |
| `books.js`                 | 博客來 - 反掃扣款                        | `ICPOF001`    |                                                        |
| `marketpayment.js`         | 統一超商 - 反掃付款                      | `ICPOS001`    |                                                        |
| `cosmedweb.js`             | 康是美 - 掃描Web付款                     | `ICPO0008`    |                                                        |
| `booksweb.js`              | 博客來 - 掃描Web付款                     | `ICPO0008`    |                                                        |
| `JGBwebUAT.js`             | 金箍棒JGBWeb - Web付款 (房東001)         | `ICPO0008`    | `UAT 環境`                                             |
| **主掃/跳轉支付** |                                        |               |                                                        |
| `kfcjump.js`               | KFC - 產出跳轉付款URL                    | `IPCO0002`    |                                                        |
| `starbucksjump.js`         | 星巴克 - 產出儲值跳轉URL                 | `IPCO0002`    |                                                        |
| `iyugo.js`                 | 統一超商(隨時取) - 主掃QR Code           | `ICPO0001` + `ICPO0002` |                                                        |
| `iyugoslack.js`            | 統一超商(隨時取) - 主掃QR Code並發送通知 | `(同上)`      | 含 Slack 通知                                          |
| `obedientstore.js`         | 乘乘 - 主掃QR Code                       | `ICPO0001` + `ICPO0002` | 未開啟 OP 點數                                         |
| `hotaiconnected.js`        | 和泰聯網 - 主掃QR Code付款               | `ICPO0001` + `ICPO0002` |                                                        |
| `tarokouat.js`             | 大魯閣宏誌                               | `ICPO0001`    | `UAT 環境`, `2025/05/06`                               |
| **交易退款** |                                        |               |                                                        |
| `cosmedrefund.js`          | 康是美 - 退款                            | `ICPO0004`    | 需先執行扣款                                           |
| `marketpaymentrefund.js`   | 統一超商 - 反掃退款                      | `ICPOS002`    |                                                        |
| `markettoprefund.js`       | 統一超商 - 儲值退款                      | `ICPOS005`    | 2025/02/06 顯示退貨失敗，需同店退                      |
| `iyugorefund.js`           | 統一超商(隨時取) - 退款                  | `ICPO0004`    | 需先完成查詢                                           |
| `kfcjumprefund.js`         | KFC - 退款                               | `ICPO0004`    | 需先完成查詢, `2025/02/23`                             |
| **交易查詢** |                                        |               |                                                        |
| `cosmedquerytrade.js`      | 康是美 - 查詢交易結果                    | `ICPO0005`    | `EncData` 需載入 `MerchantTradeNo`                      |
| `iyugoquerytrade.js`       | 統一超商(隨時取) - 查詢交易結果          | `ICPO0005`    |                                                        |
| `kfcjumpquerytrade.js`     | KFC - 查詢交易結果                       | `ICPO0005`    | `2025/02/23`                                           |
| **儲值** |                                        |               |                                                        |
| `markettopup.js`           | 統一超商 - 儲值                          | `ICPOS004`    |                                                        |
| `markettopupuat.js`        | 統一超商 - 儲值                          | `ICPOS004`    | `UAT 環境`                                             |
| **授權綁定** |                                        |               |                                                        |
| `statbucksbinding.js`      | 星巴克(悠遊生活) - 授權綁定              | `ICPOB0000`   | 固定扣款額度                                           |
| `Mertotaxibinding.js`      | 大都會車隊 - 授權綁定                    | `ICPOB0000`   | 固定扣款額度                                           |
| `Mertotaxibindingtoslack.js`| 大都會車隊 - 授權綁定 (含 Slack 通知)    | `ICPOB0000`   |                                                        |
| `bookhouse.js`             | 財團法人孩子的書屋 - 授權綁定            | `ICPOB0000`   | 固定扣款額度                                           |
| `yoxibinding.js`           | YOXI - 授權綁定                          | `ICPOB0000`   | 可自訂每月扣款上限                                     |
| `yoxibindingUAT.js`        | YOXI - 授權綁定                          | `ICPOB0000`   | `UAT 環境`                                             |
| `yuantabinding.js`         | 元大投信 - 授權綁定                      | `ICPOB0000`   | 可自訂每月扣款上限                                     |
| `yuantabingingtoslack.js`  | 元大投信 - 授權綁定 (含 Slack 通知)      | `ICPOB0000`   |                                                        |
| `binding711paid.js`        | UAT 統一超商付費會員                     | `(N/A)`       | 年扣定額可改                                           |
n| `Mertotaxicancelbinding.js`| 大都會車隊 - 取消授權綁定                | `ICPO0003`    | 需先成功綁定                                           |

> **⚠️ 重要提示: 授權綁定**
>
> 授權綁定相關測試需使用固定的 Webhook URL，其程式碼與資料主要存放在 `webtes20250123` 雲端硬碟。

-----

## 4\. 🚌 乘車碼 (DoPayment) 相關腳本

  - **API 端點:** `/api/V2/Payment/Traffic/DoPayment`
  - **操作流程:**
    1.  `dopayment.js`: 讀取 `c:\webtest\qrcode.png` 圖片檔，解析出 `orgQrcode` 的值。
    2.  `dopayment2.js`: 載入上一步驟取得的 `orgQrcode` 值，即可模擬乘車碼扣款。
  - **其他相關腳本:**
      - `dopaymentmrt.js`: 直接模擬北捷乘車碼扣款。

-----

## 5\. 🔬 其他特殊測試

  - `testcosmedm.js`: 康是美 - 連續多筆反掃扣款 (需搭配 APK 產生的多筆條碼)。
  - `testmarketpayment.js`: 統一超商 - 連續多筆反掃扣款 (需搭配 APK 產生的多筆條碼)。
  - `fisckor.js`: 韓國跨境支付 (依賴財金公司測試環境)。

-----

## 6\. 🛠️ 輔助分析工具

  - **AES 加解密線上工具**: [http://107.173.165.164/onlineaes.php](http://107.173.165.164/onlineaes.php)

<!-- end list -->

```
```