const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const { exec } = require('child_process');

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
    PlatformID: "10523923",
    MerchantID: "10523936",
    MerchantTradeNo: tradeNo,
    StoreID: "ICASH-001",
    StoreName: "JGB",
    MerchantTradeDate: tradeDate,
    TotalAmount: "50000",
    ItemAmt: "50000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "2",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "https://www.google.com",
};

// AES 密鑰與 IV
const AES_Key = "bJ4WoOqmytNrs86Bw5cADMzF6YNWHoaM";
const AES_IV = "A4Z1tOCkv64wNxOH";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAmIqTTarf5eALlxVZ55rnp7PiF0vOtLGBXEvwAequsnJbdLkdCAvbJNIQNFe1HzQAqGAdRk5sV3ypvv+5pLb8IVp+irfB12sAVzkQ+pqmunbWRe1Go0TDhmsvFfWyRPiFo5HZA10ZQnzZHFvoEaMk/VZhZkMAP5bPPQavZkL1iNAGCqP3vfUNxE7w6HeQwEvVoiZ7TSb2TIskujDEz4zZZw4aZmlv316XEeKBFlq/4LDbsMPZ1/OWLG53wQCb/J5pR3nK3SRavBg75l5iRa5PVnwEiBXNdlYvDztyYNmPkLSRb9YihGZYhfEc87KB/00OxnwaJ65uM0UGiWy2maR3BwIDAQABAoIBAAp+agDLUwjQ32s+3Eb7GJmoXdLlc6xpk7EiRjoTh34eMN14SJ9/lU1UqCm5qOujG7J5njnydjCUkmbh18cVkYXH4HGxj4O+yDC368uZrQOh3j7EQnpD5kGOiRg1JVTqVeM5StkY4/53cUYqqm3gL9C/ywaKcG9vdAVKOvHJhHOrZKxhsNuvYbB9KL4gN0Xdy+Oykh8WTFaSjlcsjxc+wA72MOBBDV9Qa1pzfe1rFAXr3Mo6W1m7h6CBmoC/pEjhb+yljcGO3GpTS6bzNkCj/twqulENZFd1PnhDKtAZpFBTnHJuqd8PuAs6nvQJSmfK4Pqx+W089rthBYqd5gl0brkCgYEA0Jp3LR7y4IFWlxLyoAAIWDajN5R8LW37IcXGoceELMBxp/al0YryIhGbRsKDehubfXn3T7grrC+XG3l5nQjG/gv0wCqLQEFPIQA1vt44omix8z/+nkBcNi4qoE5b/O1sVRW0g+BrZd41K0/PleL346Inx3qZcjlgvedFQ8F/v08CgYEAuzM6Q3WhJOTHKjTbpthVyZfGuzzb/XwjOQ3416o2FR3zs4LumFGKJPJDD7CJXxgwnHhREDy/EGX83T0oDhynpfCgPubqao8+TbuqWC1F1kG1JPgLhZWQP7bBb4M0YtudIxw0Za0A4CW5JrjadxQ5pHOgqLAuyxFUAZA26bJUHskCgYACzD+S9FpPloyBxDhK2xVBkaIIyc4MkfAPWOa8Hr/wFbiwhwdcUx/CQzgw78Txq1MfkLY3dIHpck31iWCPMaHxoFltBmUNvJKCH82YvMRHsV3JpG8W0kgqVd4ufj6PmuOcFIlyR11JZXyTEyP2n6+xduhPrZ5HQOvCQErWiM7c0wKBgFMmX/zS5O70R5rxu5cShJh0uCs2zyh62VJgaGWzDy62DSdxQvWZUlky2qK/cWUx43W845Toxp1MD9NddMs/4x+MEEGgZANM+QmiD/n2sgyHRyTSoJuHYXlLfgRALSa0EcoknwmCnN7zIpiWh0NZUnk/et8y0rYUTlIbcqi/MyoxAoGAElzEV77qNJgzOfwzx9tbi5L2OIGr3BGvZ3MPr8GReY5NqN6qpzXoTyhXet8dLt+Pe/IT9hiyhgYgrkbxO/6Lekjns8V2bBCZx06Vpw22cZiMJg37h1uVKMWzCBh9LGvsg6/7T8KCxC8JhnaWlYOQFbm481aWYmyFl1fH5/gQAAc=
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
    path: '/api/V2/Payment/Cashier/GetPaymentURL',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '174176',
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

        try {
            const responseData = JSON.parse(response);
            if (responseData.EncData) {
                const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                console.log('Decrypted Response Data:', decryptedData);

                const parsedData = JSON.parse(decryptedData);
                if (parsedData.PaymentURL) {
                    console.log('Payment URL:', parsedData.PaymentURL);

                    // 在系統上開啟 PaymentURL
                    const command = process.platform === 'win32' ? 'start' :
                                    process.platform === 'darwin' ? 'open' : 'xdg-open';
                    exec(`${command} ${parsedData.PaymentURL}`, (err) => {
                        if (err) {
                            console.error('Failed to open URL:', err);
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to process response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

// 發送請求
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();
