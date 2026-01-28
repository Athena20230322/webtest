require('dotenv').config();
const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// 1. 取得符合規格的時間戳格式: yyyy/MM/dd HH:mm:ss [cite: 17]
function getFormattedTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return {
        tradeNo: `T${yyyy}${MM}${dd}${hh}${mm}${ss}${Math.floor(Math.random() * 1000)}`,
        timeStamp: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`
    };
}

const { tradeNo, timeStamp } = getFormattedTime();

// 2. 交易數據 (依據規格書 P.1-P.2 調整) [cite: 12-54]
const data = {
    TimeStamp: timeStamp,            // [cite: 13]
    MerchantID: "10536635",          // [cite: 18]
    PlatformID: "10536635",          // [cite: 22]
    MerchantTradeNo: tradeNo,        // [cite: 26]
    ts: String(Date.now()),          // 時間戳辨識字串 [cite: 31]
    PayID: "P12345678",              // 付款方式 ID

    // --- 點數扣抵設定區 ---
    UsePointType: 2,                 // 2: 使用者自行輸入折抵點數
    UsePoint: 100,                   // 想要扣抵的點數數量

    ChargeVersionType: "v2",         // 新版本 APP 帶入
    AccumulatedPointsType: 1         // 1: 可累積點數
};

// 靜態設定
const AES_Key = "xtzXnXnjDkhVWXNZlPJ2gMGAElKF28Kw";
const AES_IV = "IeAzH3aBMlD5pvai";
    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAyScTCR4BQ17b2UP33jhPcdcKQfWyWxk5xoYsxw7+xoWsc6e6KkxqQYY2BMZoMTy/t7Ko8sZnMLDYgaANlEnsDGidy/XoTbXLKNMPXiw9xsCsuQq5DoGlNimu5uvRgTLWsJqb34UBl5lOCHmlvHvdLzw4fO/zlMuSf4pBSFmwVFytJxuNgbXIhZyuVoWiFNR0SIzmouclyHjANaBnRgrXA/KXdvz1CjbCMlZz17L8n6POid9nMvGfUdGfkKxxooYSNyND4lVcb41C9f+l2pXroG9owVwUUgzIa38fmIi3VzxNrJ4vyYlNH5myMU2g7XKgOtWRxauP1jJS6xUEUVDwaQIDAQABAoIBACL6THEVaprQb+JD02Is4IOnJP17P9xfcpB23GpwzRSwQeCKlfCtAP0L3XDPH2cQbTYANyigH2l0FvHTZwkWIZm2x1mkFRUOO5mJue5iOwvIjUBQAQXovVXBwcwdzXxt3q8u81PWyQQXgF4w6QTxdPC1xAzVnMGO9JaA8AEot2SzuYckLjEGXrmUPLZCdJS5wbgwCwJuCxlHjWI0sihRgWs5FbxiHrTTlepSacO0gl4/r2225fbTy4SeSQDf4mKmXX9cEHMSpyCwXKFsQheXYXXvS/514Jomiou2ijTXywibxrv41KfdSK8NYCP85d0hGr0apvoomd7p3+cUuKUrsxECgYEA+t1xFcx79B2s47hcD1cv/AAFt1mjGCqS2AQnDsiCAMEERfx2vudoktUu+7abehWyo0NgkJqmG/xmY2LY/bMGP+OUnUhVDyPBQs4/Q6WIZmrIsIBYOoRzhMIE7VPUwEcD1bMGC0oGrFO3TjNfEd/him9Z+9jK5JFMYXeYj4ZQusMCgYEAzUUifEN0meksTZJo8qK5FPLbCdm7FAMEN/IrKacOO/ZROnFFtxpltezqon5mt2bxIaEbpPSgpNc4bhFpWXX/O/VaW9xVy6YGG5x0YFLaGVpLpvZNdsf0/eIP8X75hDfftKIskhtd9Frjk6zEu+989dipDQ5nRdUfekfNVTYC/WMCgYAOVs358wA6yd9x/L22WsNxYgbxnfwGi5htJH+fBrL3nBDEd1PKQavmiKzw0lU8uzTExDsmyNAp1Vl84M+KYMtAp599Bf9mqCKJ0QQot7N+NyhVfmCMp7l6oyRo9Fu6ydRcSKlVx9ttyjM2ExWiDev0X70C+jdOrUdyYsWjnofKxQKBgE9WMzf4Em8SUk9BEVMGVaalHse14bqgV9cPwGL+8F94mniOIzXb/AfOo/leBXFJVlV7IWYmLpjHnkXccO1kz9tqvxvWE0r8xkuRsuEv5J/76FWFyPbp3eTqpOLgAqx5s/rq23M1JKE3J9KB6iABNjkHHn+vW3cAIoRukAwpLgqlAoGAA3YT/HRvyTF4P+jUBoORsjYbK2/4kJ6Zi5hTRGbkFn9kmRIdJ0sflGrV7y8Av/aE8KBTOqFETvBZQoW47X3BSjDYVqQhvlhtNjEV3cqd7PFLpF8JELh+MRDgvRA+iwozDiG89+lS2cogP8smW6i2VYQsg1fLbQWW5J5lgBHLMq4=\n-----END PRIVATE KEY-----`;


// AES 加密 (CBC/Pkcs7)
function encryptAES(dataStr, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(dataStr, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// RSA 簽名 (SHA256withRSA) [cite: 10]
function signData(encData, privateKeyPem) {
    const rsa = forge.pki.privateKeyFromPem(privateKeyPem);
    const md = forge.md.sha256.create();
    md.update(encData, 'utf8');
    const signature = rsa.sign(md);
    return forge.util.encode64(signature);
}

// 執行加密與簽名
const encryptedData = encryptAES(JSON.stringify(data), AES_Key, AES_IV);
const xIcpSignature = signData(encryptedData, Client_Private_Key);

// 3. 發送請求至 SIT 環境
const postBody = JSON.stringify({
    EncData: encryptedData //
});

const options = {
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/app/Cashier/ChargeOnlineICPO', // 依規格路徑調整
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '274676',    // [cite: 10]
        'X-iCP-Signature': xIcpSignature, // [cite: 10]
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody)
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => response += chunk);
    res.on('end', async () => {
        console.log('Raw Response:', response);
        try {
            const resJson = JSON.parse(response);
            // 處理回傳 RtnCode
            if (resJson.RtnCode === "1") {
                console.log("✅ 交易初步發送成功");
                // 這裡可以進行後續 EncData 解密邏輯
            } else {
                console.error(`❌ 交易失敗: ${resJson.RtnMsg} (${resJson.RtnCode})`);
            }
        } catch (e) {
            console.error('❌ 解析回應失敗:', e.message);
        }
    });
});

req.on('error', (e) => console.error('❌ HTTP Error:', e));
req.write(postBody);
req.end();

// 紀錄交易號碼
fs.writeFileSync('merchantTradeNo.txt', `MerchantTradeNo: ${tradeNo}\nTimeStamp: ${timeStamp}`);
console.log(`已紀錄交易編號: ${tradeNo}`);