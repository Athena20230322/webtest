#WEBTEST_2025

測試操作方式如下

執行前需確認已安裝Node.js

已安裝完成，需可以顯示版本號

C:\webtest> node -v

v18.12.1

C:\webtest> npm -v

8.19.2

指令輸入方式範例如下:

C:\webtest node commed.js 

commed.js -->康事美反掃扣款-->ICPOF001

cosmedrefund.js -->康事美退款交易-->ICPO004 (需先執行康事美反掃扣款，執行康事美退款交易才能成功)

http://107.173.165.164/onlineaes.php

ai-rider.js -->剛鈺停車場反掃扣款-->ICPOF001

books.js -->博客來股份有限公司反掃扣款-->ICPOF001

marketpayment.js-->超商反掃付款交易-->ICPOS002

markettopup.js-->超商值值交易_ICPOS004

markettoprefund.js-->超商值值退款_ICPOS005

booksweb.js-->博客來掃瞄web付款 -->ICPO0008

statbucksbinding.js-->星巴克(悠遊生活)授權綁定-->ICPOB0000 (無法修改，固定每筆扣款金額、每月扣款金額上限)

Mertotaxibinding.js-->大都會車隊授權綁定-->ICPOB000 (無法修改，固定每筆扣款金額、每月扣款金額上限)
