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
        PlatformID: "10510013",
        MerchantID: "10510013",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "愛金卡褔利社九九號店3DS",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "400",
        ItemAmt: "400",
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
    const AES_Key = "ONa3KRM6qFHj3C4uwQUm9VtUCyTrj5Rv";
    const AES_IV = "BgLn0JGKPt1iqkEg";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEpAIBAAKCAQEA53oCtwOsvIfUKTpatqCeKHsRk5OG0hNhrApKoD0OFExMDi03w4JA+kIJAciHOwofBfvWuVwW3ysOfx0DUZrSgDjPkaET1+z7hgG3X2onbYPqZfFy7RfkO504BieJUvvYpYSM/sV+XHkIgt3L6VmvBKJoc4k4ak7EaPoOKzU66CWcCf9wmKyottARr2KWlXmGtu55So8jYoXbnQlm3AcqEufvHwcqKbtsg6MEJSDPspHXzntUH49eg7qG3LzmM3glBEBJaFABshSf5NcWeuoNQ1zoAYQUBAcF/Zb2nRZq+zU7gKMIxrPVDJjljOcKqNJd30+UGDwh9s0GmKf3I39gGwIDAQABAoIBAA+EHTR5WZXVoQIWeEgvogpinX3/8JSaWfy3P+NX1F7F8n8sxsUjMQnVbVciQvZRKl0zUWRhaOMStskMf9FziFKx/C/t1S+vIfkMmmcZ7YSoyAiHU8XSySi51CyNb+YRHaeSqATX5i16q3hiN63vpgywekHsW8y8dOv4fwSkb8tpwU2NDkoHm/lv9k2isy6AlKV/ZWODXcbBhkfRy8ShjLOuLrQp5Cjgf6XvtpES4nTlPtJ44d2EoAhzp/pOkb5mDVverpZ5B5H6uRBNxYhEwxItOIVIimgqKAMeB23DUR6RbcqEVcoDFX493in/SR8B1lXVCQs/EJZ2dQX0voZDYPECgYEA6Ifyjpj2ZzLIO8Cn+U/C+9A65bIb5z26oQ14xe3jOKJTBrOBjgTa9KzQRZL9eZFiThR98UtjEzPK4sLFqutkGyWRuOVz8cfYPqQqZx62rJn7dbJa2ndnkj/S2R6sxckBwtwpJF1aeQPJVBWeeECDO1V8T/rkQzY6yc3c5NpJgDMCgYEA/tbRoH5KReI0uOCCgbJZwsgpw4+MZIVWU/LNUQLPMUuVhso92utSTlKE3D64i+4Ju/nCZH7Unf/TpOtfXX2WECsE5pLZYQhYwc/dWpGBNmqLMFAl69QI3EUTvqKOxeUSaJ7CBKzlieCjfTG8W0M/uwD5njDM9AzKrVq+sHFPGHkCgYEAjHRhfOTEIT25WO5cB+m32ybCDLByzlCpBFMA2n2AvFrAT9HptYEVSKmB/CR3WxEIEiWqlS92HskwCZygjUc15nfg95ARYr/VzLCYtEUHDmbMTyF2Y3OwadSHZYJz1dw+ZhdZ+o8w8NvqphGQ8Q32tsZCGoVvj3GYPQFOJiX8M6UCgYEAztv1gX/CLoP2I/QqO7lYX2I3dIT7g0Uw1CgNPas4IF2oXKeiGihWwTj+nAFVsFBjGnEcuJKzaCWX2REucidVPn6NFdUyGy+5TGm81p2x80f9ABSvE4UkRBjWdDJkDoNps/7aowztrkPoseFDchlejB+4gA5A8AHKK3mzvGnduJECgYA4WPflwdwn9OI4o3dVTPM3heFoFgott3Z2vUbeW//yzRgN1E80J0Cvq5+UyON2jcDH2KoUbwJ1+vVZkCRMs1fLUHYtnJGOkJ3PtUu5Sg/Un5q7bszevnPtkMo1zc154vPzFar+TiglwXaJwJ/rGOR1WcpS3Xf2+gi8WwGgq8XZww==\n-----END PRIVATE KEY-----`;

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
            'X-iCP-EncKeyID': '274426',
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