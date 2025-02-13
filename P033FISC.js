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
    PlatformID: "10512822",
    MerchantID: "10512822",
    RecID: tradeNo, // 動態 RecID
    Amount: "3000",
    PayID: "11682311000003273",
    UsePoint: " ",
    ChargeVersionType: "",
    UsePointType:"0",
    AccumulatedPointsType:"0",
};

// AES 密鑰與 IV
const AES_Key = "qDagVno0pEgSwU7MW8uYUCIBZprJcRv0";
const AES_IV = "RMgkadCqA9LhZiIc";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAz5I7fafn7hQFnv2QnI+WPA6ddycqF1jVv+Z9xI59fXuJYj9THzyp1PYS1XCngDy9azs/uIkjvODAGg95Gvj/v5kI7kDzpmcIS5iqqjhIfIl9OKNu1F/O3sm8eO/jmOZ+7TEZp1Rys1Ggw6PX/RYqUXZVdbjswqAHOAm/lil5ngYFa+HwxDP4MzGhYT8xxRx4HrS6mgYPedBwZb72yoQPm5MQcap3l65mRZayi9hXAe7KWy1ilhiNUkRiVU3Nlys3qU0Ygwk7g4L8/1KKtvdJtMfa2QOyuEZJ9tg7DSI7dTmLuoXukJ3rhadwMmXs0Npy+n9cwbNv7XbcZBAJJyIZOwIDAQABAoIBAEAMQSsOqjP+HZXna73DWHoDkHb5sLUvhhUGi/wgc3xKqCOWopFa6JR7sWgGsMiS9WenCoxoVIytVNk1uQqnllKKaAUMKaJI3HhnDRIk98jlq6vUUhhZz71SxkMS0kmVpciOg/nrxtCp+U8kuTqwojIsr0X536RWOKQD7gfpmEs3xfDhSd7wfTFfD8iWHz2ViFut9tiRxNk9lMzHouWH0SCsz9Kl7mexndI5gyr/wDj/yVHZ4mBDEqrh1PmTIPD5Vrhuu+3JCPXHGHSI0X+lFHj/6r7hQx/4TfKBAOxRlIqn5qpnN16Hmbm4UuMJuO+XDbf0EebesLAlqijwbX6KJDECgYEA81nV23yUplkTg+mMb+9PPynyWVImhTIgeMPZnTQUJfHelYwsgWM9CITY/UXEG0kFXmCO3V4iQ7AcuV7rNx/GqggrZFajnkDAe9O/dVsEWmqPJrsP9Lethd2UzjhsL+jYMDoFYJFg+dNR0Hh/BK1o20UdTbzkK4BVIfobIlJ8FzcCgYEA2lxKyecAKb+hewaMjZSe8K4w93DU3OiIhRW5gGmDJZYvUkQwJKt+CCbI7p1d/01BZrEg3AkUDQu0DjH1lUZsIKJal0clmTmLAKFrDcHzpGU7XYQdMHQo4fCDXNz76h/VEtum4/VGgu9NSUua2VXnj/k3GB8owAXZ63L2d0nUSB0CgYEA2qppoU0Doao+//R3bgmCkwZVL2/DD0KorPuHalvmkuYQlR6cyzLqH+KHvKXY/o+R1Gk9VqsEbQAt/1/MSf8ym4y1uPalFUmn7FysGH7NnZVMxoemYcY+lSAzW06V4EMBJ+yq8kgP9MyvIn1z3TcZFpa3KyhFetVZKiu8AA5QVOcCgYEAigd7EyOdW8aRueXK5RhEXBmQRGmjdLzcx1uTNhP8Xb8QzKzjzdpFwbtamlMJfv+Dzvk6rzxh21lBiROVjLXGVd6q6yODJddVAaIHvNuUOp/vJc8EcIOM8D2LnCDocPeMRe5pEYIS/2NrdGCBUs7VoJHFfM79gFxygz3ZhFA8CxUCgYA2E658wqKNTRGYYfRXEMpbr+D6niNBq5W2e1CIjEPRDu05lEPmVspSg65Ju2L5ef/DTF/cfDD9csLWl4yqV1rqx+MMrrlsCoRd9Xe5Dj1EYKKq9WFfNtAtqnuPWelUR31DnHHNr9yeSoqggWJSfqoQH1BnIm36hvF7GedDTsSLPg==
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
    path: '//app/Cashier/ChargeOnlineFISC',
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