const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 設定區 ---
const AES_Key = "59953mTrHoNvVrXITDi9e8EQUD6wChxE";
const AES_IV = "n9WiDlxzLMcdV0E4";
const EncKeyID = '186044';
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA3UEIJEGxYYSbLApvG+7Wy5ODIv/e32N4ekMQSVmwVLTXq0oQQSE+c2vx2V+osQvdlOjD8l8AixFF4duRGP4J1AinoVCwuITfReUcei25WfuYeecAiUMUIuCJpu/U2d5+zcMOmYSzS3xG8+FausgZiek+Xb69B9rJWKyrfAYzVIalXD53czLqohyoiTyMEQWcNbXj6mptV38WtHpc+/IJvwtblGl3ddPHLpg0MrQRd5nKqM6AxOMkxnQkBUs2gfDOXSJSaR6MZNzXTZfCOolhq1kKlof8fTCFjVPsiXYouP8WrUG9tOjDZpJNI8Xg4Dti7wiYhyxYzmHfU0UKZsyLcwIDAQABAoIBAAxH/nhXmN/upsWAaMRRzmSZKOw8EP95zfCxs0lgLAomgRFReH0T3tJ9wnxMM6sjCPlOQXUGTa3qe7/DyF9tIMU/LgZKNYq5ootiBvQjN3Zus7HtsUb/g/toe3AjrghP6N5pvkul7hveMJ97p5yNAL556kvQi4aZluDZRDxm8kd1z7VMsjLEyvN9ryzRlDjW+I0n4SvVfqdyNlOonLdtPh0N3dHc9zaHMD5cUEpJFmsBJ5MX6I8xn60mvL27JwEaYDdADwG+iJPUodm9OSIPq06plBTrESFq3eFdjw3WjxFaWZyw0/c+jGvLnBBYwrUbjFlqiLFtwS0cifkwFkwGV/0CgYEA+UpEBUiOkdfOEaYUyPbrKFdUOLvpaG1XgGq8/x2f+2ai0VLQgd15/vtBfNRm2+V8XeV010Chj51LfnyBVg26VHISmtcNfkr1Ev3AYeh37jx/Vgu0M70UNQFniCtqgyTy52usRajRsCYPUH9rZSyQIALw8wID7FNccq5xueXGgH0CgYEA4zWVXbiHUqSSogf2XOBniIEIQe37GJ+E2gKyrcig6mY5DryDWsvUgKiPZ+F1mUrJji6/+Rc0x2rjQcIo4hb5AOisr1X17dHhIlGGaqui1vOYlV4VxmoGcCCigbHfDBy4xUHdUsPL5pYl1WwnPPla3Sf1GJY4zZgMvf+jCj6Jbq8CgYEA8V/XPMZkRRKPlMcamPt79jOYeNZ5yYMVlmHDXcFxhhp6y/NDsHqiBSGC5ztB3Oj24nOqDkGmLUhAMNic4pWoNNu+5+4SQpaRdTH9dM+CUEqDgO0ULoSFbE1P0ak4GINOLoUy6L/tSIGRkn/NnMjpRBWU97ab1ddhTClcNIMnEIECgYBWKLefdp46RJYmQ4a06ZPZO7T561jQmY0zbtp69B2xRVpVsD7Pa4QF1eWrqt+BZc7Q0AGUX6xwAqRzB0GhmryKD7GMO7iqmnAZJ3klcjip8m3mFmuDdilC091L+TtvyGR4yOU4wW7M3hsyt3SZtqUyQDi9PhoEPKh4VDxrYhOTmQKBgQCuTGqDweio57A/IGZJIQphOKYz4EMD19RaqXCsFx97uRxq6Thx+5tiS7saa+LY8pbhsNUmTlJTbLYfNjozXBHy+sYed3sR1glOYVvqJdAtH0xnsOW8pTVVa95mMPSLC6jPkCZcxWXvtR39Tt3htloI16rAX5ojry4yTWkJXmyUXA==
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
const transactionDetails = getTransactionDetails('C:/webtest/bookMerchantTradeNo.txt');
if (!transactionDetails || !transactionDetails.MerchantTradeNo) {
    console.error('❌ 錯誤：找不到 MerchantTradeNo，請確認 bookMerchantTradeNo.txt 檔案存在且格式正確。');
    process.exit(1);
}

const requestBodyData = {
    PlatformID: "10510711",
    MerchantID: "10510711",
    MerchantTradeNo: transactionDetails.MerchantTradeNo
};

const encData = encryptAES(JSON.stringify(requestBodyData), AES_Key, AES_IV);
const signature = signData(encData, Client_Private_Key);

const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
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
                fs.writeFileSync('C:/webtest/bookQueryResults.txt', JSON.stringify(result, null, 2));

                // 3. 【核心修改】儲存退款與銷退必備資訊 (確保 TotalAmount 被正確寫入)
                // 這裡使用固定格式 Key: Value，方便後續程式用正則或 split 讀取
                const outputData = [
                    `MerchantTradeNo: ${result.MerchantTradeNo}`,
                    `TransactionID: ${result.TransactionID}`,
                    `TotalAmount: ${result.TotalAmount}`,
                    `TradeStatus: ${result.TradeStatus}`
                ].join('\n');

                fs.writeFileSync('C:/webtest/bookTransactionDetails.txt', outputData);

                console.log("-----------------------------------------");
                console.log("✅ 查詢成功！");
                console.log("✅ 退款/銷退燃料已更新至 C:/webtest/bookTransactionDetails.txt");
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