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

| 腳本名稱 (.js)                         | 功能說明                         | 對應 API                | 備註                             |
|------------------------------------|------------------------------|-----------------------|--------------------------------|
| **反掃/Web掃碼支付**                     |                              |                       |                                |
| `cosmed.js`                        | 康是美 - 反掃扣款                   | `ICPOF001`            |                                |
| `simplemart.js`                    | 美廉社 - 反掃扣款                   | `ICPOF001`            |                                |
| `icashclubno99.js`                 | 愛金卡褔利社99號-反掃扣款               | `ICPOF001`            |                                |
| `ai-rider.js`                      | 剛鈺停車場(統一精工) - 反掃扣款           | `ICPOF001`            |                                |
| `books.js`                         | 博客來 - 反掃扣款                   | `ICPOF001`            |                                |
| `carrefourUAT.js`                  | 家樂褔 - 反掃扣款                   | `ICPOF001`            | `UAT 環境_付款10元`                 |
| `dreammall.js`                     | 高雄夢時代 -反掃扣款                  | `ICPOF001`            |                                |
| `marketpayment.js`                 | 統一超商 - 反掃付款                  | `ICPOS001`            |                                |
| `cosmedweb.js`                     | 康是美 - 掃描Web付款                | `ICPO0008`            |                                |
| `booksweb.js`                      | 博客來 - 掃描Web付款                | `ICPO0008`            |                                |
| `bookswebUAT.js`                   | 博客來 - 掃描Web付款                |   `ICPO0008`          | `UAT 環境`                       |
| `carrefourwebUAT.js`               | 家樂褔 - 掃描Web付款                |   `ICPO0008`           | `UAT 環境`                       |
| `JGBwebUAT.js`                     | 金箍棒JGBWeb - Web付款 (房東001)    | `ICPO0008`            | `UAT 環境`                       |
| **主掃/跳轉支付**                        |                              |                       |                                |
| `kfcjump.js`                       | KFC - 產出跳轉付款URL              | `IPCO0002`            |                                |
| `starbucksjumpUAT.js`              | 星巴克 - 產出儲值跳轉URL              | `IPCO0002`            | `UAT 環境` 04/10 ok              |
| `bookjumpUAT.js`                   | 博客來 - 產出付款成功跳轉URL            | `IPCO0002`            |                                |
| `bookjumptwqrUAT.js`               | 博客來TWQR - 產出付款成功跳轉URL        | `IPCO0002`            | `UAT 環境_TWQR跨平台購物URL`          |
| `iyugo.js`                         | 統一超商(隨時取) - 主掃QR Code        | `ICPO0001` + `ICPO0002` |                                |
| `iyugoslack.js`                    | 統一超商(隨時取) - 主掃QR Code並發送通知   | `(同上)`                | 含 Slack 通知                     |
| `foodomo.js`                       | Foodmo 付款                    | `(同上)`                | 含 Slack 通知                     |
| `obedientstore.js`                 | 乘乘 - 主掃QR Code               | `ICPO0001` + `ICPO0002` | 未開啟 OP 點數                      |
| `hotaiconnected.js`                | 和泰聯網 - 主掃QR Code付款           | `ICPO0001` + `ICPO0002` |                                |
| `tarokouat.js`                     | 大魯閣宏誌                        | `ICPO0001`            | `UAT 環境`, `2025/05/06`         |
| **交易退款**                           |                              |                       |                                |
| `cosmedrefund.js`                  | 康是美 - 退款                     | `ICPO0004`            | 需先執行扣款                         |
| `marketpaymentrefund.js`           | 統一超商 - 反掃退款                  | `ICPOS002`            |                                |
| `markettoprefund.js`               | 統一超商 - 儲值退款                  | `ICPOS005`            | 2025/02/06 顯示退貨失敗，需同店退         |
| `iyugorefund.js`                   | 統一超商(隨時取) - 退款               | `ICPO0004`            | 需先執行iyugoquerytrade.js查詢       |
| `kfcjumprefund.js`                 | KFC - 退款                     | `ICPO0004`            | 需先完成查詢, `2025/02/23`           |
| `bookjumprefundUAT.js`             | book - 退款                    | `ICPO0004`            |                                |
| `carrefourrefundUAT.js`            | 家樂褔 -退款                      | `ICPO0004`            | 需先完成查詢交易結果的js, `2026/03/02`    |
| **交易查詢**                           |                              |                       |                                |
| `cosmedquerytrade.js`              | 康是美 - 查詢交易結果                 | `ICPO0005`            | `EncData` 需載入 `MerchantTradeNo` |
| `cosmedqueryCancel.js`             | 康是美 - 取消交易                   | `ICPO0006`            |                                |
| `bookjumpquerytradeUAT.js`         | book - 查詢交易結果                | `ICPO0005`            |                                |
| `carrefourjumpquerytradeUAT.js`    | 家樂褔 -查詢交易結果                  | `ICPO0005`            |                                |
| `carrefourjumpquerytradeUATWeb.js` | 家樂褔Web -查詢交易結果               | `ICPO0005`            |                                |
| `iyugoquerytrade.js`               | 統一超商(隨時取) - 查詢交易結果           | `ICPO0005`            |                                |
| `kfcjumpquerytrade.js`             | KFC - 查詢交易結果                 | `ICPO0005`            | `2025/02/23`                   |
| **取消交易**                           |                              |                       |                                |
| `marketpaymentcancel.js`           | 統一超商 - 取消交易                  | `ICP0S003`            |                                |
| **儲值**                             |                              |                       |                                |
| `markettopup.js`                   | 統一超商 - 儲值                    | `ICPOS004`            |                                |
| `markettopupuat.js`                | 統一超商 - 儲值                    | `ICPOS004`            | `UAT環境`                        |
| **授權綁定**                           |                              |                       |                                |
| `statbucksbindingUAT.js`           | 星巴克(悠遊生活) - 授權綁定             | `ICPOB0000`           | 固定扣款額度  `UAT環境`  04/10 ok      |
| `Mertotaxibinding.js`              | 大都會車隊 - 授權綁定                 | `ICPOB0000`           | 固定扣款額度                         |
| `Mertotaxibindingtoslack.js`       | 大都會車隊 - 授權綁定 (含 Slack 通知)    | `ICPOB0000`           |                                |
| `bookhouse.js`                     | 財團法人孩子的書屋 - 授權綁定             | `ICPOB0000`           | 固定扣款額度                         |
| `yoxibinding.js`                   | YOXI - 授權綁定                  | `ICPOB0000`           | 可自訂每月扣款上限                      |
| `yoxibindingUAT.js`                | YOXI - 授權綁定                  | `ICPOB0000`           | `UAT 環境` 04/10 ok              |
| `yuantabinding.js`                 | 元大投信 - 授權綁定                  | `ICPOB0000`           | 可自訂每月扣款上限                      |
| `yuantabingingtoslack.js`          | 元大投信 - 授權綁定 (含 Slack 通知)     | `ICPOB0000`           |                                |
| `binding711paid.js`                | UAT 統一超商付費會員                 | `(N/A)`               | 年扣定額可改                         |
| `Mertotaxicancelbinding.js`        | 大都會車隊 - 取消授權綁定               | `ICPO0003`            | 需先成功綁定                         |

