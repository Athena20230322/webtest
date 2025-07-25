WEBTEST 自動化測試專案操作手冊
最後更新: 2025-07-14

本文件提供 Webtest 專案的標準操作流程與相關技術說明。

目錄
環境準備 (Environment Setup)

執行測試 (主要方式)

腳本與API功能詳解 (進階參考)

輔助分析工具

好的，沒有問題。我們將您提供的內容再次進行精煉和排版，讓它作為一份更清晰、更專業的 GitHub README 文件。

這次的調整重點在於：

結構化標題：使用更明確的標題和步驟劃分，如 STEP 1, STEP 2。

分區塊說明：將「批次檔」和「JS腳本」這兩種不同的操作方式更清楚地分開。

表格化呈現：將雜亂的列表轉換成易於查閱的表格。

重點提示：將重要的前置步驟或注意事項用引言區塊標示出來，使其更醒目。

您可以直接複製下方的完整內容，貼到您的 README.md 檔案中。

WEBTEST 自動化測試專案操作手冊
最後更新: 2025-03-14

本文件提供 Webtest 專案的標準操作流程與相關技術說明。

目錄
環境準備 (Environment Setup)

執行測試 (主要方式)

腳本與API功能詳解 (進階參考)

輔助分析工具

1. 環境準備 (Environment Setup)
在執行任何測試前，請務必完成以下兩個環境設定。

1.1 確認 Node.js 版本
本專案依賴 Node.js 環境，請開啟終端機 (Command Prompt) 並輸入以下指令，確認版本號是否正確顯示。

C:\webtest> node -v
v18.12.1

C:\webtest> npm -v
8.19.2
==============================================================================================================
1.2 啟動本地伺服器
[!] 重要提示： 所有測試都必須在本地伺服器啟動的狀態下進行。

請執行以下指令來開啟 Express.js 測試伺服器：
C:\webtest> node Express.js
伺服器啟動後，您可以在瀏覽器中開啟 http://localhost:3000 網頁，以利執行需要網頁介面的測試項目（如：現金儲值、付款、授權綁定）。
=================================================================================================================
2. 執行測試 (主要方式)
為求方便快速，建議使用批次檔 (.bat) 的方式執行測試。

檔案路徑: C:\webtest\BAT\

操作方式: 進入上述路徑，直接點擊對應的 .bat 檔案即可執行。

統一超商

反掃扣款: 統一超商反掃扣款.bat

反掃退款: 統一超商反掃退款交易.bat

儲值交易: 統一超商儲值交易.bat

儲值退款: 統一超商儲值退款.bat

會員訂閱綁定 (Slack通知): 綁定統一超商正式會員訂閱綁定_slack.bat

康是美

反掃扣款: 康事美反掃扣款.bat

扣款後退款: 康事美扣款後退款.bat

查詢交易結果: 康事美查詢交易結果.bat

掃描Web付款QR Code: 康事美掃瞄web付款Qrcode.bat

博客來

反掃扣款: 博客來反掃扣款.bat

掃描Web付款QR Code: 博客來掃瞄web付款Qrcode.bat

富利餐飲 (KFC) - 多步驟流程

產出跳轉付款URL: Step1富利餐飲(KFC)產出跳轉付款URL.bat

付款完成後查詢: Step2富利餐飲(KFC)付款完成查詢交易結果.bat

執行退款: Step3富利餐飲(KFC)退款交易.bat

星巴克

產出儲值跳轉URL: 星巴克(儲值)產出跳轉付款URL.bat

授權綁定 (悠遊生活): 星巴克(悠遊生活)授權綁定_目前無法使用要V1切至V2.bat

授權綁定

大都會車隊: 大都會車隊授權綁定.bat

元大證券投資信託: 元大證券投資信託授權綁定.bat

YOXI (UAT環境): YOXI 授權綁定UAT.bat

其他廠商

剛鈺停車場 (反掃扣款): 剛鈺停車場反掃扣款.bat

和泰聯網 (付款QR Code): 和泰聯網付款Qrcode.bat

金箍棒JGBWeb (UAT環境): 金箍棒JGBWeb掃瞄web付款Qrcode_UAT.bat

===================================================================================================

3. 腳本與API功能詳解 (進階參考)
此區段提供 .js 腳本與後端 API 的對應關係，供開發人員除錯或手動執行時參考。

AES 加解密線上工具: http://107.173.165.164/onlineaes.php

反掃/Web掃碼支付
cosmed.js: 康是美 - 反掃扣款 (ICPOF001)

