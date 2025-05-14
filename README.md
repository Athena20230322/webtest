#WEBTEST_2025_0314更新

測試操作方式如下:

執行前需確認已安裝Node.js

已安裝完成，需可以顯示以下版本號

C:\webtest> node -v

v18.12.1

C:\webtest> npm -v

8.19.2

******************************
C:\webtest> node Express.js
******************************
Express.js ---> 開啟web server localhost:3000 網頁上可執行 現金儲值、付款、授權綁定
==============================================================================================================================================================
以下指令方式，改用點擊.bat的方式，去執行

檔案路徑放置如下

C:\webtest\BAT

康事美反掃扣款.bat

康事美扣款後退款.bat

康事美查詢交易結果.bat

剛鈺停車場反掃扣款.bat

博客來反掃扣款.bat

統一超商反掃扣款.bat

統一超商反掃退款交易.bat

統一超商儲值交易.bat

統一超商儲值退款.bat

博客來掃瞄web付款Qrcode.bat

康事美掃瞄web付款Qrcode.bat

和泰聯網付款Qrcode.bat

富利餐飲(KFC)產出跳轉付款URL.bat

金箍棒JGBWeb掃瞄web付款Qrcode_UAT.bat

星巴克(悠遊生活)授權綁定_目前無法使用要V1切至V2.bat

星巴克(儲值)產出跳轉付款URL.bat

大都會車隊授權綁定.bat

元大證券投資信託授權綁定.bat

YOXI 授權綁定UAT.bat

Step1富利餐飲(KFC)產出跳轉付款URL.bat 

Step2富利餐飲(KFC)付款完成查詢交易結果.bat

Step3富利餐飲(KFC)退款交易.bat

綁定統一超商正式會員訂閱綁定_slack.bat__程式路徑C:\webtes20250123\binding711memformal.js

==============================================================================================================
指令輸入方式範例如下:

C:\webtest node cosmed.js 

cosmed.js -->康事美反掃扣款-->ICPOF001

cosmedrefund.js -->康事美退款交易-->ICPO004 (需先執行康事美反掃扣款，執行康事美退款交易才能成功)

cosmedquerytrade.js-->康事美為例查詢交易結果API -->ICPO0005 , EncData主要載入 MerchantTradeNo

http://107.173.165.164/onlineaes.php

ai-rider.js -->剛鈺停車場反掃扣款-->ICPOF001

books.js -->博客來股份有限公司反掃扣款-->ICPOF001

marketpayment.js-->超商反掃付款交易-->ICPOS001

marketpaymentrefund.js->超商反掃退款交易-->ICPOS002

markettopup.js-->超商儲值交易_ICPOS004

markettoprefund.js-->超商儲值退款_ICPOS005 (目前執行顯示退貨/取消失敗，必須在儲值的同一家分店辦理退貨/取消)_2025/02/06

marketpaidUAT.js -->超商付費會員授權綁定-->ICPOB0000(訂閱制固定金額711元，目前尚未確認規格)_2025/03/07

booksweb.js-->博客來掃瞄web付款 -->ICPO0008

cosmedweb.js-->康事美掃瞄web付款 -->ICPO0008

iyugo.js-->統一超商隨時取 -->ICPO0001+回傳TradeToken產生Qrcode(ICPO0002)(使用OPSDK付款測試)

hotaiconnected.js -->和泰聯網股份有限公司掃瞄Qrocde付款-->ICPO0001+回傳TradeToken產生Qrcode(ICPO0002)

fisckor.js        -->韓國跨境支付，此透過財經測試環境，若關閉即無法正常使用

kfcjump.js -->模擬富利餐飲產出跳付款URL跨平台購物產生URL(IPCO0002)_2025/02/13

kfcjumpquerytrade.js -->富利餐飲付款URL已付款完成進行查詢交易結果-->ICPO005_2025/02/23

kfcjumprefund.js -->需先完成查易交易結果後，再執行退款-->ICPO0004_2025/02/23

JGBwebUAT.js -->金箍棒JGBWeb付款-房東001-->ICPO008

testcosmedm.js-->此為康事美反掃連續多筆反掃扣款，現行需搭配包出apk，進行產出多筆條碼資料，再進行執行扣款

testmarketpayment.js 此為超商多筆反掃扣款，現行需搭配包出apk，進行產出多筆條碼資料，再進行執行扣款

statbucksbinding.js-->星巴克(悠遊生活)授權綁定-->ICPOB0000 (無法修改，固定每筆扣款金額、每月扣款金額上限)

starbucksjump.js-->星巴克(儲值)產出跳轉付款URL-->(IPCO0002)_2025/02/24

tarokouat.js -->UAT大魯閣宏誌-->ICPO001_2025/05/06

yoxibindingUAT.js--->YOXI授權綁定-->ICPOB0000 (不固定可設定每月扣款金額上限)

yoxibinding.js --->Yoxi授權綁定-->ICPOB0000 (不固定可設定每月扣款金額上限)

Mertotaxibinding.js-->大都會車隊授權綁定-->ICPOB000 (無法修改，固定每筆扣款金額、每月扣款金額上限)

Mertotaxicancelbinding.js -->大都會車隊授權取消綁定-->ICPO0003(需先執行ICPOB000綁定成功後，再執行ICPOB000) 

Mertotaxibindingtoslack.js-->大都會車隊授權綁定-->ICPOB000 (無法修改，固定每筆扣款金額、每月扣款金額上限)，傳送至github_webtest to slack

yuantabinding.js -->元大證券投資信託授權綁定-->ICPOB000 (不固定可設定每月扣款金額上限)

yuantabingingtoslack.js-->元大證券投資信託授權綁定-->ICPOB000 (不固定可設定每月扣款金額上限)，傳送至github_webtest to slack

會員授權綁定相關-->需固定使用Webhook，上傳Github皆會變動 所以傳送至Slack 資料夾放置webtes20250123雲端硬碟。

binding711paid.js -->UAT統一超商付費會員

年扣定額可改-->MerchantID:10537684 /  BindingTradeID:13656
=============================================================================================================
/api/V2/Payment/Traffic/DoPayment
模擬乘車碼->漢程汽車客運
dopayment.js -->讀取Qrcode 解析 ICP帳號登入，本機登入後，截取乘車碼Qrcode 放置c:\webtest\qrcode.png(圖片檔名固定qrcode.png)
dopayment2.js-->承上dopayment.js 取得載入orgQrcode的值，執行dopayment2.js 即可模擬乘車碼 扣款