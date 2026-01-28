const https = require('https');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');

// 動態生成當前時間的函式
function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `Sample${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

// AES 加密
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// AES 解密
function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 啟動 readline 等待使用者輸入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BarCode): ', (inputBarCode) => {
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

    // 加密與簽名
    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    console.log("Encrypted Data (EncData):", encdata);
    console.log("X-iCP-Signature:", X_iCP_Signature);

    // 發送 HTTP 請求
    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/DeductICPOF',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '202775',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        res.on('end', () => {
            console.log('Response:', responseData);

            try {
                // 解析並解密 EncData
                const responseJSON = JSON.parse(responseData);
                const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                const parsedResponse = JSON.parse(decryptedResponse);

                console.log("Decrypted Response:", parsedResponse);

                // 取得 TransactionID 和 MerchantTradeNo
                const { TransactionID, MerchantTradeNo } = parsedResponse;

                // 儲存到 .txt 檔案
                const output = `TransactionID: ${TransactionID}\nMerchantTradeNo: ${MerchantTradeNo}`;
                fs.writeFileSync('TransactionDetails.txt', output);
                console.log("Transaction details have been saved to TransactionDetails.txt");
            } catch (error) {
                console.error("Error decrypting or parsing response:", error);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e);
    });

    const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
    req.write(encodedEncData);
    req.end();

    rl.close();
});