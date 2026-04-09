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
const OMerchantTradeNo = transactionDetails.MerchantTradeNo;
const MerchantTradeNo = transactionDetails.MerchantTradeNo;
const TransactionID = transactionDetails.TransactionID;

// 模擬店家數據
const data = {
    PlatformID: "10525542",
    MerchantID: "10525542",
    OMerchantTradeNo: OMerchantTradeNo, // 載入 MerchantTradeNo 的值
    TransactionID: TransactionID,       // 載入 TransactionID 的值
    StoreID: "QATM01",
    StoreName: "財金購物測試多拿滋",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
    RefundTotalAmount: "2000",
    RefundItemAmt: "2000",
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

// AES 密鑰與 IV
const AES_Key = "Ss5PaphpR2wuJGeFG2gk2Ps2fSSSiZAd";
const AES_IV = "ooLIECycNfzGn6bd";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA9wPhInWySJgLv7b9AbPICpNBl1UTj1pq793otjYrWal6HNpEt9A7zKlkEeUd8YXfvrPFWURGrONqD4/7lX7zJ2ge36wCGcxXxklQpOQURcHGE0VshDtTMe3SiK/Kxd1yyTWxxDdbSmQqM2zWflB2lumcmNFGlSr5M7BwhnLorNdO3tcjAFNZrzQKeZvF4Q+qPOlaG4Jzb8V5ACartq8D9SL1DenV7MzHkbpdSbcV6RU0KBByUSlzlj6LTWjrHjZ6a8+q37paftGx8+XqlrGZN7Ny4X61g3l1WWS7E0VvsdtTH3M43qTMSXqwDjqhl/mnP7Uoc3aATnnE9QVV5tZN+wIDAQABAoIBAAUHvWTzQQjJ0Xg7ZLzNIwy8FPQQL0OWRsk3Tqh8D+pVt8vj0gE53cEVzf9JscNow4N7RVCQQfqXvJT88wjUITJM14KC9GplrX/qbEvMIHGPOAmabbkZPPquUI3bocuuIWR7K6STfNA8aMBlV5tFtJrvWCYKIcYJFJjhEr/zxRmhh2NsRaEqSkJbfkRr8BmwuEkC6ierj/YiYMQImC3uzXUg1nPbKzCyHU8nrZA67g2m4OxtyXVDKYkOOe85rdag+AZQTTbDFYbcUy0GohYiF0cKxe1t1n8nSk1Hr9UqSn6pqZQEdoa6Z8h3S9zIQrY0EqXWrf4MrWovAbkpQwI6MzECgYEA/XPObmWgraFvl93Yqw16/iOU7cQW0+vwNKXW4EEq1DrPL91KzyPP0lpjDLpCOQdEAglNnimCIEjyph//Sk8OWF3ur3cZda6wWMayPzumzHUfOPR56/CzchEi6N34x9mK34UwfjBpKibLJoyPImHJmN0RUy1KILus9ISYS29WNVMCgYEA+X+CMVr90lTdOc7wKJf1vJvEEU7EHyubx3opPKU+e1E7LtM9f1lx9zxyJX7nZn7j/6bG6r3X0T7+hJFsfkLl8hV9LIpK+xMQk5NJF9Dcao/t7RVOnPVLKX+AtzqIEby9NFNlMMPr5H2hZQvLIPp/Oo8KX3klJg4FCODLsIaJh7kCgYEAl0QorkbFURuKiK8FA4H2J/uAhS+FGFI2eJWJ2ynJsASxZzXB0kLjY/5CI3R+1Z56fmSjCIRpf29KMs/iA62PODpHnD2O2me6JCHifE7TzC8SxWFT6vcrgiasGSNxuYUilyjculOWUGv6zzUQsEqAkVVPY78iAMtB/GWup0b5wrUCgYBedHpqiwMq3LwABasAAz+iDup0jvhKwKyyITp5XinAb+lS+d//VXKC4hxou5mJQSK6B36pIgQRkKK0t4V2a4c4VhBUi2qFkRsmc40pegXoReMSbY2ceHTjGgU12O/onyaWJ7hYdOPaVgGDCqr1KkB+f+aybF+2/3nCebBDfTuV6QKBgQDVyQ5Es7bGiVPuzMLkDYjYaXyhphkoXcuremmO5PHSXQeWQrgyNuLEMtdxXhN8zS69a4MLUw4NQpO9V0cV1DKlfOIqXUjyD7MszQaGs3Rqz2zsK1ISLmplR6olUoJ89ZIq4Y/s0y115SasJYImJtgSkT5Zoyzooq5Zk/095hYK9w==
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
  hostname: 'icp-payment-stage.icashpay.com.tw',
  path: '/api/V2/Payment/Cashier/RefundICPO',
  method: 'POST',
  headers: {
    'X-iCP-EncKeyID': '248256',
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
