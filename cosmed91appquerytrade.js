const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 設定區 ---
const AES_Key = "xtzXnXnjDkhVWXNZlPJ2gMGAElKF28Kw";
const AES_IV = "IeAzH3aBMlD5pvai";
const EncKeyID = '274676';
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAyScTCR4BQ17b2UP33jhPcdcKQfWyWxk5xoYsxw7+xoWsc6e6KkxqQYY2BMZoMTy/t7Ko8sZnMLDYgaANlEnsDGidy/XoTbXLKNMPXiw9xsCsuQq5DoGlNimu5uvRgTLWsJqb34UBl5lOCHmlvHvdLzw4fO/zlMuSf4pBSFmwVFytJxuNgbXIhZyuVoWiFNR0SIzmouclyHjANaBnRgrXA/KXdvz1CjbCMlZz17L8n6POid9nMvGfUdGfkKxxooYSNyND4lVcb41C9f+l2pXroG9owVwUUgzIa38fmIi3VzxNrJ4vyYlNH5myMU2g7XKgOtWRxauP1jJS6xUEUVDwaQIDAQABAoIBACL6THEVaprQb+JD02Is4IOnJP17P9xfcpB23GpwzRSwQeCKlfCtAP0L3XDPH2cQbTYANyigH2l0FvHTZwkWIZm2x1mkFRUOO5mJue5iOwvIjUBQAQXovVXBwcwdzXxt3q8u81PWyQQXgF4w6QTxdPC1xAzVnMGO9JaA8AEot2SzuYckLjEGXrmUPLZCdJS5wbgwCwJuCxlHjWI0sihRgWs5FbxiHrTTlepSacO0gl4/r2225fbTy4SeSQDf4mKmXX9cEHMSpyCwXKFsQheXYXXvS/514Jomiou2ijTXywibxrv41KfdSK8NYCP85d0hGr0apvoomd7p3+cUuKUrsxECgYEA+t1xFcx79B2s47hcD1cv/AAFt1mjGCqS2AQnDsiCAMEERfx2vudoktUu+7abehWyo0NgkJqmG/xmY2LY/bMGP+OUnUhVDyPBQs4/Q6WIZmrIsIBYOoRzhMIE7VPUwEcD1bMGC0oGrFO3TjNfEd/him9Z+9jK5JFMYXeYj4ZQusMCgYEAzUUifEN0meksTZJo8qK5FPLbCdm7FAMEN/IrKacOO/ZROnFFtxpltezqon5mt2bxIaEbpPSgpNc4bhFpWXX/O/VaW9xVy6YGG5x0YFLaGVpLpvZNdsf0/eIP8X75hDfftKIskhtd9Frjk6zEu+989dipDQ5nRdUfekfNVTYC/WMCgYAOVs358wA6yd9x/L22WsNxYgbxnfwGi5htJH+fBrL3nBDEd1PKQavmiKzw0lU8uzTExDsmyNAp1Vl84M+KYMtAp599Bf9mqCKJ0QQot7N+NyhVfmCMp7l6oyRo9Fu6ydRcSKlVx9ttyjM2ExWiDev0X70C+jdOrUdyYsWjnofKxQKBgE9WMzf4Em8SUk9BEVMGVaalHse14bqgV9cPwGL+8F94mniOIzXb/AfOo/leBXFJVlV7IWYmLpjHnkXccO1kz9tqvxvWE0r8xkuRsuEv5J/76FWFyPbp3eTqpOLgAqx5s/rq23M1JKE3J9KB6iABNjkHHn+vW3cAIoRukAwpLgqlAoGAA3YT/HRvyTF4P+jUBoORsjYbK2/4kJ6Zi5hTRGbkFn9kmRIdJ0sflGrV7y8Av/aE8KBTOqFETvBZQoW47X3BSjDYVqQhvlhtNjEV3cqd7PFLpF8JELh+MRDgvRA+iwozDiG89+lS2cogP8smW6i2VYQsg1fLbQWW5J5lgBHLMq4=
-----END PRIVATE KEY-----`;

// --- 功能函式 ---

// 解析檔案內容 (Key: Value 格式)
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
    } catch (error) { return null; }
}

function encryptAES(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES(encryptedData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return forge.util.encode64(rsa.sign(md));
}

// --- 主程式邏輯 ---

// 1. 讀取由 bookswebUAT.js 產生的單號
const transactionDetails = getTransactionDetails('C:/webtest/91appMerchantTradeNo.txt');
if (!transactionDetails || !transactionDetails.MerchantTradeNo) {
    console.error('❌ 錯誤：找不到 MerchantTradeNo，請確認 91appMerchantTradeNo.txt 檔案存在且格式正確。');
    process.exit(1);
}

const requestBodyData = {
    PlatformID: "10536635",
    MerchantID: "10536635",
    MerchantTradeNo: transactionDetails.MerchantTradeNo
};

const encData = encryptAES(JSON.stringify(requestBodyData), AES_Key, AES_IV);
const signature = signData(encData, Client_Private_Key);

const options = {
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/QueryTradeICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': EncKeyID,
        'X-iCP-Signature': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

console.log(`[執行查詢] 訂單編號: ${transactionDetails.MerchantTradeNo}`);

const req = https.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const responseJson = JSON.parse(rawData);
            if (responseJson.RtnCode == 1 || responseJson.RtnCode == "1") {
                const decryptedStr = decryptAES(responseJson.EncData, AES_Key, AES_IV);
                const result = JSON.parse(decryptedStr);

                console.log('--- 查詢結果 (解密後) ---');
                console.log(result);

                // 2. 儲存完整結果供查閱
                fs.writeFileSync('C:/webtest/91appQueryResults.txt', JSON.stringify(result, null, 2));

                // 3. 【核心修改】儲存退款與銷退必備資訊 (確保 TotalAmount 被正確寫入)
                // 這裡使用固定格式 Key: Value，方便後續程式用正則或 split 讀取
                const outputData = [
                    `MerchantTradeNo: ${result.MerchantTradeNo}`,
                    `TransactionID: ${result.TransactionID}`,
                    `TotalAmount: ${result.TotalAmount}`,
                    `TradeStatus: ${result.TradeStatus}`
                ].join('\n');

                fs.writeFileSync('C:/webtest/91appTransactionDetails.txt', outputData);

                console.log("-----------------------------------------");
                console.log("✅ 查詢成功！");
                console.log("✅ 退款/銷退燃料已更新至 C:/webtest/91appTransactionDetails.txt");
            } else {
                console.error(`❌ 查詢失敗: [${responseJson.RtnCode}] ${responseJson.RtnMsg}`);
            }
        } catch (e) {
            console.error('❌ 解析回應失敗:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ 請求發生網路錯誤:', e.message);
});

req.write(`EncData=${encodeURIComponent(encData)}`);
req.end();