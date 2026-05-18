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
    PlatformID: "10523750",
    MerchantID: "10523750",
    OMerchantTradeNo: OMerchantTradeNo, // 載入 MerchantTradeNo 的值
    TransactionID: TransactionID,       // 載入 TransactionID 的值
    StoreID: "QATM01",
    StoreName: "巧克力店",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
    RefundTotalAmount: "500",
    RefundItemAmt: "500",
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

// AES 密鑰與 IV
const AES_Key = "I2D3XLzMJAdbGcbyyzQFh3sVohrlnaqD";
const AES_IV = "l2zJKgkxKIze3cGn";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA1ZpebC+xA+86iajzTiFm9KBvkCRJ9QnXjJhzDQdrLzys2mCINWB8LJbBU9yMoEoC6e0iIvuUVKXCDo+6YhjTlpZIfAcUqFDYbdijTk4LYUZEMPTEypBtbSkKICTGjpPhIdO+xEzwBvR8Rc8ioEFou1J1V0465vjljHxalCoR85XYLxX+IAgKIz8e9IEUP8m21fpvV50h1XAEn5LY6rF2PylCXsAx8Jt2fS5zp1u66FV6Ev3kntQ4RFxrpXHV1I8eAjyMi4TVT4hSD2DG3bEN4UPec7vjPwEg9u1RYY5cbNhwQwBmd4jKaNdqNrjRKEqOTTsdiBLKN1fAjsaXq+/thwIDAQABAoIBAEhe24QDKpH/MVGnzPuZRJU4cGQhb29WzNGla0GsVEv2XkhE8ZFIJfpDf7AGpxy9xrv0LJ82ptyBJr0hRFBtQe8g7uEa0wxuC8432qiyt5dXI86Ed9J72Z9lCrm2TBHNl7cK03UV7jMlDZ/nXL94OeBRwVD5v+o2xStyjIvrrxZcfRlEvVNTOj9pE3p2tANH/ZrvIDMsIIfztdffjb2KummB8zcjDfqFudBeg48U1owZMqLprbNktQmG3wodEvdhwWPTYvVhRRUJ3t7OM26/6giYVPdWLDT6TTiVmyIsoZZwlPsIrqZX0gI8uIwMYY6ltRL5nuvXzqWY3BhBm4pktkECgYEA/foLDbzMP44nQnOdJnn5K3F0smR0wiK27HIeeAy5a6zsDmcTVmVUZGW1gB2MiOjAcCprzo1ZaBqfohei6XFLsOlGkOWcY+wu78nuqPzPLmUB6Xf5zUmaGYdM2qq3PmfbgR7cBFAH1mcBzi5afq0ZaxBu5hqWG/ix1bIAyGqUEkcCgYEA10387hHL5lB0yDwU/1CHMPnPsMh5DYLonsHC90C2CAsrnk/QE/Scm48XAAdzL2HI+CESVHOxNuWhOdwozdd2rRJzD1kwqYgdxfHkk2haJGyRZe7ZgEX5YNuYDPiSKfUHmAODO2MZNZuM7pQgTLdfDNQR7dHo0Z+HIdxvnqL9qsECgYAgMjZ8g1aRKAAqGGXvnr7LlxJoGvwCMExoJP9f0J0g3Ub/fGmjJi1QnOQpXZWXNYpPrdEE2j5fSCC8d6qbVVV3E9tyOulccXBxzXOH0KSjCQL5CdCNCauTWOeRQNsB+kCFWdgiY9Lahyxfatjl/iOewvKMEQq+eQRyRqJ6xagHuQKBgQDT41OFNAx3uDyGBuMfNTAnGeK090Zy7p9iBgyK6qt6lQuzPJbp3LT3PsYC6FIKknCHCX0Rkd4Yybp2x918XozT3TFRLJSAc43hjaJHE86KxDH/oCV7YOIA2Xv1X/fwxM1ZZDOVkXxwzonPDgYPmfM4G8kdRJSdICOMRnWvKHb+wQKBgD/4zeQJxjP2OSBH4n44NNZ0P4TX+Q2hc915pn6BbBf2xJlZsZwa1oehan1fJeXgnpee0Q5ZQlu2H0QvBhbVZHt0RRdwuzCQVH+qTrsvskqMSRx0YLbe7WmSt2R5RiTITD6NKG+UZDrHxKFu/VtpprSbpg/NL90O27qGiXzXqRK+
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
    'X-iCP-EncKeyID': '172385',
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
