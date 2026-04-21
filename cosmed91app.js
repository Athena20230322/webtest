const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const { exec } = require('child_process');
const dotenv = require('dotenv');

// 載入環境變數 (請確保路徑正確)
dotenv.config({ path: 'c:/webtes20250123/.env' });
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
    console.error("錯誤：找不到 SLACK_WEBHOOK_URL 環境變數");
    // process.exit(1); // 若沒設定 Webhook 則停止，或註解掉以繼續執行 API
}

// 動態生成當前時間的函式
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

// 【91APP SIT 環境數據】
const data = {
    PlatformID: "10536635",
    MerchantID: "10536635",
    MerchantTradeNo: tradeNo,
    StoreID: "QAICASH-001",
    StoreName: "QACosmed91APP",
    MerchantTradeDate: tradeDate,
    TotalAmount: "500",
    ItemAmt: "500",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "https://shop.cosmed.com.tw",
};

// 【91APP SIT 環境密鑰】
const AES_Key = "xtzXnXnjDkhVWXNZlPJ2gMGAElKF28Kw";
const AES_IV = "IeAzH3aBMlD5pvai";

// 【91APP SIT 環境私鑰】
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAyScTCR4BQ17b2UP33jhPcdcKQfWyWxk5xoYsxw7+xoWsc6e6KkxqQYY2BMZoMTy/t7Ko8sZnMLDYgaANlEnsDGidy/XoTbXLKNMPXiw9xsCsuQq5DoGlNimu5uvRgTLWsJqb34UBl5lOCHmlvHvdLzw4fO/zlMuSf4pBSFmwVFytJxuNgbXIhZyuVoWiFNR0SIzmouclyHjANaBnRgrXA/KXdvz1CjbCMlZz17L8n6POid9nMvGfUdGfkKxxooYSNyND4lVcb41C9f+l2pXroG9owVwUUgzIa38fmIi3VzxNrJ4vyYlNH5myMU2g7XKgOtWRxauP1jJS6xUEUVDwaQIDAQABAoIBACL6THEVaprQb+JD02Is4IOnJP17P9xfcpB23GpwzRSwQeCKlfCtAP0L3XDPH2cQbTYANyigH2l0FvHTZwkWIZm2x1mkFRUOO5mJue5iOwvIjUBQAQXovVXBwcwdzXxt3q8u81PWyQQXgF4w6QTxdPC1xAzVnMGO9JaA8AEot2SzuYckLjEGXrmUPLZCdJS5wbgwCwJuCxlHjWI0sihRgWs5FbxiHrTTlepSacO0gl4/r2225fbTy4SeSQDf4mKmXX9cEHMSpyCwXKFsQheXYXXvS/514Jomiou2ijTXywibxrv41KfdSK8NYCP85d0hGr0apvoomd7p3+cUuKUrsxECgYEA+t1xFcx79B2s47hcD1cv/AAFt1mjGCqS2AQnDsiCAMEERfx2vudoktUu+7abehWyo0NgkJqmG/xmY2LY/bMGP+OUnUhVDyPBQs4/Q6WIZmrIsIBYOoRzhMIE7VPUwEcD1bMGC0oGrFO3TjNfEd/him9Z+9jK5JFMYXeYj4ZQusMCgYEAzUUifEN0meksTZJo8qK5FPLbCdm7FAMEN/IrKacOO/ZROnFFtxpltezqon5mt2bxIaEbpPSgpNc4bhFpWXX/O/VaW9xVy6YGG5x0YFLaGVpLpvZNdsf0/eIP8X75hDfftKIskhtd9Frjk6zEu+989dipDQ5nRdUfekfNVTYC/WMCgYAOVs358wA6yd9x/L22WsNxYgbxnfwGi5htJH+fBrL3nBDEd1PKQavmiKzw0lU8uzTExDsmyNAp1Vl84M+KYMtAp599Bf9mqCKJ0QQot7N+NyhVfmCMp7l6oyRo9Fu6ydRcSKlVx9ttyjM2ExWiDev0X70C+jdOrUdyYsWjnofKxQKBgE9WMzf4Em8SUk9BEVMGVaalHse14bqgV9cPwGL+8F94mniOIzXb/AfOo/leBXFJVlV7IWYmLpjHnkXccO1kz9tqvxvWE0r8xkuRsuEv5J/76FWFyPbp3eTqpOLgAqx5s/rq23M1JKE3J9KB6iABNjkHHn+vW3cAIoRukAwpLgqlAoGAA3YT/HRvyTF4P+jUBoORsjYbK2/4kJ6Zi5hTRGbkFn9kmRIdJ0sflGrV7y8Av/aE8KBTOqFETvBZQoW47X3BSjDYVqQhvlhtNjEV3cqd7PFLpF8JELh+MRDgvRA+iwozDiG89+lS2cogP8smW6i2VYQsg1fLbQWW5J5lgBHLMq4=
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
        console.error("❌ Error sending to Slack:", error.message);
    }
}

const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
const signature = signData(encdata, Client_Private_Key);
const X_iCP_Signature = forge.util.encode64(signature);

const options = {
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/GetPaymentURL',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '274676', // 91APP SIT EncKeyID
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', async () => {
        try {
            const responseData = JSON.parse(response);
            if (responseData.EncData) {
                const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                const parsedData = JSON.parse(decryptedData);

                const paymentUrl = parsedData.PaymentURL;
                const mTradeNo = parsedData.MerchantTradeNo;

                console.log('--- 91APP SIT 交易建立成功 ---');
                console.log('MerchantTradeNo:', mTradeNo);
                console.log('Payment URL:', paymentUrl);

                // 【將 MerchantTradeNo 存成檔案】
                const fileContent = `MerchantTradeNo: ${mTradeNo}`;
                // 確保 c:/webtest 目錄存在，若不存在 fs 會報錯
                fs.writeFileSync('c:/webtest/91appMerchantTradeNo.txt', fileContent);
                console.log('已將交易單號儲存至 c:/webtest/91appMerchantTradeNo.txt');

                // 【傳送 Slack 通知】
                await sendToSlack(`🚀 **91APP SIT Payment URL**\nMerchantTradeNo: ${mTradeNo}\nURL: ${paymentUrl}`);

                // 【開啟瀏覽器】
                const command = process.platform === 'win32' ? 'start' :
                                process.platform === 'darwin' ? 'open' : 'xdg-open';
                exec(`${command} "${paymentUrl}"`);
            } else {
                console.log('API 回傳錯誤或無加密資料:', responseData);
            }
        } catch (e) {
            console.error('處理回應失敗:', e.message);
            console.log('原始回應:', response);
        }
    });
});

req.on('error', (e) => { console.error('Error:', e); });
req.write(`EncData=${encodeURIComponent(encdata)}`);
req.end();