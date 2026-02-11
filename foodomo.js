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
// 你的 Slack Webhook URL
//const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

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
    PlatformID: "10524498",
    MerchantID: "10524498",
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
const AES_Key = "NDtQ8WGnabzCRrbxQNPuPZjtlZSjW0gl";
const AES_IV = "HBMtknl9L7feOiNY";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA7XVJFhrDuI2Wn9vkZM828OfPBip6NnvtqTXmEOv18DGs8A2dd9DlzgICe6UOVjpk1sZgRnAErOsDGhUV4udr2A6AnnJhhkRN5FRHpaflSYHhIqcK/TU/+0VzNRT7HChCkOil4VlcVt+9Ca0tkylcGv8Wj8Vg53Jq1adtVupQtbn7c7zMfzhs3O+7cQPnbSQ8KJPPTJliDoq0TMgz8olrEzx+ln+ixaB7SSY2OMxJ6VyOD8uslbrtq3w4vz0ofWsrXrxy7MgCcoPv2/2ldTpSDaQ8Q38P2GVP7JTpnq39514mq126Zr/XXPaOhSb+0lIBG15iEK5BjecTVk7WfAHPEQIDAQABAoIBAArt2+Mr8G/vOVxqdiLDLEnOe4dyv00Aa3X/LHOBLsDDQozKbaHZACi5DDT1afljRuahOwdm6rosN2h1Cby3rs2jDj2ssUspG+YrUGBiH8IgO5TZGB8DG0qk/cpWyL95JWYuxQrADolTkyttuHQmYk4+SSMtIBqK+DqU8gn+7x/MBMHjxhlT987GGFogzA7Urrx7dHeEZRlm4p42a367s/j/pxk7K2QghyY5cjYAxcIT9UML7Z22kEltUpBFFjYesyV6BxfDZzPCedbuaKLrJ95o8hvYxySXpyxkKE+12mes/mLAGs2a7FbsUz1bF6tP+sHmIc9fmFwg/YBTVvZ1SFkCgYEA9+NYBcFYVngPCrSbC+bwia5owJGCK1W0d/ZkPW7d+8bEnI6/KHiex5SWJ/+/qb79FgVfDtlw+KAz+ME4ZbiLPcyIxqMeooYVTZSjxLnKPEMh3gXCOauAdnlIUttzXhaEM3Chzgsx1AEHFTsXE+KCrOwrNj6DaTqRiafn//tmvEkCgYEA9TqQ7lMwHnqHHttwLCEco36Ii9ehHiXtlXl93M6SaZWt57SJA+9Wkd+wmR33cGLAMSRYuLZSdyaUdBg7DtvW8OXbvd+jVKSrhQ84ZA/j/kbGWPRS85KYon5FuqRdYSBPGPGu1o9es+blb0fOX+rCEpRaap0e+akThOFpWVNWrIkCgYBhns1eTtsMCnHaBG/+yu61OdMU6vi5OiI9D/I/4zZWXdu1z91mAcJ91H0huWzwWz9t+aWKwoTj1KtC7kzYekmTh8XhfAGnfWhMShoIciY7fzCKL/hiH7ESdwbNYpDXX8SmQVfnPa9czx7L9J5M/Wn60XLfBNVZjnAcJtyNiaLWyQKBgQC7f+0inC51j1/S4xuQUjzwcSX8LoG9aGiQ2lS2yKc/3bcbK3l7rbr2TB9d44C2yHqE2HKRwK2q9q+ZWJGHWeWtSULLmbvrUwDl+u4168R6PikYCK+IFvVngL7V5yiSw75Wpyv0V6ikSw3wGOodgoSi6hV74Oi3IWSQPD1tk//4aQKBgAXAQ29ZKNuQLdI6RwvOzquH3NPGoTAJkl++XdnbKnHQVwmUe/jeItCLCZhFklxYOsWhh70rTGyYOXnX6gOeJxC0rJpagF/r+N7Nr+U7jrcv0OevX6CJ1TH13mv7Qc4mtkD7I9WYpCHgXt3CZ/fy/4kBvXzrdho3DAWawVSjcZoM
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
        'X-iCP-EncKeyID': '208751',
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
                    const icpPaymentUrl = `https://icpbridge-dev.icashsys.com.tw/ICP?Actions=Mainaction&Event=ICPO002&Value=${parsedData.TradeToken}&Valuetype=1`;
                    console.log('ICP Payment URL Foodomo:', icpPaymentUrl);

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