> **⚠️ 重要提示: 授權綁定**
>
> 授權綁定相關測試需使用固定的 Webhook URL，其程式碼與資料主要存放在 `webtes20250123` 雲端硬碟。

-----

## 4\. 🚌 乘車碼 (DoPayment) 相關腳本

  - **API 端點:** `/api/V2/Payment/Traffic/DoPayment`
  - **操作流程:**
    1.  `dopayment.js`: 讀取 `c:\webtest\qrcode.png` 圖片檔，解析出 `orgQrcode` 的值。
    2.  `dopayment2.js`: 載入上一步驟取得的 `orgQrcode` 值，即可模擬乘車碼扣款。
    3.  `processRidePayment.js`: 整合dopayment and dopayment2 即可模擬市車乘車碼扣款。
    4.  `processRidePaymentold.js`: 整合dopayment and dopayment2 即可模擬市車敬老票乘車碼扣款。
    5.  `processRidePaymentmrts.js`: 整合dopayment and dopaymentmrt 即可模擬北捷乘車碼扣款。
    6.  `processRidePaymentmrtadult.js`: 整合dopayment and dopaymentmrt 即可模擬北捷乘車碼扣款。
    7.  `processhoshinebusuat.js`: 整合dopayment and dopaymentmrt 即可模擬UAT市車乘車碼扣款。 2026/03/16 測試修改OK
    8.  `processhoshinebusrefunduat.js`: 模擬UAT市車乘車碼退款。 2026/04/23 目前無法退款
    9.  `fuzz_test.js`: 乘車壓力測試
    C:\webtest>node processhoshinebusrefunduat.js UQZUV1RWMDFSSmEBMWIMMTIzNDU2Nzg5QUJaYwEyZA4yMDI2MDQyMzExMTUxM2UUODNENDY2NzM5QjhCQjNERUE0MTdnDjAwMDAwMDAwMDAwMDAwVElBATNCEDE2ODI2MTEwMDAwMDExNDRDEDMyOTA0MDkwMTMxMDAwMDBEATFGFDAwMDAwMDAwMDAwMDAwMDU5NDc5SAcrMDAwMTAwVWlxBTAxLjAwgBMAAAAAAAAAAAAAAAAAAAAAAAAAhTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKEAAAAAAAAAAAAAAAAAAAAAA= 105544050674334386 20260423111830211956
     --- [Preprod] 執行全聯會規格退款測試 ---
    DEBUG - 伺服器原始回傳內容: {"rc":-130000,"rm":"系統尚不開放此類型交易","transactionInfo":{"recordId":"105544050052027129","merchantId":"10554405","currency":"TWD","paymentMethod":0,"transactionAmount":30.0000,"baseAmount":30.0000,"point":0,"transactionDate":"20260423123013","transactionId":"0"}}
   ❌ 退款失敗: 系統尚不開放此類型交易 (代碼: -130000)
    
     報錯RtnCode:9999
  - Merchant ID 與 Terminal ID 的綁定關係：
    雖然你用了範例中的 terminalId: A01630526，但 Staging Server 可能規定：A01630526 這個終端機必須隸屬於某個特定的 merchantId。
  - 如果你傳的 10524012 與該終端機在後端系統中沒有關聯，後端查詢時會噴 Exception。
  - 本地測試 (Target: Local) ✅ 成功：
    這證明了你的 Node.js 程式碼在加密邏輯 (AES/RSA)、封包結構 (JSON)、時間格式、MAC 生成、網路傳輸這幾個環節是 100% 正確的。
  - 如果程式碼格式有誤，本地 Server 會直接噴錯。 
  - Staging 測試 (Target: Staging) ❌ 失敗 (9999)： 
  - 這說明 Staging Server 雖然接收並解開了你的封包，但在執行「後端商務邏輯」時發生了崩潰
   
  - **其他相關腳本:**
      - `dopaymentmrt.js`: 直接模擬北捷乘車碼扣款。

