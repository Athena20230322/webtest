const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs'); // 引入 fs 模組以進行檔案操作
const dotenv = require('dotenv'); // 引入 dotenv 模組
require('dotenv').config();
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
// 指定 .env 檔案的絕對路徑並載入環境變數
dotenv.config({ path: 'c:/webtest20250123/.env' });


if (!SLACK_WEBHOOK_URL) {
    console.error("錯誤：找不到 SLACK_WEBHOOK_URL 環境變數");
    process.exit(1);
    }
// Your Slack Webhook URL is now loaded from the .env file
//const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
// 你的 Slack Webhook URL


// 取得當前時間
function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `Sample${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

const { tradeNo, tradeDate } = getCurrentTime();

// 交易數據
const data = {
    PlatformID: "10510711",
    MerchantID: "10510711",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "Book1223",
    MerchantTradeDate: tradeDate,
    TotalAmount: "10000",
    ItemAmt: "10000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke",
    RedirectURL: "https://www.books.com.tw/",
};

// AES 密鑰與 IV
const AES_Key = "59953mTrHoNvVrXITDi9e8EQUD6wChxE";
const AES_IV = "n9WiDlxzLMcdV0E4";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA3UEIJEGxYYSbLApvG+7Wy5ODIv/e32N4ekMQSVmwVLTXq0oQQSE+c2vx2V+osQvdlOjD8l8AixFF4duRGP4J1AinoVCwuITfReUcei25WfuYeecAiUMUIuCJpu/U2d5+zcMOmYSzS3xG8+FausgZiek+Xb69B9rJWKyrfAYzVIalXD53czLqohyoiTyMEQWcNbXj6mptV38WtHpc+/IJvwtblGl3ddPHLpg0MrQRd5nKqM6AxOMkxnQkBUs2gfDOXSJSaR6MZNzXTZfCOolhq1kKlof8fTCFjVPsiXYouP8WrUG9tOjDZpJNI8Xg4Dti7wiYhyxYzmHfU0UKZsyLcwIDAQABAoIBAAxH/nhXmN/upsWAaMRRzmSZKOw8EP95zfCxs0lgLAomgRFReH0T3tJ9wnxMM6sjCPlOQXUGTa3qe7/DyF9tIMU/LgZKNYq5ootiBvQjN3Zus7HtsUb/g/toe3AjrghP6N5pvkul7hveMJ97p5yNAL556kvQi4aZluDZRDxm8kd1z7VMsjLEyvN9ryzRlDjW+I0n4SvVfqdyNlOonLdtPh0N3dHc9zaHMD5cUEpJFmsBJ5MX6I8xn60mvL27JwEaYDdADwG+iJPUodm9OSIPq06plBTrESFq3eFdjw3WjxFaWZyw0/c+jGvLnBBYwrUbjFlqiLFtwS0cifkwFkwGV/0CgYEA+UpEBUiOkdfOEaYUyPbrKFdUOLvpaG1XgGq8/x2f+2ai0VLQgd15/vtBfNRm2+V8XeV010Chj51LfnyBVg26VHISmtcNfkr1Ev3AYeh37jx/Vgu0M70UNQFniCtqgyTy52usRajRsCYPUH9rZSyQIALw8wID7FNccq5xueXGgH0CgYEA4zWVXbiHUqSSogf2XOBniIEIQe37GJ+E2gKyrcig6mY5DryDWsvUgKiPZ+F1mUrJji6/+Rc0x2rjQcIo4hb5AOisr1X17dHhIlGGaqui1vOYlV4VxmoGcCCigbHfDBy4xUHdUsPL5pYl1WwnPPla3Sf1GJY4zZgMvf+jCj6Jbq8CgYEA8V/XPMZkRRKPlMcamPt79jOYeNZ5yYMVlmHDXcFxhhp6y/NDsHqiBSGC5ztB3Oj24nOqDkGmLUhAMNic4pWoNNu+5+4SQpaRdTH9dM+CUEqDgO0ULoSFbE1P0ak4GINOLoUy6L/tSIGRkn/NnMjpRBWU97ab1ddhTClcNIMnEIECgYBWKLefdp46RJYmQ4a06ZPZO7T561jQmY0zbtp69B2xRVpVsD7Pa4QF1eWrqt+BZc7Q0AGUX6xwAqRzB0GhmryKD7GMO7iqmnAZJ3klcjip8m3mFmuDdilC091L+TtvyGR4yOU4wW7M3hsyt3SZtqUyQDi9PhoEPKh4VDxrYhOTmQKBgQCuTGqDweio57A/IGZJIQphOKYz4EMD19RaqXCsFx97uRxq6Thx+5tiS7saa+LY8pbhsNUmTlJTbLYfNjozXBHy+sYed3sR1glOYVvqJdAtH0xnsOW8pTVVa95mMPSLC6jPkCZcxWXvtR39Tt3htloI16rAX5ojry4yTWkJXmyUXA==
-----END PRIVATE KEY-----`;

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
function decryptAES_CBC_256(encryptedData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 發送 Slack 訊息
async function sendToSlack(message) {
    if (!SLACK_WEBHOOK_URL) {
        console.error("❌ Slack Webhook URL not configured. Please check your .env file.");
        return;
    }
    try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
        console.log("✅ Sent to Slack successfully");
    } catch (error) {
        console.error("❌ Error sending to Slack:", error.message);
    }
}

// 加密與簽名
const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
const signature = signData(encdata, Client_Private_Key);
const X_iCP_Signature = forge.util.encode64(signature);

console.log("Encrypted Data (EncData):", encdata);
console.log("X-iCP-Signature:", X_iCP_Signature);

// 發送 HTTP 請求
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CreateTradeICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '186044',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
        response += chunk;
    });
    res.on('end', async () => {
        console.log('Response:', response);

        try {
            const responseData = JSON.parse(response);
            if (responseData.EncData) {
                const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                console.log('Decrypted Response Data:', decryptedData);

                const parsedData = JSON.parse(decryptedData);
                if (parsedData.TradeToken) {
                    console.log('Trade Token:', parsedData.TradeToken);

                    // 產生 ICP 支付 URL
                    const icpPaymentUrl = `https://icpbridge-uat.icashsys.com.tw/ICP?Actions=Mainaction&Event=ICPO002&Value=${parsedData.TradeToken}&Valuetype=1`;
                    console.log('ICP Payment URL:', icpPaymentUrl);

                    // 傳送到 Slack
                    await sendToSlack(`🚀 **ICP Payment 博客來UAT跳轉URL**\n${icpPaymentUrl}`);

                    // 在系統上開啟 URL
                    const command = process.platform === 'win32' ? 'start' :
                                    process.platform === 'darwin' ? 'open' : 'xdg-open';
                    require('child_process').exec(`${command} "${icpPaymentUrl}"`);
                }
            }
        } catch (e) {
            console.error('❌ Failed to process response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Error:', e);
});

// 發送請求
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();

// 取得 MerchantTradeNo 並儲存到 .txt 檔案
const merchantTradeNo = tradeNo; // 從 getCurrentTime 函式中取得
const fileName = 'bookMerchantTradeNo.txt';
fs.writeFileSync(fileName, `MerchantTradeNo: ${merchantTradeNo}`);
console.log(`MerchantTradeNo 已儲存到 ${fileName}`);
