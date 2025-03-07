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
    PlatformID: "10537061",
    MerchantID: "10537061",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "KFC",
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
    RedirectURL: "https://www.google.com",
};

// AES 密鑰與 IV
const AES_Key = "Tu62LBOEUYRZYPXKPDpe4Ta5F3WoxBmR";
const AES_IV = "2weaUNr9QyqzA6Sx";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAoHgVN1Y/4WGIdqrvePvFOz6G3sbxR9KzIqZxdPGqmmqOfyXSBOdmxwuoCyuScvNGKbemrSAJWsELILBMW1LeNVjCbasjZZcLorZz0hixgKWh5RTCXigUdVSuyOUiKdFrn/HRD1d0HlRlDK231XaKHxuOBjDFd1mDD0qHcH4lDJmOGWdvETYPYe2zcggWq3hEL0paKga/sfqt6gwYFZ0oxpqoaC4XyzpWTXua9iEY2JSXARFoBYhnPUqc+/OUGXNM5A/emvKaRHy0Fpufx02qDzq60vAeXWfox9mdbq0EgJiEhaw2MmuqaCdb0WqOWohieNnCbmOXtKeVQyn1l6B7HwIDAQABAoIBAAzhFnLWjVH9jgJYPdgr/OyAXDrNJNhq5M3HJhwIuXSjUMSLuIuENw+Ks/YRjTOEqwD2KH6Er7uE+uuourgpsoP9l71Nmw2wTdLFag5WxQhaQuAsBl2gQeQY495j5ZYNpOG1et4MWtmEVIfr+XE8jmFoyMFecLrfiFFV3gD9XuPf3psTRqBZ2EL9eGZpPTec0apSxvaqYrOW20CL/NKcNG3fAfiF7NLbOwAaUdle+2nqfjIWmCXMe6Zs3Hs+30vVU4O4XCLrbpZFX+3UqAkQuels4dDiJf7XftYofgvVZA07Ifvl3UkrM+4/TY+PgXCYJzwd0Zi+HL1U7qRte2L0WmECgYEA14wu3kJho+2peMYOJ0Ae3Dt88NRGQIhKFy9GoIrFBcZBnjpn+d0HFQmjjVGtbMuwZLaYte5zoPbCu6kA5zoENAIaIeMT0JWWECgONVBGVeGJvFnCjUwmkJQd791qaTPBT1bAMg7+oTgOr9oY+0JkzKGeHgzGCcZNHxGC1SnUvrMCgYEAvpWx9g7bAkm+IGVsbFxCkRImgsR1Fxv8kbJv7+u+Sp1I46fXYKqlDO3tX2v0gopdeYOrAhVMYa5ExRc2sD7LmbUwuzIl91lwjyPdiCqtofHKJO71jeeFmCuW38c2itHYOCaO5y24UoKtODBOmxI4nmS2NIMdMLU7UI4eRyX5B+UCgYAS/zfiPtd8KyYUjuAQdYZCwrtwPkUyytA82t3OqGxU5fRCjcM8Mk69e+v+OISgYhNZzP4IisuGFDl1cJ+zwVk9fDHxaqIEcCqZoe4epMSOLSKGhyKucVe0xlkdGtaWDwmqhGrL/qZSby5cMUyiWGep4VSeMWIC2odRhamSP+2QIQKBgEci/PAJD3pFKDBTayrvLPGVQsagqcvcaGPBpMJ6zeZv2tsOtPeh+kVfMbDiTLvFBarrmJMIfCAhug2O4pzac4iF9xCIYV94BOmIy5GdzH2cEIXEo+c5ucXYz1Hru9IJDZm32rMzf49cs2c7sLt1C6kjklb7cZPSsbcZtPd9lvx5AoGBAJSkWDFJAr8e6Fq5IHTTYuvGUXonWJergMGNEQI73yvjxu8qkHGaHv3XsQI1EGeAAJaB1i034t/q7haB5Uh69QJ6GisUYQFCgLYOZXhAPuGQVY03aTK5PIROoxUS3iCrEUsPky6bqYW1K5HNMpLyHVvhfj7TBhUNw72q1Pp+M7dR
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
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CreateTradeICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '282316',
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