-----

## 5\. 🔬 其他特殊測試

  - `testcosmedm.js`: 康是美 - 連續多筆反掃扣款 (需搭配 APK 產生的多筆條碼)。
  - `testmarketpayment.js`: 統一超商 - 連續多筆反掃扣款 (需搭配 APK 產生的多筆條碼)。
  - `fisckor.js`: 韓國跨境支付 (依賴財金公司測試環境)。
  - `logreport_generator.py`: 網頁小工具使用率統計。
  - `comedonline3ds.js`: 待中心調整ok再次確認。
  -  `carrefourUATreadbarcode.js`: 讀取家樂褔付款條碼UAT。
  -  `bookswebUAT.js`: 博客來web付款成功，再打取消交易->ICPO0006，待10分鐘後台才能看到。
  - `c:\icppython\run_login711paycashandOP.js`: 搭配執行登入此帳號執行超商SIT 部分點+金。
  - `marketpaymentautocashandop.js`: 超商SIT付款 部分點+金。
  - `marketpaymentrefundauto.js`: 超商SIT退款 部分點+金。
  - `c:\icppython\switch_user`: 超商一鍵執行純金、純點扣款，當日次數已滿切換帳號。

  Terminal 範例
  ```text
  C:\webtest>node marketpayment.js ->模擬金額邏輯錯誤
  修改方式：將 TxAmt 設為 "100"，但 ItemAmt 保持 "36"。
  預期結果：中心端驗證失敗，回傳 ServiceResult: "N" 或特定的錯誤 StatusCode
  請輸入付款條碼 (BuyerID): ic149holsnj0a1v6jt
  Response: {"EncData":"IfhxhIr4yX8IsHxoPoRD4TYQbFGqwqUMsCr6L2UZTQCOp7bed51PcCfTs6tXROddoe4l71yfjeZdqCQREcsYQAS0P5IPm50xNvciTHZg5NTaB4H9DuVaxwhsIc3sa7g+AzCUFQALu5lx4ncZe2qTd8DfJf+MfgAsjDMIpgYrjuD4MTWlIWZnWEKv3y/B/g1nivM76UNjJMETfxBL4xePS9O3MDqa72X/t7GYnoLa+Sx/DEM6TURvLgP9Dm7guLRYtW93GBx5FK1b4DN9Xm3mo8RRmsszwElb6gF23kMFFkb/AiTNEE8W8SQoElrQui66usJ+bIO2lTQXrqRoZmtc7CNTmH6uCNcQkR3BcRf+TCaQNAkPIeQ6ecSGDNSu/1M4yHA4G/7QjGNJtBVO4X7W0LnF9gJqv8oWhvZ/nh00ol8gh629eaco33v56LuF6yntdXGMarW67gzqIE/DQVezW1ODZKN1hDEx0ZJIKWXKYD8=","RtnCode":2057,"RtnMsg":"交易金額有誤"}
  Decrypted Response Data: {"TxAmt":null,"DebitAmt":null,"PaymentChannel":null,"ChannelStatusCode":null,"ChannelStatusDesc":null,"CardID":null,"Cardkind":null,"BonusList":[],"OPSeq":null,"BankSeq":null,"BankTime":null,"WalletSeq":null,"WalletTime":null,"WalletID":null,"VehicleType":null,"VehicleNo":null,"ServiceResult":"N","StatusCode":"B11082057","StatusDesc":"交易金額有誤"}
  Data saved to marketpaymentrefund.txt

  C:\webtest>node marketpaymenttimeout_intergrated.js
  請輸入付款條碼 (BuyerID): ic149holsnj0a1v6jt

  [系統] 付款請求已發送 (序號: OP20260424101214)
  [🚨 警報] 已達 10 秒超時！正在強制中斷付款連線並啟動「取消交易」...
  --- 🚀 執行取消交易 API (ICPOS003) ---
  --- 🎯 取消回應 (Response) ---
  回傳代碼 (RtnCode): 1
  回傳訊息 (RtnMsg): 成功
  解密 EncData 內容: { OPSeq: 'OP20260424101214' }
  ✅ 取消成功：原序號 OP20260424101214 已撤銷。
  ```

  正掃Qrcode 退款步驟

  1. 家樂褔UAT正掃QRcode
  2. 先到後台查詢特店訂單編號載入，carrefourjumpquerytradeUATICPO.js_查詢訂單號碼API
  3. carrefourrefundUATICPO.js_退款API / carrefourrefundUATqrcodefivedollars.js_退款5元，可用部份退款
  4. carrefourCancelUATICPO.js 取消API，正掃付款成功後打取消API，即會沖正。

  巧克力正掃Qrcode

  1. 先到後台查詢特店訂單編號載入，chocolatequerytradeUATICPO.js_查詢訂單號碼API
  2. chocolaterefundUATICPO.js 退款API

  1. 先到後台將特店訂單編號一次下載 excel 多筆特店訂單編號，chocolatequerytradeUATICPOexcel.js_查詢訂單號碼API
  2. chocolaterefundUATICPObatch.js 一次性批次退款API

  大都會車隊SIT正掃QRcode

  1. 先到後台查詢特店訂單編號載入，MertotaxiSITreadbarcodeICPO.js_查詢訂單號碼API
  2. MertotaxirefundSITreadbarcodeICPO.js_退款API_退款10元
  3. MertotaxiSITreadbarcodeICPOexcel.js 讀取後台批次特店訂單編號
  4. MertotaxirefundSITreadbarcodeICPObatch.js 一次性批次退款
  5. MertotaxiSITCancelUATICPO.js_取消API

  多拿滋SIT_TWQR正掃QRcode

  1. 先到後台查詢特店訂單編號載入，donutSITreadbarcodeICPO.js_查詢訂單號碼API
  2. donutrefundSITreadbarcodeICPO.js_退款API_20元
  3. donutSITreadbarcodeICPOexcel.js 讀取後台批次特店訂單編號
  4. donutrefundSITreadbarcodeICPObatch.js 一次性批次退款

  博客來

  1. booksatoa.js app to app sit 扣款
  2. booksatoaquerytrade.js sit 查詢交易
  3. bookatoarefund.js sit 退款

  康是美91APP

  1. cosmed91app.js sit 扣款_5元
  2. cosmed91appquerytrade.js sit 查詢交易
  3. cosmed91apprefund.js sit 退款

  康是美91APP UAT

  1. cosmed91appUAT.js UAT 扣款_5元
  2. cosmed91appquerytradeUAT.js UAT 查詢交易
  3. cosmed91apprefundUAT.js UAT退款

  星巴克

  1. starbucksjumpUAT.js web UAT扣款 50元
  2. starbucksjumpUATatoa.js UAT扣款 50元
  3. 正掃後，完成扣款，再執行查詢交易
  4. starbucksquerytradeUATICPO.js UAT 查詢交易
  5. starbucksrefundUATICPO.js UAT 退款
  6. starbucksCancelUATICPO.js UAT 取消API 20260421121300211876 正掃扣款成功後，沖正後，受理退款

  - Pilot: https://icpbridge.icashsys.com.tw
  - SIT: https://icpbridge-dev.icashsys.com.tw
  - UAT: https://icpbridge-test.icashsys.com.tw

-----

## 6\. 🛠️ 輔助分析工具

  - **AES 加解密線上工具**: [http://107.173.165.164/onlineaes.php](http://107.173.165.164/onlineaes.php)

<!-- end list -->

```
```