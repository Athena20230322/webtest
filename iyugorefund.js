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
const transactionDetails = getTransactionDetails('C:/webtest/iyugoMerchantTradeNo.txt');
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
    PlatformID: "10000236",
    MerchantID: "10000236",
    OMerchantTradeNo: OMerchantTradeNo, // 載入 MerchantTradeNo 的值
    TransactionID: TransactionID,       // 載入 TransactionID 的值
    StoreID: "TM01",
    StoreName: "iyugo",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
    RefundTotalAmount: "700",
    RefundItemAmt: "700",
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

// AES 密鑰與 IV
const AES_Key = "Nu52fAODFfP2xM2dGT4LLoS10ZldZzoh";
const AES_IV = "KJUYfTyo7Emy2sT9";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAzk25wl5iqDJARbX4QsaBFeWMDmwJJuof39DlmIOle+ghPNT5DFaZv/oo9h53W0+MT+bfvsLknzv/wJnKCajbBmi6A8yh5s0imEOLt6kZTruIVG3KM4d+K0r5HhIJ1CYXGiQh0s6KcY88w7oYlgCRvCGcxsTe8I93THZT5ZRXr8MRxZmVIdA6kifYFztA5JbVt5Gw56dHd+eSjXobXkdmimsn0RuQEhTwnpgrxI0dJM+kO4IqKfNItMiDv48kLCbIuhjw1HSFKSKMbOpf/r1j1ApCKS03TXpDXg2IpgTLLiYNYjTipMWS78qnrZywLeqTS8JnwMkdpVxjy8i+1W4RPwIDAQABAoIBAEO6gbcdfH8ijDY2oOvvNlbFdv8PGcwUReWZM58n7Q6qLStG8gJKdgxwKL1wUBgCnBppPeBnJF5geLy24HzeWhWXESaJKkfW5boeRsLDeaL+7ylkp+LV4yZ8ZR+ppV9oJ+J1pUMLeqkAcN8C++pXAoFEea9J17UbLHvGRxHSax0wsvXenm7yESKZ8euJHdDo7XQ8f+saqsDHN9sJ1Hw8PH+YWKMTc0KYyLkXH6NkPHJPcgziPX31opyuvQPSrOJ9RjERqiNYU6LMeORMdSbgQnR+v7HVuwuX8MDaEaAId8ykJ7UBP7qodSfHUO9e+0o4bYOgaoWHzonV6gQuKjnNR3kCgYEA4A2ekYUQnHcqn2+jzJSNVM69ApbluDV1uL63J1npWgTvKBnlPczVhg25G595L1l9YvrIRUawbad9Q537KIIAH6F9FfSl9b2vlXo0D0PYR0JRwDLlVXMwJZ40Ee6slkgsmeDOto+yOk/lk61XMXpEvDkKei5ov57C6cVmFJcsotcCgYEA67g2K1oou6i3SchaehCxbue/owK/ydeLPYr983yfMiDZfOA4D3v2RF4aSmMnPe3sUq4ZRew5nyVJ8f5f14Dirs2jglaQsdopkrNroTNuyLZUZfI9/v/6VVRNTQXigPOcS2NbLmXN0fMi6VxlU8IN3vkXE+cyOv0/eRV258IgH9kCgYAYvqhSngWVojuc3DGU+JsbULHjRVMdoxnbS4Ti3bU98emP3jxJNQQoB//3owc5SYLlmZjgvcvicGsPOrVwZdspoyYzdI+XsllgAt0ZCn8qb5KjzXsyksQwg2ZwzJFXD6WNYRyzYO9oLUbHpo9IsZ5Bw3L6x4FeGGSieOCrSX7uhQKBgDViAJKM1pC5Qtko0KS4Rxaw0UufgcO6VsRXR+/ulzcJDXgkZ03KaxlMnnOeRPLXgR+wYfTd7KbIERkG3Lm3bJ7d31vTMu20VJnunD9joIFAGZkE5Vlsq0rLzr3UyVke0pSYKbw2PgiAIbXrwN7ZIb8PdlSBlXSaiddoLweJhTDxAoGBAKgAyumIYzjryg6mHFemWVidfKMK9UjywGDz0UXxP3UBk3ME8aIw0ynqyjCK8ULspo3dmGA4ze32fKo97xTzUhtx9YkcvXQe8axtqkBLDROHvxUvnhyIZgexey6I+w023LbIbUUr2F/cB0YOP5kidjwrCpTqat0jcir4T26VetRN
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
    'X-iCP-EncKeyID': '289774',
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
