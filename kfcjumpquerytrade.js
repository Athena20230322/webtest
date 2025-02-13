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
const transactionDetails = getTransactionDetails('C:/webtest/kfcMerchantTradeNo.txt');
if (!transactionDetails) {
    console.error('Failed to retrieve transaction details. Exiting.');
    process.exit(1);
}

// 使用讀取的值
//const OMerchantTradeNo = transactionDetails.MerchantTradeNo;
const MerchantTradeNo = transactionDetails.MerchantTradeNo;
//const TransactionID = transactionDetails.TransactionID;

// 模擬店家數據
const data = {
    PlatformID: "10537061",
    MerchantID: "10537061",
    MerchantTradeNo: MerchantTradeNo,   // 載入 MerchantTradeNo 的值
      
};

// AES 密鑰與 IV
const AES_Key = "Tu62LBOEUYRZYPXKPDpe4Ta5F3WoxBmR";
const AES_IV = "2weaUNr9QyqzA6Sx";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAoHgVN1Y/4WGIdqrvePvFOz6G3sbxR9KzIqZxdPGqmmqOfyXSBOdmxwuoCyuScvNGKbemrSAJWsELILBMW1LeNVjCbasjZZcLorZz0hixgKWh5RTCXigUdVSuyOUiKdFrn/HRD1d0HlRlDK231XaKHxuOBjDFd1mDD0qHcH4lDJmOGWdvETYPYe2zcggWq3hEL0paKga/sfqt6gwYFZ0oxpqoaC4XyzpWTXua9iEY2JSXARFoBYhnPUqc+/OUGXNM5A/emvKaRHy0Fpufx02qDzq60vAeXWfox9mdbq0EgJiEhaw2MmuqaCdb0WqOWohieNnCbmOXtKeVQyn1l6B7HwIDAQABAoIBAAzhFnLWjVH9jgJYPdgr/OyAXDrNJNhq5M3HJhwIuXSjUMSLuIuENw+Ks/YRjTOEqwD2KH6Er7uE+uuourgpsoP9l71Nmw2wTdLFag5WxQhaQuAsBl2gQeQY495j5ZYNpOG1et4MWtmEVIfr+XE8jmFoyMFecLrfiFFV3gD9XuPf3psTRqBZ2EL9eGZpPTec0apSxvaqYrOW20CL/NKcNG3fAfiF7NLbOwAaUdle+2nqfjIWmCXMe6Zs3Hs+30vVU4O4XCLrbpZFX+3UqAkQuels4dDiJf7XftYofgvVZA07Ifvl3UkrM+4/TY+PgXCYJzwd0Zi+HL1U7qRte2L0WmECgYEA14wu3kJho+2peMYOJ0Ae3Dt88NRGQIhKFy9GoIrFBcZBnjpn+d0HFQmjjVGtbMuwZLaYte5zoPbCu6kA5zoENAIaIeMT0JWWECgONVBGVeGJvFnCjUwmkJQd791qaTPBT1bAMg7+oTgOr9oY+0JkzKGeHgzGCcZNHxGC1SnUvrMCgYEAvpWx9g7bAkm+IGVsbFxCkRImgsR1Fxv8kbJv7+u+Sp1I46fXYKqlDO3tX2v0gopdeYOrAhVMYa5ExRc2sD7LmbUwuzIl91lwjyPdiCqtofHKJO71jeeFmCuW38c2itHYOCaO5y24UoKtODBOmxI4nmS2NIMdMLU7UI4eRyX5B+UCgYAS/zfiPtd8KyYUjuAQdYZCwrtwPkUyytA82t3OqGxU5fRCjcM8Mk69e+v+OISgYhNZzP4IisuGFDl1cJ+zwVk9fDHxaqIEcCqZoe4epMSOLSKGhyKucVe0xlkdGtaWDwmqhGrL/qZSby5cMUyiWGep4VSeMWIC2odRhamSP+2QIQKBgEci/PAJD3pFKDBTayrvLPGVQsagqcvcaGPBpMJ6zeZv2tsOtPeh+kVfMbDiTLvFBarrmJMIfCAhug2O4pzac4iF9xCIYV94BOmIy5GdzH2cEIXEo+c5ucXYz1Hru9IJDZm32rMzf49cs2c7sLt1C6kjklb7cZPSsbcZtPd9lvx5AoGBAJSkWDFJAr8e6Fq5IHTTYuvGUXonWJergMGNEQI73yvjxu8qkHGaHv3XsQI1EGeAAJaB1i034t/q7haB5Uh69QJ6GisUYQFCgLYOZXhAPuGQVY03aTK5PIROoxUS3iCrEUsPky6bqYW1K5HNMpLyHVvhfj7TBhUNw72q1Pp+M7dR
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
  path: '/api/V2/Payment/Cashier/QueryTradeICPO',
  method: 'POST',
  headers: {
    'X-iCP-EncKeyID': '282316',
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