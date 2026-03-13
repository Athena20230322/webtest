const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');

// --- 功能函式 ---

function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return forge.util.encode64(rsa.sign(md));
}

// --- 1. 讀取單號 (確保路徑與 bookswebUAT.js 一致) ---
const filePath = 'C:/webtest/bookMerchantTradeNo.txt';
let originalMerchantTradeNo = "";

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // 使用正則表達式抓取 MerchantTradeNo: 後面的字串
    const match = fileContent.match(/MerchantTradeNo:\s*(\S+)/);
    if (match && match[1]) {
        originalMerchantTradeNo = match[1].trim();
        console.log(`[讀取成功] 準備取消交易單號: ${originalMerchantTradeNo}`);
    } else {
        throw new Error("檔案內容格式不正確");
    }
} catch (err) {
    console.error(`[讀取失敗] 找不到單號檔案: ${err.message}`);
    process.exit(1);
}

// --- 2. 設定參數 ---
const AES_Key = "59953mTrHoNvVrXITDi9e8EQUD6wChxE";
const AES_IV = "n9WiDlxzLMcdV0E4";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA3UEIJEGxYYSbLApvG+7Wy5ODIv/e32N4ekMQSVmwVLTXq0oQQSE+c2vx2V+osQvdlOjD8l8AixFF4duRGP4J1AinoVCwuITfReUcei25WfuYeecAiUMUIuCJpu/U2d5+zcMOmYSzS3xG8+FausgZiek+Xb69B9rJWKyrfAYzVIalXD53czLqohyoiTyMEQWcNbXj6mptV38WtHpc+/IJvwtblGl3ddPHLpg0MrQRd5nKqM6AxOMkxnQkBUs2gfDOXSJSaR6MZNzXTZfCOolhq1kKlof8fTCFjVPsiXYouP8WrUG9tOjDZpJNI8Xg4Dti7wiYhyxYzmHfU0UKZsyLcwIDAQABAoIBAAxH/nhXmN/upsWAaMRRzmSZKOw8EP95zfCxs0lgLAomgRFReH0T3tJ9wnxMM6sjCPlOQXUGTa3qe7/DyF9tIMU/LgZKNYq5ootiBvQjN3Zus7HtsUb/g/toe3AjrghP6N5pvkul7hveMJ97p5yNAL556kvQi4aZluDZRDxm8kd1z7VMsjLEyvN9ryzRlDjW+I0n4SvVfqdyNlOonLdtPh0N3dHc9zaHMD5cUEpJFmsBJ5MX6I8xn60mvL27JwEaYDdADwG+iJPUodm9OSIPq06plBTrESFq3eFdjw3WjxFaWZyw0/c+jGvLnBBYwrUbjFlqiLFtwS0cifkwFkwGV/0CgYEA+UpEBUiOkdfOEaYUyPbrKFdUOLvpaG1XgGq8/x2f+2ai0VLQgd15/vtBfNRm2+V8XeV010Chj51LfnyBVg26VHISmtcNfkr1Ev3AYeh37jx/Vgu0M70UNQFniCtqgyTy52usRajRsCYPUH9rZSyQIALw8wID7FNccq5xueXGgH0CgYEA4zWVXbiHUqSSogf2XOBniIEIQe37GJ+E2gKyrcig6mY5DryDWsvUgKiPZ+F1mUrJji6/+Rc0x2rjQcIo4hb5AOisr1X17dHhIlGGaqui1vOYlV4VxmoGcCCigbHfDBy4xUHdUsPL5pYl1WwnPPla3Sf1GJY4zZgMvf+jCj6Jbq8CgYEA8V/XPMZkRRKPlMcamPt79jOYeNZ5yYMVlmHDXcFxhhp6y/NDsHqiBSGC5ztB3Oj24nOqDkGmLUhAMNic4pWoNNu+5+4SQpaRdTH9dM+CUEqDgO0ULoSFbE1P0ak4GINOLoUy6L/tSIGRkn/NnMjpRBWU97ab1ddhTClcNIMnEIECgYBWKLefdp46RJYmQ4a06ZPZO7T561jQmY0zbtp69B2xRVpVsD7Pa4QF1eWrqt+BZc7Q0AGUX6xwAqRzB0GhmryKD7GMO7iqmnAZJ3klcjip8m3mFmuDdilC091L+TtvyGR4yOU4wW7M3hsyt3SZtqUyQDi9PhoEPKh4VDxrYhOTmQKBgQCuTGqDweio57A/IGZJIQphOKYz4EMD19RaqXCsFx97uRxq6Thx+5tiS7saa+LY8pbhsNUmTlJTbLYfNjozXBHy+sYed3sR1glOYVvqJdAtH0xnsOW8pTVVa95mMPSLC6jPkCZcxWXvtR39Tt3htloI16rAX5ojry4yTWkJXmyUXA==
-----END PRIVATE KEY-----`;

const cancelData = {
    PlatformID: "10510711",
    MerchantID: "10510711",
    OMerchantTradeNo: originalMerchantTradeNo,
};

const encDataString = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);
const signature = signData(encDataString, Client_Private_Key);

// --- 3. 發送請求 ---
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CancelICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '186044',
        'X-iCP-Signature': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('\n--- 伺服器回應 ---');
        try {
            const responseJSON = JSON.parse(responseData);
            if (responseJSON.EncData) {
                const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                console.log("解密明文:", JSON.parse(decryptedResponse));
            }
            console.log("RtnCode:", responseJSON.RtnCode);
            console.log("RtnMsg:", responseJSON.RtnMsg);

            if (responseJSON.RtnCode === 1) {
                console.log("✅ 取消交易成功！");
            } else {
                console.log("❌ 取消失敗。提示：若已付款，請改用退款 API。");
            }
        } catch (error) {
            console.error("解析回應失敗:", responseData);
        }
    });
});

req.on('error', (e) => { console.error('請求錯誤:', e.message); });
// 傳送格式統一為 EncData=xxxx
req.write(`EncData=${encodeURIComponent(encDataString)}`);
req.end();