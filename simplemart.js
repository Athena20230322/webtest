const readline = require('readline');
const { getCurrentTime, sendEncryptedRequest, writeKeyValueFile } = require('./lib/icpCommon');

// 啟動 readline 等待使用者輸入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BarCode): ', async (inputBarCode) => {
    // 取得當前時間
    const { tradeNo, tradeDate } = getCurrentTime();

    // 模擬店家數據
    const data = {
        PlatformID: "10511196",
        MerchantID: "10511196",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "美廉社3DS",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "150100",
        ItemAmt: "150100",
        UtilityAmt: "0",
        CommAmt: "0",
        ItemNonRedeemAmt: "0",
        UtilityNonRedeemAmt: "0",
        CommNonRedeemAmt: "0",
        NonPointAmt: "0",
        Item: [
            { ItemNo: "001", ItemName: "測試商品1", Quantity: "1" },
            { ItemNo: "002", ItemName: "測試商品2", Quantity: "1" },
        ],
        BarCode: inputBarCode.trim(), // 使用者輸入的條碼
    };

    // AES 密鑰與 IV
    const AES_Key = "fGZblcB5mqKaZODh2poRTafdFtsul14o";
    const AES_IV = "fs0uM1EcLRE6UeqQ";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA76IaEIWtFyEnUdRkdzNO1Z1Yc62TvwVlI4I3wlJKF9a3ml6jH7IyBe4W9Utm0LhvU1LDZM/ccqJ8c78dYOGuwCpsi6HrLNRJ3INjCC3z5X7zlLDKdIRkn9dI9/b8kIAPEWAePfCKIb9mlk4aFX1LjkhoghSa2r6S0VRRLalTHOvPlzIxv1nde958VTERvB0FNY9kanIsXLvcY1tAeVNW0Oo/LJxsHpV89RqWWcIpbELZIIqIy4JZSkOFl9quBqLUEM5b/VVJMZVZDG9Z046Kk5EM6tjOrJ5OHE/G+6f8N1PcmFWyGHC+C0ppHLQWO1/IbGeWur4+Dja4Noo1kqTGDwIDAQABAoIBABr9KayuXuTJ00kIP/pxjmbzrj3KZmdaFF6FRiy+Ijcrc96l2v8buD4/vFk10VIfpkt++PUWjhsLyYgrFa7O1uTbbQHlo3xB5UG55degKVCHKv2WUxmqvD8zuuBRR80p3HNAspdCS08VZK34BOsNA2ChL21lzwe6Sq8wgmYUpIDkpwqy1A53py7RBbd4HsD/RQZVGPCclgw2NfgT0NcATAPDXiFd41A02Avi3+YW0Q5uo9RlxMPxsNVGLvP0vxFLFFc3/BGJT4nWpW2fhV931ygMcv86ioEot7190cbkPFuIph+/MVcM+eI5ZOtyVrFwsL/Wy/6X1AkO3KmBW/ghyFECgYEA9kOq+S6KvkHiFDYMs1nMl4bE7wIICD2Dh4jtYd77izpsuyoMF8OAkhbv/KdE3dmRywLSoG6ST+X+glHcaySwh4oKwgXUh+xA4HX2euIwG6t9QK59i3UwLDu8khLS6GYlGozduJTJhYtiS7ES+frF7zYQ/2VXeYEBLaa2sQHd0PECgYEA+RtSxwPoj/tHK5a6fFiRRejYgd591GSfgDy+xqYwLOH8xs0TjrTY2XpbjpIxNR/j64e6m3a4V/7udC27Pdiv1JI4o+5+0N94t4oWGxPZCeKPIOP1yi2OIvTrlLO4isgUAxQrOWi0iREXUa/vHmwCt5SWWweaNCu4G9vVP0CMBv8CgYBZIZS4K4g75EyXVBi0sUPDdBvDBdEyalE4tO52Bea1Nag09br6vt/CAFtL7p6WTTDfcV4aguqh0HSVZluIy/a4l9Xc849AwtmYZBmZ0FPpL+BdkMoPt5J/7/8IP5fmVVIIkgON0ww9MX2aN7TOlV0ef0sXpO5MI8zxYO2ukyZdgQKBgQDGnD5XZopZoaKQ4lA1K/hHoOpeQSJZ4RA6kjQY9g+a+WMsrf1V3mK2opO1DGInVRHHjCQAJ5u6rQs5neyX1tf5x8tZCKIbrtD0pSgS1rRI6VXsh1REqiWVQWlC2jfcjsFF4yLDVvP6BKJvArLHsp5H+DQYx+ruhZz4uUFAeRoryQKBgQC1NVpw/pbz56zEA8WYRqKX5ujx0UI/u1h78sB1zNYBCY4ed6cqAN5ilgruFu6+AzJ5zVC+hJB9PGs0vWWj1dP7YWFE2ZjtGY6rBU0Zz7w5h6v2ITtDb3g6l1IANgNAmBt23/JmkCUYUlb5YoFo9bD+sfo5QpMj51nn1o1TvezQtQ==\n-----END PRIVATE KEY-----`;

    try {
        const result = await sendEncryptedRequest({
            payload: data,
            aesKey: AES_Key,
            aesIv: AES_IV,
            privateKey: Client_Private_Key,
            encKeyId: '202775',
            path: '/api/V2/Payment/Pos/DeductICPOF',
        });

        console.log("Encrypted Data (EncData):", result.encData);
        console.log("X-iCP-Signature:", result.signature);

        if (result.dryRun) {
            console.log("DRY_RUN=1 enabled; request was not sent.");
            return;
        }

        console.log('Response:', result.responseData);
        console.log("Decrypted Response:", result.parsedResponse);

        const { TransactionID, MerchantTradeNo } = result.parsedResponse;
        writeKeyValueFile('TransactionDetails.txt', { TransactionID, MerchantTradeNo });
        console.log("Transaction details have been saved to TransactionDetails.txt");
    } catch (error) {
        console.error("Error sending, decrypting, or parsing response:", error);
    } finally {
        rl.close();
    }
});