ai-rider.js: 剛鈺停車場 - 反掃扣款 (ICPOF001)

books.js: 博客來 - 反掃扣款 (ICPOF001)

marketpayment.js: 統一超商 - 反掃付款 (ICPOS001)

cosmedweb.js: 康是美 - 掃描Web付款 (ICPO0008)

booksweb.js: 博客來 - 掃描Web付款 (ICPO0008)

JGBwebUAT.js: 金箍棒JGBWeb - Web付款-房東001 (ICPO0008, UAT環境)

主掃/跳轉支付
kfcjump.js: KFC - 產出跳轉付款URL (IPCO0002)

starbucksjump.js: 星巴克 - 產出儲值跳轉URL (IPCO0002)

iyugo.js: 統一超商(隨時取) - 主掃QR Code (ICPO0001 + ICPO0002)

iyugoslack.js: 統一超商(隨時取) - 主掃QR Code並發送通知至Slack

obedientstore.js: 乘乘 - 主掃QR Code (ICPO0001 + ICPO0002, 備註: 未開啟OP點數)

hotaiconnected.js: 和泰聯網 - 主掃QR Code付款 (ICPO0001 + ICPO0002)

tarokouat.js: 大魯閣宏誌 - (ICPO0001, UAT環境, 2025/05/06)

交易退款
cosmedrefund.js: 康是美 - 退款 (ICPO0004, 備註: 需先執行扣款)

marketpaymentrefund.js: 統一超商 - 反掃退款 (ICPOS002)

markettoprefund.js: 統一超商 - 儲值退款 (ICPOS005, 備註: 2025/02/06 顯示退貨失敗，需同店退)

iyugorefund.js: 統一超商(隨時取) - 退款 (ICPO0004, 備註: 需先完成查詢)

kfcjumprefund.js: KFC - 退款 (ICPO0004, 備註: 需先完成查詢, 2025/02/23)

交易查詢
cosmedquerytrade.js: 康是美 - 查詢交易結果 (ICPO0005, 備註: EncData需載入MerchantTradeNo)

iyugoquerytrade.js: 統一超商(隨時取) - 查詢交易結果 (ICPO0005)

kfcjumpquerytrade.js: KFC - 查詢交易結果 (ICPO0005, 備註: 2025/02/23)

儲值
markettopup.js: 統一超商 - 儲值 (ICPOS004)

markettopupuat.js: 統一超商 - 儲值 (ICPOS004, UAT環境)

授權綁定
[!] 重要提示： 授權綁定相關測試需使用固定的 Webhook URL，其程式碼與資料主要存放在 webtes20250123 雲端硬碟。

statbucksbinding.js: 星巴克(悠遊生活) - 授權綁定 (ICPOB0000, 備註: 固定扣款額度)

Mertotaxibinding.js: 大都會車隊 - 授權綁定 (ICPOB0000, 備註: 固定扣款額度)

Mertotaxibindingtoslack.js: 大都會車隊 - 授權綁定並發送通知至Slack

bookhouse.js: 財團法人孩子的書屋 - 授權綁定 (ICPOB0000, 備註: 固定扣款額度)

yoxibinding.js: YOXI - 授權綁定 (ICPOB0000, 備註: 可自訂每月扣款上限)

yoxibindingUAT.js: YOXI - 授權綁定 (ICPOB0000, UAT環境)

yuantabinding.js: 元大投信 - 授權綁定 (ICPOB0000, 備註: 可自訂每月扣款上限)

yuantabingingtoslack.js: 元大投信 - 授權綁定並發送通知至Slack

binding711paid.js: UAT統一超商付費會員 (年扣定額可改)

Mertotaxicancelbinding.js: 大都會車隊 - 取消授權綁定 (ICPO0003, 備註: 需先成功綁定)

====================================================================================================
乘車碼 (DoPayment) 相關腳本
API 端點: /api/V2/Payment/Traffic/DoPayment

操作流程:

dopayment.js: 讀取 c:\webtest\qrcode.png 圖片檔，解析出 orgQrcode 的值。

dopayment2.js: 載入上一步驟取得的 orgQrcode 值，即可模擬乘車碼扣款。

dopaymentmrt.js: 直接模擬北捷乘車碼扣款。

其他特殊測試

testcosmedm.js: 康是美 - 連續多筆反掃扣款 (備註: 需搭配APK產生的多筆條碼)

testmarketpayment.js: 統一超商 - 連續多筆反掃扣款 (備註: 需搭配APK產生的多筆條碼)

fisckor.js: 韓國跨境支付 (備註: 依賴財金公司測試環境)
