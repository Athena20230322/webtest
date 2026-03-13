const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 1. 工具與加密函式 ---
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return forge.util.encode64(rsa.sign(md));
}

function getCurrentTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return {
        refundTradeNo: `R${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,
        tradeDate: `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    };
}

// 讀取檔案解析 (修正讀取邏輯)
function getTransactionDetails(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const details = {};
        fileContent.split('\n').forEach(line => {
            const index = line.indexOf(':');
            if (index > -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                details[key] = value;
            }
        });
        return details;
    } catch (e) { return null; }
}

// --- 2. 設定區 ---
const AES_Key = "59953mTrHoNvVrXITDi9e8EQUD6wChxE";
const AES_IV = "n9WiDlxzLMcdV0E4";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA3UEIJEGxYYSbLApvG+7Wy5ODIv/e32N4ekMQSVmwVLTXq0oQQSE+c2vx2V+osQvdlOjD8l8AixFF4duRGP4J1AinoVCwuITfReUcei25WfuYeecAiUMUIuCJpu/U2d5+zcMOmYSzS3xG8+FausgZiek+Xb69B9rJWKyrfAYzVIalXD53czLqohyoiTyMEQWcNbXj6mptV38WtHpc+/IJvwtblGl3ddPHLpg0MrQRd5nKqM6AxOMkxnQkBUs2gfDOXSJSaR6MZNzXTZfCOolhq1kKlof8fTCFjVPsiXYouP8WrUG9tOjDZpJNI8Xg4Dti7wiYhyxYzmHfU0UKZsyLcwIDAQABAoIBAAxH/nhXmN/upsWAaMRRzmSZKOw8EP95zfCxs0lgLAomgRFReH0T3tJ9wnxMM6sjCPlOQXUGTa3qe7/DyF9tIMU/LgZKNYq5ootiBvQjN3Zus7HtsUb/g/toe3AjrghP6N5pvkul7hveMJ97p5yNAL556kvQi4aZluDZRDxm8kd1z7VMsjLEyvN9ryzRlDjW+I0n4SvVfqdyNlOonLdtPh0N3dHc9zaHMD5cUEpJFmsBJ5MX6I8xn60mvL27JwEaYDdADwG+iJPUodm9OSIPq06plBTrESFq3eFdjw3WjxFaWZyw0/c+jGvLnBBYwrUbjFlqiLFtwS0cifkwFkwGV/0CgYEA+UpEBUiOkdfOEaYUyPbrKFdUOLvpaG1XgGq8/x2f+2ai0VLQgd15/vtBfNRm2+V8XeV010Chj51LfnyBVg26VHISmtcNfkr1Ev3AYeh37jx/Vgu0M70UNQFniCtqgyTy52usRajRsCYPUH9rZSyQIALw8wID7FNccq5xueXGgH0CgYEA4zWVXbiHUqSSogf2XOBniIEIQe37GJ+E2gKyrcig6mY5DryDWsvUgKiPZ+F1mUrJji6/+Rc0x2rjQcIo4hb5AOisr1X17dHhIlGGaqui1vOYlV4VxmoGcCCigbHfDBy4xUHdUsPL5pYl1WwnPPla3Sf1GJY4zZgMvf+jCj6Jbq8CgYEA8V/XPMZkRRKPlMcamPt79jOYeNZ5yYMVlmHDXcFxhhp6y/NDsHqiBSGC5ztB3Oj24nOqDkGmLUhAMNic4pWoNNu+5+4SQpaRdTH9dM+CUEqDgO0ULoSFbE1P0ak4GINOLoUy6L/tSIGRkn/NnMjpRBWU97ab1ddhTClcNIMnEIECgYBWKLefdp46RJYmQ4a06ZPZO7T561jQmY0zbtp69B2xRVpVsD7Pa4QF1eWrqt+BZc7Q0AGUX6xwAqRzB0GhmryKD7GMO7iqmnAZJ3klcjip8m3mFmuDdilC091L+TtvyGR4yOU4wW7M3hsyt3SZtqUyQDi9PhoEPKh4VDxrYhOTmQKBgQCuTGqDweio57A/IGZJIQphOKYz4EMD19RaqXCsFx97uRxq6Thx+5tiS7saa+LY8pbhsNUmTlJTbLYfNjozXBHy+sYed3sR1glOYVvqJdAtH0xnsOW8pTVVa95mMPSLC6jPkCZcxWXvtR39Tt3htloI16rAX5ojry4yTWkJXmyUXA==
-----END PRIVATE KEY-----`;

// --- 3. 執行 ---
const { refundTradeNo, tradeDate } = getCurrentTime();
const details = getTransactionDetails('C:/webtest/bookTransactionDetails.txt');

if (!details || !details.TransactionID || !details.TotalAmount) {
    console.error('❌ 錯誤：無法從檔案讀取 TransactionID 或 TotalAmount，請重新執行查詢程式。');
    process.exit(1);
}

const refundPayload = {
    PlatformID: "10510711",
    MerchantID: "10510711",
    OMerchantTradeNo: details.MerchantTradeNo,
    TransactionID: details.TransactionID,
    StoreID: "TM01",
    StoreName: "BOOK",
    MerchantTradeNo: refundTradeNo,
    RefundTotalAmount: details.TotalAmount, // 確保這裡是數字字串
    RefundItemAmt: details.TotalAmount,
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

const encData = encryptAES_CBC_256(JSON.stringify(refundPayload), AES_Key, AES_IV);
const signature = signData(encData, Client_Private_Key);

const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/RefundICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '186044',
        'X-iCP-Signature': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

console.log(`[執行退款] 單號: ${refundPayload.OMerchantTradeNo}, 金額: ${refundPayload.RefundTotalAmount}`);

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => response += chunk);
    res.on('end', () => {
        console.log('\n--- 伺服器回應 ---');
        try {
            const resObj = JSON.parse(response);
            console.log(`RtnCode: ${resObj.RtnCode}, RtnMsg: ${resObj.RtnMsg}`);
            if (resObj.RtnCode == 1) console.log("✅ 退款成功！");
            else console.log("❌ 退款失敗。");
        } catch (e) { console.error("解析回應失敗"); }
    });
});

req.write(`EncData=${encodeURIComponent(encData)}`);
req.end();