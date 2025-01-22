const https = require('https');
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

// 取得當前時間
const { tradeNo, tradeDate } = getCurrentTime();

// 模擬店家數據
const data = {
    PlatformID: "10525512",
    MerchantID: "10525512",
    MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreID: "ICASH-001",
    StoreName: "Books",
    MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
    TotalAmount: "10000",
    ItemAmt: "10000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [
        { ItemNo: "001", ItemName: "測試商品1", Quantity: "1" },
    ],
    TradeMode: "2",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "https://www.google.com",
};

// AES 密鑰與 IV
const AES_Key = "ebFzMlZp9PPK4yUDMWrER97JZUv28joQ";
const AES_IV = "XT14YYkZnL1gb8vj";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAkaBN9p/Ivu/FRg4OngM9biqHp1DrM5EaXJk2nBPOGjBNmcqM6N1rfLf4kKkg9t0FNkeFCqMySnWih9x36wDBGmOsVE3S90P35PPu9E4O4EFCZG1AcJGcoR5zUW3ZxRp+NTzVLzQ3IIhzNTMqBz+cOSdUM4TKKAUEU8Oa00yIA4ySUfmzs5bv0KJaxFDKSMLjVMbsfsbcXOgcTuo6aBuGGVF243HnXeNfXPu7yQDVLCzhI2nrKSvham2bAihLN2t//SV6IjfTha76fhLZ6BluavNsrmpec6umHYD7Jsg8IrEDXIvVbO0TG/vE0eDm7zMPPNFJOS2ZPX1x8sjZN24L2wIDAQABAoIBAA9aI/30+FfQtS5eewIDe21qxGRKLpGAIZRTfqNTny25m+Szqsk91oAOcQDnI5eC03LWdVsau0mIPzstbeLzcGgUy+0TS0NQAgk8Ahv1QrI3jwVBU0LKxwVhTWzvNL8HvPhl0l+olIs0d1jLbQnYleKcl87al+lCJiOigmb2MXyWI2/7r0LcFn1pNv0nUaTljarqEp01FDFKbvwh5ZE+NySguR6wYfWdPULxISVbyueRcPCSKvdmLHBCQmpccJa5BiQcFQtGiVu+Y3O9r+HXc+CW/pzOE8S400VcaAbpANWtkt4n5127hBBPk762nFiyPo3ZUrZMtaYVPeHysBJIUkECgYEAt7C8GPtRS6fK99x1UWnafdxrSVadcuN0rmwqdCb9/h4HftPD9lSGgKuN1U+3rW3YJMwzCPOLy5//7VqgI4ZxLhCucQCtnHsH4or5owM8yXtPXN+D2enqEhYdd5T57A/P/eJydLfd1FbYJoh7Z7V/zqonT5hadCMTAD2Xr7t7ICECgYEAyvOt50Ba7w/9Wdnge1hlzN46ArTdJFHRYr+zhV6Bq+RSKsWN+kzKxig+gY9fJ7Fsd8q99ZqzeEyIetTj5oJEp1OAXgsjZ/p4ScgAJLfnb+lYuarJAI/1hue4Y2VN0nA82xkju7kjx7mOCGVlPEJPytoIZxjce/agZRDNovuCHHsCgYBENcyjOi+l+FjWUXb/FF+d/QuZ4B/3WZ8qZeAd4ZzPkDcYUWqjPh/0B8BTRZbfP7rTb0BEQqvWoUNX0B9HEdVVVbxxGd9eDBGRfinU7o7UAoYl5pn/gWz56lxm21sy3WxOypfV37Dv+I+rP2MTz8H17BlM5TYxihS0MirxhpziAQKBgQCkGM+d0Z00+trA0bf+Q4VcVrrVAWRlP3pru9Dtn3J9h8kgKEgaAAlcm6GepEwuDflECrv5YDKIrGkV2BjFgsL8ADok0CC6q/yiu4HSLpiFFknVJdAMElpVz/p486ou4u1xwivwV0wk61V6WHG4fW2C+TQeGC3+VXVvAl0i0PVtDQKBgQCLEQ9lGN9FaO5AFVBfFZMssnsdF55F3udJrz3SNlW3YZvaK0ZSWMtfi7CWSD7EoW7+yEU784l8mm229pquqpA9Qj/JI11eHktgFCcKyQgqiNgT0Dz4OK6ayxkJ+24HmZNLZscv4Y29tbELKt3RJ7OSeOMcnu6zwWZR4HVUGIZhrQ==
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
    path: '/api/V2/Payment/Cashier/GetPaymentURL',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '247476',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
        response += chunk;
    });
    res.on('end', () => {
        console.log('Response:', response);

        // 假設回應包含加密的 EncData
        const responseData = JSON.parse(response);
        if (responseData.EncData) {
            const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
            console.log('Decrypted Response Data:', decryptedData);
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
