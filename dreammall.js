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
        PlatformID: "10536850",
        MerchantID: "10536850",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "Dream mall",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "10000",
        ItemAmt: "10000",
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
    const AES_Key = "iarvVdpQFXIRbB9kdrDfOJB81iJDWEWi";
    const AES_IV = "WfeMB9CoNGpfkhz0";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEowIBAAKCAQEA3Pp0Hua3BqSi5PjnAbkpFbE6scqfnmv8ryPUVYlZePikFACcSksXdh7gFU+Zg7fK62JEKHsylikqytx8COnwXZEsV72xBOKJMhE/CQmNICMpAPPFN5SLzc5UJ/NqJ9kcuyfIRSUphj8T9tP5f5vFzzIAw/YhCV+kbnW4A3YCrJBrQquarV3w55y513zWlOIzJsfUPtJtCsh2y0jLcdAyhovGWDeLTtwYMIWwFuaC1jBq8B4EwLFupciBWK5FIO0iBpzC1Y4iVFZuz1T8myoyPZbd2F1zXuS82uKK5UkUhWl/obqZ3P9lvGUQJDFOkP8xcgHRI6VQwpes0/r48Yf09wIDAQABAoIBAA8MY0IDdi1Wot0y8hBU+q5GfnfDE7GnKvMGXpxgmR462HmgPQR2LqfVnG73F743kvMKoxeapCxDq21bLHsy6zKEA2AKQ/bQMoWdVQyZgOnSWyV8dE6/p/Gg/mwmEHGcQG+iWuoSiMximUpyzwfYpNTiU9kEduV7hOgcziY2MCJuJun6gj7qU72R/rTIq2Xw9t0FUnMopUiB82yMMZ7jve4WFh/PBftrJgWhGICIC4MmZ9TmoAdQmYfKdXmIKDPOUalxzwsXycZ6mri4VYjM7/llyJFtAiXcvfskyiYCfzdokkT1xIIum0O7PlDxJmOVI5+H+mV2wL0Ltj2RfRRxE9ECgYEA8S19WcKL9SqKbEwPoOyAzKrdHhty1UQXde4x6BhIOqPi+m1ndF+tW+/EjTe3ZLc9PfCtcAvw2XRWKGAER/GqyTy4xL8op/nc4KToGPbsndJLh7z5HcZHgn0n+uWZehuiY2wnCX9QozbRdDRmYbHOvRhV+Jmd4iA7SMtiUUFlDOkCgYEA6o8piYLoUPtwA56e7kQmnfPY2GmFFNAzKIdMzB0qxI69byvZ6QVCRSC9koRLKhkalWBaVDx9FA1eFYQSOnKgvEPtQcdOT9V9ydwCpJg5ooK2FhSlzqJfLEMRu9VufGtIBIvYMpWaQauxNFU8mEfI2X7rzpcn8ag+QpOJ/azqRt8CgYAbYg/WbilX58GZtDUeD1w8YLYEYhdysW18fVP7Ry6EQfFWf698XhSf2KRXaFkRPWDdtILsst5gwj26DdTOmljKynMsG4wxLkRu2SplEzwgWy0qN0GNqOKbpTwx13nKjHKumSwBfwwXy/SSHhT1yKtxet7gAAkWEJTKmhUKpsMjaQKBgQDUBLoQEWM7KDwVGYEhcDrT1cHxxFfF+3fyr3IMomSxLTEwVxvu1JEVeUXCNZDXqb9svJ6Ju+93e6nKmwn7CPgflOrV5Xj1Es5T82n0K6EVMz+x79H8WKrckHdsKL1o+3Qqn9m5x56as75GxrEyGNkFOAOgRuOVPXWhqkk2IuHVUwKBgCo5YrB82E1YXWXcJHldFEPegxGaaCE2KzoNlbDvUl3PWaJ0bxrSpFAKmInb5fFnRx5Hxi6gmx06vy8IO6vybtKWjzkvFCHFaIKJwyodoPtmzBiCHRDxCTvX8sRJLAlWpJVxpxcBHLwAa+bStR7k5fKh/ukDKL+UNsRr4fYSE/2q
    -----END PRIVATE KEY-----`;

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
            'X-iCP-EncKeyID': '277162',
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
