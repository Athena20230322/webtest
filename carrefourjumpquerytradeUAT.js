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
const transactionDetails = getTransactionDetails('C:/webtest/TransactionDetails.txt');
if (!transactionDetails) {
    console.error('Failed to retrieve transaction details. Exiting.');
    process.exit(1);
}

// 使用讀取的值
const MerchantTradeNo = transactionDetails.MerchantTradeNo;

// 模擬店家數據
const data = {
    PlatformID: "10533993",
    MerchantID: "10533993",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
};

// AES 密鑰與 IV
const AES_Key = "G7bHiz7r58YSEqUutEtkieEoGDQvbMij";
const AES_IV = "HyM09jTPru0fU9Zt";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEowIBAAKCAQEA3Ype91XFXtRzfRczGoagYyFwoWFELVzqg5NhuQ/Ql361azHG41xYOZ7Nhszi289GFxCG9KjyQVPIkkG2nKiyufr4x8iGx2ILY/0OrDFzz4jI/VLtOzbU4V3LbLVllcLwIATZCrPkfjHkOcIiYUZT/TQU1m6xdoHgXkwMvzc3pO5ReNf09UBrsU2G5/TTpesEQoVFNzUhmCbx+AuJV5w+8H7scocUEn09IR2chwtbg5rqLrrkBXACFNomQ8BcHQwbquOBY/cXSuPjI+mMiXSp48nV2jBTI6OmdlxyF3U06FSU11SRsSVfvxxaw8azPij2yCY+yXb3Izbix+YF7GKdPwIDAQABAoIBAFBCRVZIifjpca9zPK3S8P8IydOFN9xRSZqCRch0HMcNfe8IOPv8Y+/4ApBf4J3ucP+BGss++4jEMCkgSmZlzV4IOKG0GXPZJrRCJNMoFUMt1FbF+LDXk/bTcpN/Af7oAPMwnmq8sj4vl/V+ydLA1kOoXxYyQvNiaOTwmzuY5v1GNoCJlmVsrSn9IJ9jEEK3z1dzGQbg1aQ7aYrH6MzVGQK2mI/n+j443tmV7ezui/iG0zMNBSsjPXpMOeDTGYgD+F4kAkXqZf5W2bzT2qDzU+8iBdFTFkltCAK9QKMCkl6hIwU7rppEPeAJ9R7JNkfjWzZfEEn42uOtm13KfZW/hpkCgYEA/Gdx7lWyQVsNK+yb2Cn/fd8UMm4ghfMBKpEAmfSVyxnXNhi6NOHjplbd4ini3SzZJ1e+DHCXPVzOq6u0iQgL7X+Xmb/fwV6BAV2I+coyrEMmjlbyqkOaAX7RjIcMxCcbX2gJfBe0Llt+g8C0eIKttqGC87CanhUGOMtCf7lgBacCgYEA4LJcpr22eWhTKfyV5qvMXQIkdEj/mS49PQUMPomW4kB3cpFHy2AHwcY8IcdoZAo513qCrPqJPfBpq+71I9iTjgdHhdME/Y3WZdiVDoqY5HC6FaVbdJuIsYwLiXP5ADCzv6DPHxah4Q1cC1SrILrI1Xvq+8VdtIsXyINHkBhKTqkCgYEAn7vLk1xycf/wZwLXYca6ZOs/eebN+FdgPpMDgWsTPTR+SUL+3Ka0DjndM9r0MqrGRqq1oGPEotXQCT6iAzKvcb8Urv2J2nM3SyjpncNDrFbW2K/X5L7hgN7EOJ3jC2QAY7GQhxLtOYU3nKPg0n9I9lJicFwsjayagmjIDdLAHPMCgYA4FYz2uYegSh/n7Pnld6As3uoGdGoH6/ixEF98BI+6rWijGgwXgUKuZTKBI+q0fbDuTc/sKSS0ZxuZJK3fYqGB4+NATemC+DI5fZPG62U6L8DiwkFPm7rExjXi+yV9nKpg/Fx2YAnLyK/ezCVip/yU/LcsXJkFBWrMS6hDGS0C8QKBgFRPUpR833FHjaCDWJ71G0ewFSPkO0Hm83e5VLQeG4BNIcU+kr+d6jl9gPkNx+KRo8hyAYiy8MFF/owSRQRJY7qQnngJMAJ4sDrtHA9+Z1q+9X6DPuM4NWN9NjvvkgKcHNt4Loe1sFn31piCKtqdlm16AQBI2cjCrILRnY/iqjN4
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
    return decrypted.toString(CryptoJS.enc.Utf8);
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
  path: '/api/V2/Payment/Cashier/QueryTradeICPO',
  method: 'POST',
  headers: {
    'X-iCP-EncKeyID': '185618',
    'X-iCP-Signature': X_iCP_Signature,
    'Content-Type': 'application/x-www-form-urlencoded', // 你可以根據需要修改 Content-Type
  },
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Response:', responseData);

    // 解析回傳的 JSON 數據
    const responseJson = JSON.parse(responseData);
    const encryptedResponseData = responseJson.EncData;

    // 解密回傳的 EncData
    const decryptedResponseData = decryptAES_CBC_256(encryptedResponseData, AES_Key, AES_IV);
    console.log('Decrypted Response Data:', decryptedResponseData);
    const parsedResponse = JSON.parse(decryptedResponseData);
    console.log("Decrypted Response:", parsedResponse);

     // 取得 TransactionID 和 MerchantTradeNo
    const { TransactionID, MerchantTradeNo } = parsedResponse;
    // 儲存到 .txt 檔案
    const output = `TransactionID: ${TransactionID}\nMerchantTradeNo: ${MerchantTradeNo}`;
    fs.writeFileSync('TransactionDetails.txt', output);
    console.log("Transaction details have been saved to TransactionDetails.txt");

  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

// 在此將加密過的資料作為請求的 body 發送
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`; // 使用 `encodeURIComponent` 編碼 `encdata` 的內容
req.write(encodedEncData);
req.end();