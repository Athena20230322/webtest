const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const QRCode = require('qrcode');

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

// 取得當前時間
const { tradeNo, tradeDate } = getCurrentTime();

// 模擬店家數據
const data = {
    PlatformID: "10523456",
    MerchantID: "10523456",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"元大證券投資信託授權綁定",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "mch1lF3Z69NfItwGXOQnjS0jEhXCGdgv";
const AES_IV = "ijFZVmF48QLxkbeG";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAuMEIy9zUHaUBk9EwI27M66ZDSiJ3NEgZbjvXpXHAJdqhCqsiL20DrRF4kZYAz1lCnBAW/wKX7P7axMdO4vi6uS2FMwbNT2ZN88CiRWqMsLhZqGRmsqUBo4gEjIX7wX4dmmV1KbhVGvj7DJaLYv8GTASH4IMy1NQE13uF2Io3byjXoeA5kiShsIPQ3Kf9DDVlfqfb/k8CTlOhRyJdVeKUuXSKFNtxCQ8kjwmXnIyq4V57BylGQqV9ppCbcTqEazV/sSblmh+WhYWBb1NmRwa3+m0xeeTGv4TQ6HPlQFbUNpzP0CAMVKtWFYHSkQFsWnqgaVQBGUpbpI0VpAUQIhF14QIDAQABAoIBADukUTcihDVHscEqvCwMFkoSY9GYW7v8dH0yA1UM6hcuQ2OiyEfgHNovdCknb/5/1bF0vj+3ch0XTr9MigpaekjSSZgl33x8zbhdHOVk1qMr+AGU29Ra0TMd8z37+MBHer3/d7muoIazDrRLGxcrtbgvlD+livDKuv9nCFfVkrymuZ8E8mrVdvQjpmZehasGIh+jeya+XaDx0kGKanRlQNastEW57XH6EonFiIVetrvFVRYTl55b8js5E6pKhuAUbvBVstLzzk4Ji76+32DJL8EsbOqzz6/tmNJdqCOpEeLgKcH368c+0T/9YiqpTg/3eavmwwd4hSKmOmP1mF3/vPMCgYEA0GfAIG7LDp6o+NI7DK1Mkzsccx+wjsdrOzRCB0Ojm7K9h+DKoQRRTGXyj06VgkFCFUzkFzAZGo6VgdPqFRQ6JQKw6bt4UAFsmkuS51pko2qrMce7X3NjnfkzrUY5sz/ax3L+4vnTAJnukR7yTDNbG6Y3mOJidkU4bw2JrHP+hm8CgYEA4vKIe3GOObhJhNIX8ixSDMDfRfg5FSKErX9XYQfG1pDBLGqG1jolYu9HqPYe2K9bRCZ/zSnYw1l53sW4iCNXD+qiTisI9UOu4fgkGp3zPI4DYCn+ih6AhzUi6u/FhBcYa9CHJuiZUlhTT0mpnpkBMAHQxmaAdI2dsAq8XTFtcK8CgYBBZV0XkEytsMHLGoUnDDZsOO9LfNU1aIRQlqxlhScQ03y/550N+8HbHF6J85ncvseS0Yb9c71c5QMrMylQJgG83WRQY+B0Eo5WuIJHkMjlsrI3s7orUJUg3DMIG3I9ujrXvVEYPlak6KjA5xoXKUJcocLueZN2E3CLAI+ECv4ChwKBgHMJhW0tTm6rn3iYFlNHa//S9Fo/TJAOAzr+xYgFrSCuF30wMlD9AF5589UNjO1BVf3hlf6lK586B7CIgNVhNIx43vTIk63fNRKN+Z8UWWtkgQmJv+C7PWNL5/s2tuQR4OsltJxgYvd+lhwmtrgRzqxK/0zSQGLUNg46IukKWPM5AoGBAJm4YdLcMpVWNMYZ0KkhzAJikDy+nNWfp5DLy7uxBvahrdJne/pFZNcRtPpaxar3v900CvdTEkTa5L8MuWNWfccixQ0x9oOwAGj4VDV5KZ6V3M+jlANHTZqtw0OWj0CgnQSxPa03gbMhpORTx+z8KdiCjx9v/P8105Dst+5E90sp
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
    return CryptoJS.enc.Utf8.stringify(decrypted);
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
    path: '/api/V2/Payment/Binding/CreateICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '166556',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
        response += chunk;
    });
    res.on('end', async () => {
        console.log('Response:', response);

        // 假設回應包含加密的 EncData
        const responseData = JSON.parse(response);
        if (responseData.EncData) {
            const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
            console.log('Decrypted Response Data:', decryptedData);

            // 解析回應並提取 ApproveBindingToken
            const parsedData = JSON.parse(decryptedData);
            const approveBindingToken = parsedData.ApproveBindingToken;

           if (approveBindingToken) {
    console.log('ApproveBindingToken:', approveBindingToken);


    // 確保生成 QR Code
    try {
        // 輸出至終端
        const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
        console.log('QR Code for ApproveBindingToken:\n', qrCode);

        // 儲存為圖片檔案
        await QRCode.toFile('yuantauat.png', approveBindingToken, {
            width: 300,
            margin: 2,
        });
        console.log('QR Code saved as yuantauat.png');
    } catch (err) {
        console.error('Error generating QR Code:', err);

        
    }
} else {
    console.error('ApproveBindingToken not found in response data.');
}

        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

// 在此將加密過的資料作為請求的 body 發送
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();