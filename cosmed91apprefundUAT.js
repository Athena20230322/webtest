const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// 動態生成當前時間的函式
function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `Sample${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

// 讀取檔案並解析內容
function getTransactionDetails(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const transactionDetails = {};

        fileContent.split('\n').forEach((line) => {
            const [key, value] = line.split(':').map(item => item.trim());
            if (key && value) {
                transactionDetails[key] = value;
            }
        });

        return transactionDetails;
    } catch (error) {
        console.error('Error reading transaction details file:', error);
        return null;
    }
}

// 取得當前時間
const { tradeNo, tradeDate } = getCurrentTime();

// 讀取交易細節
const transactionDetails = getTransactionDetails('C:/webtest/91appTransactionDetails.txt');
if (!transactionDetails) {
    console.error('Failed to retrieve transaction details. Exiting.');
    process.exit(1);
}

// 使用讀取的值
const OMerchantTradeNo = transactionDetails.MerchantTradeNo;
const MerchantTradeNo = transactionDetails.MerchantTradeNo;
const TransactionID = transactionDetails.TransactionID;

// 模擬店家數據
const data = {
    PlatformID: "10510220",
    MerchantID: "10510220",
    OMerchantTradeNo: OMerchantTradeNo, // 載入 MerchantTradeNo 的值
    TransactionID: TransactionID,       // 載入 TransactionID 的值
    StoreID: "QATM01",
    StoreName: "康事美91apprefund",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
    RefundTotalAmount: "500",
    RefundItemAmt: "500",
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

// AES 密鑰與 IV
const AES_Key = "wznqKb8IUD22iOr8JZpxRBXH93mhrLHm";
const AES_IV = "gKjE2cXMYznZTSuh";

// 客戶端私鑰
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

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
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
  path: '/api/V2/Payment/Cashier/RefundICPO',
  method: 'POST',
  headers: {
    'X-iCP-EncKeyID': '197345',
    'X-iCP-Signature': X_iCP_Signature,
    'Content-Type': 'application/x-www-form-urlencoded', // 你可以根據需要修改 Content-Type
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    // 你可以在這裡處理回傳的數據
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

// 在此將加密過的資料作為請求的 body 發送
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`; // 使用 `encodeURIComponent` 編碼 `encdata` 的內容
req.write(encodedEncData);
req.end();
