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
    PlatformID: "10533996",
    MerchantID: "10533996",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"YOXI綁定",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "HrXjxI2tLOVmLyw5XaQTc7wlKHtERJLH";
const AES_IV = "VMkB0UPRooULVreg";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA3rS3FFpCtH/n7h5qXnmGGMxIiEbp1pucSTwYq0qWk2PCkB7B3GmKhOzf+5NJoLwFTySMrYNaYfOnEtdJosYK7kAEpdtTxoLUNCaupzTcyI9n03ffe+6VSn9xVK1L5jtHGhIrG59gn6QIVc2hzvIGlvQMmt9CtyrdLrR6RBu4ZgcTA2Dl/RLKVpDNMHgWqRkvH2CA4PDYrFF/gKc+pwH3PDhNUWgT24II0NAVbvrxforQGxoegsTge03OsjbycQLuLNtR28fMzRvWvFst9QNnnhAAWksq2MQ/8KVombqSzlYahl3Hrjkz5kprkzz9kXNcP6J32YUQlFKu4kJxNCKbkwIDAQABAoIBAAhfOMauF0sxHRHpg3bRELEb9NoSowsV8cvFqOkU4RDiCNgMH/OI5X6BEnEi+ftDNjE3HtwNpQyA8VXsUUX/izz7m8Z0YUjZdYq5rYp27+8mMkapKfXpuSOsziDbHDr9HXt7FV3GIbFpTtroOQiji+CJhMke/Xi58XNRBjZLPc+wAGoeeKzBaK/hFtQsbphKs+Fd3GYFFVMH03hZS3vJ8B58/X6VE/F8ufi7wuCh0VegaQ/gLrrUVGcWwAG/KH6iT/D2rf7XHewNDYtJIhOCttpw5/6LUeUCcjJDH29yL9mmO8LTo64YWjl3AbSvvOWdTW3HYVhh1DaFQcpMS1omitECgYEA/BP8yJv9QEt2F09CRPczXNMs8sQO5vRoxLXyBbmzFuo82QczFhEJPNsBmcAFJK8kQ2iaomyrquxyYx1J3BfuCeDtgHJgNOxrdJqybiHGeX6P4XfiYCawnL1FWTzeMC5fcm5TH7FWYxUwWtD0fAVMczLsfT+iRJfSeZvGmzGhJ+kCgYEA4iu9dttgsIeK7dwpKog7xZ0JJkjJWdvzRsZ41VZ0vma34TttSmr6ZO/7EP8Arbq/h2/4Vq1rjRxd6+TQ3jBVkWq5zEQftk5RGur3ecHoIuSte/DsktO1TOG0DQSB2UXLoTrGeR4Hq6urjnzKXiWSaxFEonmwuDUDhKyeXtkOdhsCgYAnTU56UKfZoGpXFAp3Cju920cEysCwDadQFDYZ4mwjxH2cMN0sMZfJHzROrnuezpfO0r5ZWKwjSB5Ficl8QVbhv2oIPsz1M29FjOEI/scdJjh0pOZsq1uZ9ICdezoBNRm4k67uIA4iAKm7XxzfQUw8IdJxbLx2CV3NjBYZGFHSEQKBgQCQrZBGbvE8G4iYvcQrq/goYlsO/XKoI9ZMiPuU5PhLMCQiVUSFXUeNuCHv7l+9wn9woQTIVak+HE5MbxPZfivOmOn/q/hpQ1IImRPz9EGNyKDdbvG2vuz0IFFwHlj95vLq0VFS+w3HGErnHBbMANbX3LT+BkAwpeD5Rv8MB2eDzwKBgHkkINv0aVsXDQu0Mh/23hhPSngrDoBwdVU7Yu5/lTBQA5judlBr+y2usG2YNGVmw17hNcblqzTSJVlDlxtLvTeW6ydH/CUSSJ8dqeKvQI8qFEScBARNj6TeSKGklGUN1/2OQuSRtAdHqBy7GBzMDsCu2RaHJAXSOklHC9MGGFRP
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
        'X-iCP-EncKeyID': '185694',
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
        await QRCode.toFile('qrcode.png', approveBindingToken, {
            width: 300,
            margin: 2,
        });
        console.log('QR Code saved as qrcode.png');
    } catch (err) {
        console.error('Error generating QR Code:', err);
    }
} else {
    console.error('ApproveBindingToken not found in response data.');
}

           if (approveBindingToken) {
    console.log('ApproveBindingToken:', approveBindingToken);


    // 確保生成 QR Code
    try {
        // 輸出至終端
        const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
        console.log('QR Code for ApproveBindingToken:\n', qrCode);

        // 儲存為圖片檔案
        await QRCode.toFile('qrcode.png', approveBindingToken, {
            width: 300,
            margin: 2,
        });
        console.log('QR Code saved as qrcode.png');
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