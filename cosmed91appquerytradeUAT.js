const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 設定區 ---
const AES_Key = "wznqKb8IUD22iOr8JZpxRBXH93mhrLHm";
const AES_IV = "gKjE2cXMYznZTSuh";
const EncKeyID = '197345';
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEoAIBAAKCAQEAwPYBtkU7UfV1y6KBpTa9yMLckUgv3QAngwdX6pWX+V1HNdlqs8oyaaRtPJkySPrGJTjvyDj8vSBScsB8I9Y6YzIMXeTJJZ4cDcHtwW4N7Mi+FnP34D4ORJ4VuajsDHIdf9PHjemZl+ZwEBFY87rhTUj54Cb0gTbqYM4kzAev1x9MWa/MHVyR29pmeJ1rP30pWUqey9VD6u6osn8DAjgx+9U72DsUn8g3pRXgcL5Yd/SFjCt5nXXizgXt8TIK7SaBhwkCORfaHzETS8m3PPcKcLxUSYcPDhsC8CZU1fg6u8Bqxei7AREBK28VvcIQ7BZ95Um1UL+jPFZN1hW0cvyNlwIDAQABAoH/NgSodgjrklt6STI1GQs6FfnMcDTFMW6ES9TCcpQY92DQOUL5nAX+wZRGVbCNYzYmQkVY2wnDty5VO8qm9gwC9xdhCZKtZ4Uw//5KO4bpCbXTgSBLRCYbLcUTpTtPhCxuFbAz19vizk4Ju8sfcRvf9sLMhkkMKcrgfOPjaTq9qdBHLBPm77+dEHU/D2oTiIN9kEem+i2UxpExteL6/zfCHmqp1L33bBH56KLd/eXxBKf9xpFvwGlMW5pvI0qOzyy8Po2U2pzki9Zg8okevD50d9SXysLcqxXL3dpydvc0163sGAy94Rko4S/sQ9OYp60vz78pN/yPomVhizSHRi6JAoGBAM/Pg0F8PgcTUulOujo2kFrCePHPKtdYDkgaUD+WkUsDwjJO03fjRXmJR8yetxc3r+bqLRxUBhnyWQX4iGayZtHC4ENL3d+MQB1FfwsX0APpRLJa2ZsRsnEyIBGK8tG8jCpMn8VYQUNHF0eZI7W47v7YVhBz0WxcDGw5UOGJgmLFAoGBAO209YENh712HZkUeewpWRNfrS8Lj2y9NjcecVsOEb+qDdyYoExfgVHUjpSNzlb7dDawqkHzDyjwRN4uCMsp1+/B8DbsiEdmqJi6ZKB2Ap/3kGtRbmQp2AaaXUD3Y3WW1KVNVENO49gqi7XnmOX7aFv3wbucGw6OSKK4cTeZi4SrAoGAfLbZ29wXUaG8OX5g7vy+B2n8sYoV+OTEtWrtTCwtiCp6SjzaVnHTyQulRlzeHpXyAA/8AKtAeiPiX133ZkKcyDg+5MRMJJQECk0h4GNrGF3PN4akX5bwU1S0wDJ2ZX7VU7FmlUXQ7PJmOzbhonaZH+JvTDJltbVMU0rWinQ/Bs0CgYBUm8eS0t0Q69znIumuzJzfD3wWNbgsTUDh550TevOIVCAw98Z+yLPAC7dgWwUp4sDfwowngztPKA5rQtlwbwlkVpSJCDINsBWsnxO4JakThUvLVyXC0z4IQ6OTvzqQnUo9OEQY3RiuVZ569d9vZMgljA9SFuNuj+h8usfZsXZ+lwKBgDapgFfikngL1DEX5uL0NznsNtn5gwEn4sPLSUuwC1IuaVvXzajAbdVsHSy8kofW1sc9DSGiZfHjwruQJzHAnPyqiAGXF3D2y8x3m9z6ZPCVrSo2X15Mjn7w0Ivqhsd+XrkujmlIb/4VRcHlOSsIHxhJ/HLNP4zKPDjKJ3YU+rHq
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
    PlatformID: "10510220",
    MerchantID: "10510220",
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