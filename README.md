#WEBTEST_2025_02071034更新

測試操作方式如下

執行前需確認已安裝Node.js

已安裝完成，需可以顯示版本號

C:\webtest> node -v

v18.12.1

C:\webtest> npm -v

8.19.2

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

booksweb.js-->博客來掃瞄web付款 -->ICPO0008

cosmedweb.js-->康事美掃瞄web付款 -->ICPO0008

testcosmedm.js-->此為康事美反掃連續多筆反掃扣款，現行需搭配包出apk，進行產出多筆條碼資料，再進行執行扣款

statbucksbinding.js-->星巴克(悠遊生活)授權綁定-->ICPOB0000 (無法修改，固定每筆扣款金額、每月扣款金額上限)

Mertotaxibinding.js-->大都會車隊授權綁定-->ICPOB000 (無法修改，固定每筆扣款金額、每月扣款金額上限)
