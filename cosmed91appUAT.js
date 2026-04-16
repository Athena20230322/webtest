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
    PlatformID: "10510220",
    MerchantID: "10510220",
    MerchantTradeNo: tradeNo,
    StoreID: "QAICASH-001",
    StoreName: "Cosmed91APPUAT",
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
const AES_Key = "wznqKb8IUD22iOr8JZpxRBXH93mhrLHm";
const AES_IV = "gKjE2cXMYznZTSuh";

// 【91APP SIT 環境私鑰】
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEoAIBAAKCAQEAwPYBtkU7UfV1y6KBpTa9yMLckUgv3QAngwdX6pWX+V1HNdlqs8oyaaRtPJkySPrGJTjvyDj8vSBScsB8I9Y6YzIMXeTJJZ4cDcHtwW4N7Mi+FnP34D4ORJ4VuajsDHIdf9PHjemZl+ZwEBFY87rhTUj54Cb0gTbqYM4kzAev1x9MWa/MHVyR29pmeJ1rP30pWUqey9VD6u6osn8DAjgx+9U72DsUn8g3pRXgcL5Yd/SFjCt5nXXizgXt8TIK7SaBhwkCORfaHzETS8m3PPcKcLxUSYcPDhsC8CZU1fg6u8Bqxei7AREBK28VvcIQ7BZ95Um1UL+jPFZN1hW0cvyNlwIDAQABAoH/NgSodgjrklt6STI1GQs6FfnMcDTFMW6ES9TCcpQY92DQOUL5nAX+wZRGVbCNYzYmQkVY2wnDty5VO8qm9gwC9xdhCZKtZ4Uw//5KO4bpCbXTgSBLRCYbLcUTpTtPhCxuFbAz19vizk4Ju8sfcRvf9sLMhkkMKcrgfOPjaTq9qdBHLBPm77+dEHU/D2oTiIN9kEem+i2UxpExteL6/zfCHmqp1L33bBH56KLd/eXxBKf9xpFvwGlMW5pvI0qOzyy8Po2U2pzki9Zg8okevD50d9SXysLcqxXL3dpydvc0163sGAy94Rko4S/sQ9OYp60vz78pN/yPomVhizSHRi6JAoGBAM/Pg0F8PgcTUulOujo2kFrCePHPKtdYDkgaUD+WkUsDwjJO03fjRXmJR8yetxc3r+bqLRxUBhnyWQX4iGayZtHC4ENL3d+MQB1FfwsX0APpRLJa2ZsRsnEyIBGK8tG8jCpMn8VYQUNHF0eZI7W47v7YVhBz0WxcDGw5UOGJgmLFAoGBAO209YENh712HZkUeewpWRNfrS8Lj2y9NjcecVsOEb+qDdyYoExfgVHUjpSNzlb7dDawqkHzDyjwRN4uCMsp1+/B8DbsiEdmqJi6ZKB2Ap/3kGtRbmQp2AaaXUD3Y3WW1KVNVENO49gqi7XnmOX7aFv3wbucGw6OSKK4cTeZi4SrAoGAfLbZ29wXUaG8OX5g7vy+B2n8sYoV+OTEtWrtTCwtiCp6SjzaVnHTyQulRlzeHpXyAA/8AKtAeiPiX133ZkKcyDg+5MRMJJQECk0h4GNrGF3PN4akX5bwU1S0wDJ2ZX7VU7FmlUXQ7PJmOzbhonaZH+JvTDJltbVMU0rWinQ/Bs0CgYBUm8eS0t0Q69znIumuzJzfD3wWNbgsTUDh550TevOIVCAw98Z+yLPAC7dgWwUp4sDfwowngztPKA5rQtlwbwlkVpSJCDINsBWsnxO4JakThUvLVyXC0z4IQ6OTvzqQnUo9OEQY3RiuVZ569d9vZMgljA9SFuNuj+h8usfZsXZ+lwKBgDapgFfikngL1DEX5uL0NznsNtn5gwEn4sPLSUuwC1IuaVvXzajAbdVsHSy8kofW1sc9DSGiZfHjwruQJzHAnPyqiAGXF3D2y8x3m9z6ZPCVrSo2X15Mjn7w0Ivqhsd+XrkujmlIb/4VRcHlOSsIHxhJ/HLNP4zKPDjKJ3YU+rHq
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
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/GetPaymentURL',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '197345', // 91APP SIT EncKeyID
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