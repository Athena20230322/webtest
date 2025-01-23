#webtest
測試操作方式
執行前確認已安裝Node.js
已安裝完成，需可以顯示版本號
PS C:\webtest> node -v
v18.12.1
PS C:\webtest> npm -v
8.19.2

指令輸入方式範例如下:

C:\webtest node commed.js 

commed.js -->康事美反掃扣款-->ICPOF001
cosmedrefund.js -->康事美退款交易，需手動入訂單號，需用Key and IV 解密Encdata 確認訂單號碼  -->ICPO004
http://107.173.165.164/onlineaes.php

ai-rider.js -->剛鈺停車場反掃扣款-->ICPOF001
marketpayment-->超商反掃付款交易-->ICPOS002
markettopup.js-->超商值值交易_ICPOS004
markettoprefund.js-->超商值值退款_ICPOS005
booksweb.js-->博客來掃瞄web付款 -->ICPO0008
statbucksbinding-->星巴克(悠遊生活)授權綁定-->ICPOB0000
