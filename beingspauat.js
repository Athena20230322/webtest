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
        PlatformID: "10511339",
        MerchantID: "10511339",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "SPA",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "1000",
        ItemAmt: "1000",
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
    const AES_Key = "gUBgxSJ3bvKp2dtgrA40XxrpslvCNABN";
    const AES_IV = "BLZZ5mACZJ9atujc";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEowIBAAKCAQEA0VqkL3pZj5n2x4gaLLBLdBe6y6g1n0SypfX5a/qFWcQCiKYBZmBACa/3htcRePN2vlnLickCbplM4Aq0kbEOfYmMHKeWa14QoMuTyLfWfOeHwKCFMed0HOVm6nqE+bIhstSVPBx6Jyarlf6FueURxfJ1kWnnG07kApn1kCqb92BM0PHtSYQA3UFfa8CuQACqPQIDVkOOdlxzJP2ayJmyr8SIu0YS4QtGxyw2giockt2GOpragg+7urcYS7SQ8bHQvo+Sa3iUMkdeO3+wAd8ZLy27C3kRBUHR04etgEoKbQwP0SMrKqHrQ6vqEMFV+n0h2985H76VWGJiPKH0ug51mwIDAQABAoIBAE5XKNFLa3A9IQeRepn2boXGy3OiQk6TGnbYELnDSVtJ6djQpf11TwFRA8NFf5hPIsQgPfYVbf+NBiNgXimWo+F+MxwV6kfLL1W8WFTn1i9vRHFkn/MItX6KqXRc3J3DdrDAtAeGcH9uDQ9X6xqhCYGVNUFw67ZgUxpWGnoUN8DdbvSO3c196jeVSsFvYue6SHLA+/HWe2WryzFBa+cHJR+/aXSgWs/q5VheeXCrc/kg/r+NGKf+RVTJohz8HRNiLNPYJItXqWt7sQS5FUkdXM5iDJFi7Fh78TmI9OjpcbeavyKgZ4a77ddVVZJbqA3MESeIdSDYJ499bkxwiBWpTGECgYEA3ascRFsCQ7GWXK3hNgB2hwRibIEGVJ0E4J3koNAl3hTe7GaWLWfSpFDSpvvlMAa+d89tEV6PKSpzh/KBf7BAvh2ZjaXCsE2jVyfPPHMq5S2DDk4snb2oP42d/H2FPaT+Ch+HQLjPfHFDQMKdbonB8am5WQu25vQYDfX7W/7WCWcCgYEA8cdIQLUYumYsAmESKCEr2lkNVb/LI2zJmKeeScJ5Ibz2olfXcbnMZHa6PxJOZUv5uobyky4JI6wKtHsfgSoRE2apL3OI1B5gVmg4oqJXx3zlz5GrgiaRlA2atQqiyK2z2DVPJcmYw2IuEdI9hDcbpz5dhyBgR/htQm1T/+1FLa0CgYB84R4eoErpSg3UjpzW6HHd5KlySUoAtyj9RdZ8hmce8xEXiz/Furzflyzlp/lZEiORqcjfRS9P2LuXdhZgkjIXKOPN+flxi3ue6S2F97fNvtMbZw0ZnLRBgY3kpe4/aUk4+MQgwT0a9VAXFszMbk1V0PE7ai8Tc6ZtjwuZqzp3twKBgQDSuQxZET1nICuVO0NW5GpTGLBNnyaOTn955AVKZgurAwW2QncMsJHasbvrwqm/EbOrBXigHExs4cJGwNSZf694SE6Gg9yqe3sddCKAZJu6yzmEaoKfobvZ3O2MgqOT4gjQFM5Rsd3J1GUwtRtWg60/W1Sqs+YWdAfOEHlYolRb1QKBgH6uIqn7ZLqoTtqK+kYqlCF7g8BXT13/owh97rBqj5Irn9LLNVr3R6HH6EXm3PfiTlU+Z6tiMP9czmfM6083G3dATAKi83M3MZC96TH+yW+NAwlMGI14BwZGb4XEja/NRB/Ux8CRLdsRZFHDrE3UTiRr5c5erCvJ2ysRieIGaD5T
    -----END PRIVATE KEY-----`;

    // 加密與簽名
    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    console.log("Encrypted Data (EncData):", encdata);
    console.log("X-iCP-Signature:", X_iCP_Signature);

    // 發送 HTTP 請求
    const options = {
        hostname: 'icp-payment-preprod.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/DeductICPOF',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '126259',
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
