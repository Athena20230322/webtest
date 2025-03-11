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
    PlatformID: "10510042",
    MerchantID: "10510042",
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
const AES_Key = "hqmWNJydBqsQNOR6zMtqjC87ZzX00yVe";
const AES_IV = "rTrAYCdq3QcSDAR7";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAvtRWu5bqLuTIwJEkTHBD+1vkdDXbTnBfhCnrjK/gc6qBq2GhBlcSIhXYCc24MlPgkpLlFE/Gi89PcSiEZ0PPdeaNpEqQZE2aTH1n/96iI3V40CMPGJMeVLzDPhjs9V85mTzuwVAuZmUfT5U2GUqZBVVXSdg+vigY+Eygp77R8fs5rUUwGTTAX6D0yDroqZx/jDpcEi2Z0lcy8uGwEJFljFDm6e4PhMgdb9ZYZ959XLR22XSm5GMVcCFwN8jFVj2nxlf1tSCV0nuniE/tgXo4fBQeLaXJj64YE1aVGP6UN6TuKH++AYN4nZd1uZnTOggph6S1e3e9KB7OTVT0FxMiKwIDAQABAoIBAA0XH/TbCXIxWDmDv+gxlL34U9Vcqdlijd4+2+sCM5TrpEp/SJ5q71tJ7wdLa0vGzHxxgwypAJKdpFbyoV1gXc5euuaDTqDNF2rHr8coylBl9FMDXKk9ilKbC2sPJs4Z6YMVKOPuC8jJ9ONBCEalJ5Z9JLFhmgzNdBGeDlU6UZHWRWfxzj+DNIM6MCkzaZQKOsktgHRbUNIpjBcnLzJii+pkmhTs/fvkiT5lPLRNbJ8Gg//PxmHhOVLkv7lU/vjYoQK34zDDsITDi7vQl/iATdPmzd3b3EP3FMwiYC4W1myCub9sROP++ysvYxqmZNYSo8jq8nlUcroTk9thF0avaaUCgYEA9JLc4TPQwKNsodDsWsfDC0Mm1TfBHlvaFddY1McM0mWguADdqTfEs9tAXpuILSjHgwAJ/4f0guAyLXfM2IXHlaro2gWQROze6GXY8VxLuIiCEgOwD788onSdAv5pJxhVtwFnmvQB0efnDTVNpFnSoUZF5YY35ROfTl6K1/x2bgcCgYEAx76v4k1Mw63phr4cTCSfiCCphJd2aK04LTxX1hnwgd40ovC/Tu6O7gH0wOBWaDlPq/aVtnVsnumTnnEEx1/cYPqxZGHpPxelahnJXd8/Mr51Z9nMWEh6TJ7Iv61lhwc87glIexbilsrjsb2Zg42wwUkcE3c0Q9Ih/kkv4VejIb0CgYA0rb1ttF9uXsTzRbDjDMvyDRC8NDogc+BRfATiL82PM9yeRXF5FU4E/2CqAA4gy/vNN6DvrTT5S5kDOh6hNI98qUdmTnR4pByPKgDEXADjSmPZxXmSqrpAs6VuE6ZKiW9M77yFH7GUqMKXkbebgs1fd2duvK4lZUiW9L4rL3HC2QKBgFX6nNb6kxp/18+qMaAM+6aq+I0cbVmthkrieKSuUbp1HY8ttguR4HBO4z3K0ybV1Jee8t6xOOpGfMZsu7PebYxJHOaqxq3jzc4X/3eqyxdaqErlk3JE8G/ewWbQiq1OzklgMZTaSvrBprUxec0IxpbMk4tFenffEcbVVgjXol65AoGBAM52CqUBL5YqlVjvQBIuOQrOC1psQ7IMVlAO3UEfpsUXjszV/+32XWCbf/SolA++clMeBdbpEdEiodSSyKzJPrFIVQYcJ4sdnOWYuS4IqQcyqTp3A3Qxg1GTvVGN29PPYuiOemUDPheWUdZpTLpO+5bd4NPAvXRL1F/VMysVa7i3
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
        'X-iCP-EncKeyID': '21084',
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