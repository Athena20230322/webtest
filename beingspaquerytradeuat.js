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
    PlatformID: "10511339",
    MerchantID: "10511339",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
};

// AES 密鑰與 IV
const AES_Key = "gUBgxSJ3bvKp2dtgrA40XxrpslvCNABN";
const AES_IV = "BLZZ5mACZJ9atujc";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0VqkL3pZj5n2x4gaLLBLdBe6y6g1n0SypfX5a/qFWcQCiKYBZmBACa/3htcRePN2vlnLickCbplM4Aq0kbEOfYmMHKeWa14QoMuTyLfWfOeHwKCFMed0HOVm6nqE+bIhstSVPBx6Jyarlf6FueURxfJ1kWnnG07kApn1kCqb92BM0PHtSYQA3UFfa8CuQACqPQIDVkOOdlxzJP2ayJmyr8SIu0YS4QtGxyw2giockt2GOpragg+7urcYS7SQ8bHQvo+Sa3iUMkdeO3+wAd8ZLy27C3kRBUHR04etgEoKbQwP0SMrKqHrQ6vqEMFV+n0h2985H76VWGJiPKH0ug51mwIDAQABAoIBAE5XKNFLa3A9IQeRepn2boXGy3OiQk6TGnbYELnDSVtJ6djQpf11TwFRA8NFf5hPIsQgPfYVbf+NBiNgXimWo+F+MxwV6kfLL1W8WFTn1i9vRHFkn/MItX6KqXRc3J3DdrDAtAeGcH9uDQ9X6xqhCYGVNUFw67ZgUxpWGnoUN8DdbvSO3c196jeVSsFvYue6SHLA+/HWe2WryzFBa+cHJR+/aXSgWs/q5VheeXCrc/kg/r+NGKf+RVTJohz8HRNiLNPYJItXqWt7sQS5FUkdXM5iDJFi7Fh78TmI9OjpcbeavyKgZ4a77ddVVZJbqA3MESeIdSDYJ499bkxwiBWpTGECgYEA3ascRFsCQ7GWXK3hNgB2hwRibIEGVJ0E4J3koNAl3hTe7GaWLWfSpFDSpvvlMAa+d89tEV6PKSpzh/KBf7BAvh2ZjaXCsE2jVyfPPHMq5S2DDk4snb2oP42d/H2FPaT+Ch+HQLjPfHFDQMKdbonB8am5WQu25vQYDfX7W/7WCWcCgYEA8cdIQLUYumYsAmESKCEr2lkNVb/LI2zJmKeeScJ5Ibz2olfXcbnMZHa6PxJOZUv5uobyky4JI6wKtHsfgSoRE2apL3OI1B5gVmg4oqJXx3zlz5GrgiaRlA2atQqiyK2z2DVPJcmYw2IuEdI9hDcbpz5dhyBgR/htQm1T/+1FLa0CgYB84R4eoErpSg3UjpzW6HHd5KlySUoAtyj9RdZ8hmce8xEXiz/Furzflyzlp/lZEiORqcjfRS9P2LuXdhZgkjIXKOPN+flxi3ue6S2F97fNvtMbZw0ZnLRBgY3kpe4/aUk4+MQgwT0a9VAXFszMbk1V0PE7ai8Tc6ZtjwuZqzp3twKBgQDSuQxZET1nICuVO0NW5GpTGLBNnyaOTn955AVKZgurAwW2QncMsJHasbvrwqm/EbOrBXigHExs4cJGwNSZf694SE6Gg9yqe3sddCKAZJu6yzmEaoKfobvZ3O2MgqOT4gjQFM5Rsd3J1GUwtRtWg60/W1Sqs+YWdAfOEHlYolRb1QKBgH6uIqn7ZLqoTtqK+kYqlCF7g8BXT13/owh97rBqj5Irn9LLNVr3R6HH6EXm3PfiTlU+Z6tiMP9czmfM6083G3dATAKi83M3MZC96TH+yW+NAwlMGI14BwZGb4XEja/NRB/Ux8CRLdsRZFHDrE3UTiRr5c5erCvJ2ysRieIGaD5T
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
    'X-iCP-EncKeyID': '126259',
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