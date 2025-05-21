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
    PlatformID: "10524652",
    MerchantID: "10524652",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"綁定星巴克",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "obix0KiPMQqlDrDKEwtCGHaXPuoytAJZ";
const AES_IV = "yJQHlnghifLjKLqJ";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAzKk3ncSgBvrhSc84xuha9zzjc3yhhbRg5JJFvzpq0gb9r3kitScGVp+NnKQ5xx52u27XVYF+vxxJuPbDpUUVe2LOU/kXGsE5wicHmY47TaDvsz11SyVFILWX482fCc7tA8AUp7ojmDQn8i0XY5ajfRLmHs/xNaTLWK5546hsGTLtLJwag9QJ8TF1BIKXT4NZEKkybH61lMIYoZKqXVQcyLexx9tGMHzAqGDui1r9Q/DXirycBe1AdIgc8IjgJ7Lo7MqxR2pzGA0g8UpcAWZp5UgXklQWxpFgKX3XUhqTa4uCciShia+CTQDvbBcGOeQ5bcxZUWmqidpukkvlrPJtzQIDAQABAoIBABUf2D5AF9ZwmcVhDra1MAJ59e4rLI7c7e1ZzbotwO3Zy+CLS9JP618Qi/DhoJcVZWL2T2KjgZ4fQNrHGa2a4ltAeRSAzuozjI8mMSof3K4oEOW6z7sIZ0i3hax9Qk+kXKF494jSdS8WHxNnpRTh7RERXNBMXVTQpC6Mn8coULQO9rrUNSQs4cagc+bG75VmHDsbRPAGIdkUXFFcnPC1v+MsNE241Y0KmRhHj6jl4hoSsAH2rUNcWR5QTvv4tcWBldLCb4zKq/DVlRAjLXXEx4adRSpzInqS0lfVBGfF2fm6qXye/OHa7+H6UzGblxtpQ/0ZhO+I3999lTflRnmioU8CgYEA9p7LSlkyQNWlw1wr7Pgay+8yS2B59Udjb5hpxWgEXvj9I7BI7E/LgRlrkJZ6dodFJqfJrhYyY+xQvP08z1zAGGU86iaN6mRey01ybKFmZyyd+akh15xEp0xYfR2pEiDkKzC3e54qkEoO7jxwTLnEf6xmtiaBoR06V7YCXmm/rxcCgYEA1HHjgnAm1IlOLSx6rgmchqatdDJCBsejS6B3Fr/i+OilXOpvzrpLGbfrXAJURiz7ikKmqfdQRdj6wV7rfu5u6d9TG2F94DLM3DAzO0ZBsqCQsY2tNObGBG8K0HVWUr1bBNtqyF+/PGrSK7neNzOM1eENwsQNR4hPdBKYMX2zuLsCgYEA7N7D3tsg+0i495S109rQ0gMiSWeWe9FfXjYDkUlAuX9okzikMeTKT2r891iwsttlvaT2frBvIa4+Neb82yX4kvXZtgPl1rUknxv5xQCYfIxMBxk9mftLrWwUqcctNm5E+H7IHIFj3EZlZMjEC815QC90T4tYgkiyWsBEMi5bn20CgYBRYwwoxXRqyetULQ0WrYH0p9gdgr9+v26Uo3XcFkkK2H25WerZhM8OnEIjbpUAiW0YK66TwLZU++ocuJN5fjipii/ZdoD1qiCHXkPSOnkiyJaGHuOzN5G20x+OetVGP1qmQrTm7J9jsvyvWbaC6VHUAjL2YYtA0zy1GAaMNz7pzwKBgQDQuJjpJ/tqoYJuqwLX/kmC8no8XQKKbbJpCoMENCIjeYTK/2PdKRaIFVohLXl5/r2Kr5C2FKlCGfPq5Dj3O0wEguXyw0D8sdngk1aE5hGSLJb11CTj86cWc3+PyWydMtyDfmuCnytMLvzOekVC7UeE6FfpXF6abLPzxhCoXRaeBg==
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
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Binding/CreateICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '218069',
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
        await QRCode.toFile('statbucks.png', approveBindingToken, {
            width: 300,
            margin: 2,
        });
        console.log('QR Code saved as statbucks.png');
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