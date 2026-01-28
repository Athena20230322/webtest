const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs'); // 引入 fs 模組以進行檔案操作

// 你的 Slack Webhook URL
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

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
    PlatformID: "10523643",
    MerchantID: "10523643",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "Foodomo",
    MerchantTradeDate: tradeDate,
    TotalAmount: "10000",
    ItemAmt: "10000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "2",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke",
    RedirectURL: "http://www.google.com",
};

// AES 密鑰與 IV
const AES_Key = "f8gQ57OogEIckcKo4JuQP6n2pojHawZA";
const AES_IV = "stvyCnbBIC5O073X";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAy8V1EdyrQWWQOQ1BAtL42Xau7eWhoB5A3E4niMtCMWPpi9LjBN2NVBjGO4aHjeaVM0bRM4wwf5AeAlhA1uahBipTwdaG0JMAzvPCrTqDPKyeOj7zROG+/ecZuhdOrau5cyDiSRR6rxSfTN9LZCOxlNgNIVLmftLZHnaqiDWoIKN4y8VES8IEeJhIHNIkPllPIHcJXrsmloWlv/29ztSpcDZ2+wO6Oz89mjxZkzhpb7fO6v9AjWq5H/G+qGvwc78ytobckj+IROnKW5XBh8LflhmRhfkyIbR+Uv7KgJb9xBKQb/sjj007UKFORp9Ap92Mh50pGr/jNDRYvdSZ8bTLTQIDAQABAoIBAAwjMymg4Ek2mH7yzX2H6C9j2grs6Pyq8KgZYPzNRqBp2B5uWFFmNPszt+hnHKnqIyxOZTr8eGMQyDN8OEMqB6C2DWPNYx2yCT6f1xJkcC7BWsdouoAkMNvaKSEkLu6PUljg4ORY0O9Je4JOW/pCBLDd/EzmLY6Tq+pxnQ9x9WrEK/2cvWwHdtddFQJXwJpNG+4y6GAoQCVMsK4Dc6Tnv+Fb+iIvhebjZ5nb0NXr1DV/+KVlPDctoda/R5KQIMRoLWBj38AT8gkscMku7qBhG8IzDxTmuJg8mcBLj7LIozMGp+q6U30Z9XA6gHNBvtQdmtveGeImY3dCODJb+ycap20CgYEA0Z1FXnGVHR3qhuW1UigCbpZwzDJwIk07JGBRfHQRqGGMQC/sTtW7g04h1Cv3rg0t3jYLoYPNfc9vbUTZIl8kRCOOySRX4jhjstNsty6FRi7EQF6AqYaHuRiLpnwcDZAizacmJi7rQ+lQ2JFscbYy47gYAKARQlpa8A7oYDo/x6sCgYEA+N0tTzAXgvEOqBembn2Uh0Pz1syjIrNuW1XTzNy216A3e8ATJq+kkqBYg382GX3aC/xU5qUc5EmjJvgskSTfXgWV2cQu/dR83qfPVx8iAM1Xz/y/dT27u/dzbOAa+ZS4Jz+wiQhS72mXdah2lwkoysWIaOIxONfnCprBoYBW4OcCgYEAsBKVVHHAOYcJm2qU1n/5Gv+PnFa5znZlOXcWu52bv37BGqGms8nhCri0vc547GDxqHhpaLCYChgWlwiAA9k7U2ky5U576/BF/s6NwYl4Na3O9+rp1HzGwPoXRC94OQRb17eR2f0Lbi4r1N7C4vmS4amfr9bE6KGRRZigJUSIkqUCgYAdFlzxYIGfAGXiJ8GAMJVnqf2aIZj/uVEww7tZuoJ0eXmCsVSLtQPbT3qJBBliqV8O/5M80heqZyD2sRMkc9bXundlWJTVfjyKGbsWR8FFrrqQyM3n+iszMR0AoMEGYueTTtJncd2ftgvJ6MLTrHJkIOpst+Ng7XtHtgbjxYhiCQKBgQCi8AVp8wdvDZYjfiSsV1jbRme+KWPAajz4mF5Dwsg85RLjpcw4ODzEAvtRcfhtjFPWQBlia2+Pnndcme2DTPinR0QFN3kP7eGrTSbR4DCShP432W5oT4dVEkmAIZ8NBzNNX6KED0Vc/fnQ5SicA3U3TuXVU2eCAi4CTokEa2JuhQ==
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
    try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
        console.log("✅ Sent to Slack successfully");
    } catch (error) {
        console.error("❌ Error sending to Slack:", error);
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
        'X-iCP-EncKeyID': '170541',
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
                    await sendToSlack(`🚀 **ICP Payment URL**\n${icpPaymentUrl}`);

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