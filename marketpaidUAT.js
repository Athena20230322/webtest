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
    PlatformID: "10544058",
    MerchantID: "10544058",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"OPEN PRIMA 會員訂閱制",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"71100",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "QsIghfphCVB6pqLEEJ8yPR3oDy4BIiMN";
const AES_IV = "nNwejeBfpZgv3DrA";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAyb9ybXNtmQKYWYwF3b2RIG+Oj0I4P/BOJ2OX6BBAM1GRHHxhGg7/PqI56J87jc1zq4VLxPxWOFoJzipulkQQQdn0eGaTqSgYABL7tdvHBnTpbxB1a8sCR8gI2KX3gdaJCHajZxSvfyjG20eTR084uZbF9Y14gCBE5b2+8Nkgatnt0gawczQzHOVlxtW6psFtUGeSsKeQCXiWl0SvLNlootycxImTnSfESHjzhM9NMlKqMyvLEzxDerr+3ALzHOMoDAiheBa/vtSG7KeXJAhEav2U6pz2jZoFjGNQOR3tL+QhrBNlQxoV6PW28grjPx9RBi7aOOrQz04qu66zwS4GjwIDAQABAoIBAAGMIJjXanXb5a8VuJ1FU9BJsKZORXr3AtmaOj1HZIY+jk62mTDMbEelhIRzGyb1xzWT3MFb5V6ORxPDwdBhmkMOMhW+o3SBSlnVlYtwxc39DqyODzWM4/rt25p1k6DaVf53YxzFXdGkx8OSG+OS1pV2c/n6Z53N2tHYzh2A2DHi252t6n259v+0ZJjCBxqa8TIYwX7vyd3XZ73JrmSmGmQh/sw1b2/u/d2NH1TkWNE7ttVcoAt0+Dzbk9OilV5kUxPa1WtW36fDjCU1xZTli/MM7WMw29A/tFuLdDj3qVRjcaaIX4L5tlEtMvYtHi6J/wQJx8KTOOj/FvKUXDPdHeECgYEA/mLELfgAe+tnXW3DSHSrWibctL1TFOtfm8e0WAh/hLtZkE2U+0dOz7ruw2MGLu9LkyvjrQ1QrpViiy7D09UpXXey4xR43azFCDOvr5wCkLwgN+HmA9jVl2x0xC5OKPH1zePa1LPWqOIjZJp+1LloyyTUzgPQd0C2Ghxos8QZDOECgYEAywcscV/NlN0gHZuXjI66KyICFpJTY2jTPrCMwAyM4Su1LrKjcwk/oGP4vMUVdYmyNIPrLcGInNncJOVr9v3YzoWw6jiGr6k0K4zE5MPaOOu7/wJluiIfPpfmMfpHSSDlXjUrt0oWLX0d3iqHK41vnAs3tMbL4tWBpPRiDhTGkW8CgYEA8WHwu5nng67FH29m7VrfuaTEqrA3pNMPnvcp1psBvYY1H2uuoZ1xWEYOB9Lv7BtfACCWYwAOfgr8Pgu7AEf1f150nWswoVAuinDZFW6ZNJN+kuhE5YOccZoVVo6F1e56israPBkF6KzkXrMHBH2GxbSGRZJy/qWl5jLs2x+JkaECgYASi0sx59A9Qp1GVwnWmsrCWc7bBO586/wvg6y3de4AOx/HbiWjwjp/ieIUS+QT4knWph37BexWd0e2TwY3fyQoaOmp2xPiQ5AyUh9BzenGvTFkr3FfOPKlovYxpmyQb2LD4hNmIGw6J21s93F1Nuv00sl5x5aj12CKEpBKPPeOHQKBgE0CMdoqfqXLFK9ht2/n38BXs6Th3xQEbnZpCsG03oZOGkpa32GemcMex8h0yLPLfjurIkw3+m2G2ex2Bhb2zk2yZsCpSzCu8AqdIPqY6sbpN2pLxIordvRXGU4S+0K8GY9Dr9kqbbBslxcrndzHpDWaJJPBar/GJ3z/VadpjFCS
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
        'X-iCP-EncKeyID': '197269',
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