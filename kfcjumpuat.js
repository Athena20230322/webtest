require('dotenv').config(); // Load environment variables from .env file
const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs'); // 引入 fs 模組以進行檔案操作

// Your Slack Webhook URL is now loaded from the .env file
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

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
    PlatformID: "10523426",
    MerchantID: "10523426",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "富利餐飲PK",
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
    RedirectURL: "https://script.google.com/macros/s/AKfycbweCmH_oClGBqUaz0QrhT764SAnXgDLxsNwC9clq9dS5gVJkcNJSXT27fyjbrB3wlXDzQ/exec",
};

// AES 密鑰與 IV
const AES_Key = "gXvqtpnfjRpX0YgQLLWUrgrRDzOS8EMB";
const AES_IV = "uGCGKfaalcObZ42J";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAwxbiPTraZ1lao7/AMwcf9riF4NslY9EtOxpQhUZ5ic3U3TlCGR4yWQATqop1QirYkYiREy5FS4IHLMNpdCoMJiWQTYpQeSDfWAra22Qac6SidQfP64UzV4VRE3ZLFo1wLYwkvB5Y4deZAMr5IcK4D6S9Y02mb74UaEM91gMSq75e0Tx8scCZVZG+Er6VObqOfWhirORaEaD98uMvKRdd+x0BfXyRcf7KVISr0cDvIwBL4CCfRry+YZIjyyXSsdLBsN5xDzFtDR81Glq6imjm91232ySx9RchpH4eJV8+fW3e+gTysS3kTT7tApgZx24kPi/WF58HcuAgKX4wQTM1owIDAQABAoIBABc8Ov7a6xdDC6oUFPKe5x4t9PgGccoVKENxS2TMM36HrtIYVziBobJ68Vyu9+9FBh0zPEAiEyu+lVcuAPnOZjsG30x07Ee49BDa3h0iK4pZceXpY8ijyS0j2jesr53Eg7dRCTEElkZztKvlAM4WEHEAiHPy1B9b7rdKRuud2xPsN1pvmHnNMSIN85GytdX1yQM2fBr9BKLHNbdSMe/gkOdpdxSC8i/giJVcOEsP891zY4LgHBnd2R/vQOJfeWoCIBbn5bMcPkKL5Kq/sUWadC2FYHT5E71281VSmqsvWoT0Q1sVasdtIjK2mqc8c0Ob2uYPRPcewe+HxeokzUVDdiECgYEAxOOBEuYM1K6WDmd02LgCNRXIA+p+OJ1A38wmrSK7uJDjkazxmDN0XWxOJwy/J9cEwn5L7MWtMCkAbivMBksrwFvEcCwHqdheHgbnluZctO5KAQ3FfnCjL0q5homeVKTMhXV6YX+95k1UDFOuRcFE0BWWnvh56vk7J4E9tr/ZNIMCgYEA/akWvZBIxNMXxerOsiMcsZjWyXdvvHpmGn5O7GJnXKvKZseazuie6J9PkiAPknrTR3NjzzgSZI8b7HBsH22ap15AoqTRMosvzp80O7AgRk4Y6cY4jxYZkE9wVgVDFF/UByK/NiLlCr8ZleTgyuNX1c84WPB7vmLs5dWSHDHPcGECgYAOMGMV7JRSI37W7OfD0ob+MmKmvZh5FgQd3MWQxqcGpxJvZipHELY7IVoEgGuqQFmsdpOcLabMiLfqOKfMcFBn3XUrrFClEd2+hjrcah+WPnIA33AzK4TnHJiANJy/dtzyZUP7kMwrs7jx5nnxtvrxkAy5yihnIaz8rNi4udy6ZwKBgQCvUlx+Xyh8qe5nhFiitTQS6DGkhCG9otfJff2s0oLggXheu52bXxrea6ZCuFgrBSvc2btlsTq9OFCzhiylOEtJXRLNl59kEOHVLSKcEqrsDPSZN8FF3J+Ep/Nb8T0g6u8Qk4qXr1yhpd3YRZ69fI7sH9KxXl4ZBCT64jeftynKYQKBgBhv/29Y5DVfRdGgZwufpCCdtUGlncJVkfurDGnHdoDrfWGXjTMZVetE9Q7dbDO4xG4wX057qGnUlDBltZbqp40pgmZdNe4mEYOo4YFTXRSRee74EQ037kjix8z7CiCTou9RXxd5o23jWVM7Ecrpm0tAay2lDT6ZwJFf1Pq2jcJ8
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
        'X-iCP-EncKeyID': '166055',
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
                    const icpPaymentUrl = `https://icpbridge.icashsys.com.tw/ICP?Actions=Mainaction&Event=ICPO002&Value=${parsedData.TradeToken}&Valuetype=1`;
                    console.log('ICP Payment URL:', icpPaymentUrl);

                    // 傳送到 Slack
                    await sendToSlack(`🚀 **ICP Payment UAT 富利餐飲PK跳轉URL**\n${icpPaymentUrl}`);

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
const fileName = 'kfcMerchantTradeNo.txt';
fs.writeFileSync(fileName, `MerchantTradeNo: ${merchantTradeNo}`);
console.log(`MerchantTradeNo 已儲存到 ${fileName}`);
