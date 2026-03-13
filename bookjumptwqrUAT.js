const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs');


const dotenv = require('dotenv');

// 1. 先指定絕對路徑並載入環境變數
dotenv.config({ path: 'c:/webtest20250123/.env' });

// 2. 載入後再進行賦值
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// 3. 檢查變數是否存在
if (!SLACK_WEBHOOK_URL) {
    console.error("錯誤：找不到 SLACK_WEBHOOK_URL 環境變數，請檢查 c:/webtest20250123/.env 檔案內容");
    process.exit(1);
}
console.log("-----------------------------------------");
console.log("🚀 模式：直接使用內嵌 Slack URL");
console.log("✅ Slack Webhook 已就緒");
console.log("-----------------------------------------");

// --- 2. 設定密鑰 ---
const AES_Key = "59953mTrHoNvVrXITDi9e8EQUD6wChxE";
const AES_IV = "n9WiDlxzLMcdV0E4";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA3UEIJEGxYYSbLApvG+7Wy5ODIv/e32N4ekMQSVmwVLTXq0oQQSE+c2vx2V+osQvdlOjD8l8AixFF4duRGP4J1AinoVCwuITfReUcei25WfuYeecAiUMUIuCJpu/U2d5+zcMOmYSzS3xG8+FausgZiek+Xb69B9rJWKyrfAYzVIalXD53czLqohyoiTyMEQWcNbXj6mptV38WtHpc+/IJvwtblGl3ddPHLpg0MrQRd5nKqM6AxOMkxnQkBUs2gfDOXSJSaR6MZNzXTZfCOolhq1kKlof8fTCFjVPsiXYouP8WrUG9tOjDZpJNI8Xg4Dti7wiYhyxYzmHfU0UKZsyLcwIDAQABAoIBAAxH/nhXmN/upsWAaMRRzmSZKOw8EP95zfCxs0lgLAomgRFReH0T3tJ9wnxMM6sjCPlOQXUGTa3qe7/DyF9tIMU/LgZKNYq5ootiBvQjN3Zus7HtsUb/g/toe3AjrghP6N5pvkul7hveMJ97p5yNAL556kvQi4aZluDZRDxm8kd1z7VMsjLEyvN9ryzRlDjW+I0n4SvVfqdyNlOonLdtPh0N3dHc9zaHMD5cUEpJFmsBJ5MX6I8xn60mvL27JwEaYDdADwG+iJPUodm9OSIPq06plBTrESFq3eFdjw3WjxFaWZyw0/c+jGvLnBBYwrUbjFlqiLFtwS0cifkwFkwGV/0CgYEA+UpEBUiOkdfOEaYUyPbrKFdUOLvpaG1XgGq8/x2f+2ai0VLQgd15/vtBfNRm2+V8XeV010Chj51LfnyBVg26VHISmtcNfkr1Ev3AYeh37jx/Vgu0M70UNQFniCtqgyTy52usRajRsCYPUH9rZSyQIALw8wID7FNccq5xueXGgH0CgYEA4zWVXbiHUqSSogf2XOBniIEIQe37GJ+E2gKyrcig6mY5DryDWsvUgKiPZ+F1mUrJji6/+Rc0x2rjQcIo4hb5AOisr1X17dHhIlGGaqui1vOYlV4VxmoGcCCigbHfDBy4xUHdUsPL5pYl1WwnPPla3Sf1GJY4zZgMvf+jCj6Jbq8CgYEA8V/XPMZkRRKPlMcamPt79jOYeNZ5yYMVlmHDXcFxhhp6y/NDsHqiBSGC5ztB3Oj24nOqDkGmLUhAMNic4pWoNNu+5+4SQpaRdTH9dM+CUEqDgO0ULoSFbE1P0ak4GINOLoUy6L/tSIGRkn/NnMjpRBWU97ab1ddhTClcNIMnEIECgYBWKLefdp46RJYmQ4a06ZPZO7T561jQmY0zbtp69B2xRVpVsD7Pa4QF1eWrqt+BZc7Q0AGUX6xwAqRzB0GhmryKD7GMO7iqmnAZJ3klcjip8m3mFmuDdilC091L+TtvyGR4yOU4wW7M3hsyt3SZtqUyQDi9PhoEPKh4VDxrYhOTmQKBgQCuTGqDweio57A/IGZJIQphOKYz4EMD19RaqXCsFx97uRxq6Thx+5tiS7saa+LY8pbhsNUmTlJTbLYfNjozXBHy+sYed3sR1glOYVvqJdAtH0xnsOW8pTVVa95mMPSLC6jPkCZcxWXvtR39Tt3htloI16rAX5ojry4yTWkJXmyUXA==
-----END PRIVATE KEY-----`;

// --- 3. 取得時間 ---
function getCurrentTime() {
    const now = new Date();
    return {
        tradeNo: `Sample${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`,
        tradeDate: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    };
}

const { tradeNo, tradeDate } = getCurrentTime();

// --- 4. 交易數據 ---
const data = {
    PlatformID: "10510711",
    MerchantID: "10510711",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "Book1223",
    MerchantTradeDate: tradeDate,
    TotalAmount: "1000",
    ItemAmt: "1000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke",
    RedirectURL: "https://www.books.com.tw/",
};

// --- 5. 工具函式 ---
function encryptAES_CBC_256(text, key, iv) {
    return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();
}

function decryptAES_CBC_256(encrypted, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
}

function signData(text, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(text, 'utf8');
    return forge.util.encode64(rsa.sign(md));
}

async function sendToSlack(message) {
    try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
        console.log("✅ 已成功發送訊息至 Slack");
    } catch (err) {
        console.error("❌ Slack 發送失敗:", err.message);
    }
}

// --- 6. 執行加簽 ---
const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
const X_iCP_Signature = signData(encdata, Client_Private_Key);

// --- 7. 發送 API 請求 ---
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
    res.on('data', chunk => response += chunk);
    res.on('end', async () => {
        try {
            const resObj = JSON.parse(response);
            if (resObj.EncData) {
                const decrypted = JSON.parse(decryptAES_CBC_256(resObj.EncData, AES_Key, AES_IV));
                if (decrypted.TradeToken) {
                    const payUrl = `https://icp-payment-preprod.icashpay.com.tw/Payment/Redirect/ICP?Actions=Mainaction&Event=ICPO002&Valuetype=1&Value=${decrypted.TradeToken}`;

                    console.log('🔗 跳轉 URL:', payUrl);
                    await sendToSlack(`🚀 **ICP Payment 博客來TWQR UAT**\n單號: ${tradeNo}\n金額: 1000\nURL: ${payUrl}`);

                    const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
                    require('child_process').exec(`${startCmd} "${payUrl}"`);
                }
            } else {
                console.log('⚠️ API 回傳錯誤:', resObj);
            }
        } catch (e) {
            console.error('❌ 回傳處理失敗:', e.message);
        }
    });
});

req.on('error', e => console.error('❌ 請求錯誤:', e));
req.write(`EncData=${encodeURIComponent(encdata)}`);
req.end();

// --- 8. 存檔 ---
fs.writeFileSync('bookMerchantTradeNo.txt', `MerchantTradeNo: ${tradeNo}`);
console.log(`📝 單號 ${tradeNo} 已存檔`);