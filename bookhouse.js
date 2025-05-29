const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const QRCode = require('qrcode');
const fs = require('fs'); // 引入 fs 模組用於寫入檔案

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
    PlatformID: "10526358",
    MerchantID: "10526358",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"財團法人孩子的書屋文教基金會",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "NXOz8ACj8s9IDA3fjPLuSsia8ZztxVez";
const AES_IV = "LSFtLvJzysApVHzb";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAowrmGwJO9P3aEO2Gj04V+pz5h3DNsZry0hlwL8W6gM0CcBo16T/Tv/acHcPUrSfphpFD+/fjGNnL5hjhCcG2WkfMhyuHCf5/iQtnfOKdUMhNZC1bl0vWqg4dMKx9A96SmG2oS7OJ9lJV32vCTygOoiyVftHGtZM1EIozU/9ihO4mdu5mND4l5VuM0MyoJxgj2BLvy9lAvWuQeHVNKQdd+m/rzm2W0u1hDHBXNAzyiSwVcrMLT6FdXP4A7rlpMH0LYmj8rLKMhAxEz9uLyrwg6eeQfMy1SBGv+IrlwR/KUo0POo8Axzzb+Fx672jRALRanZWMA37+sng1MtYm4CbIUQIDAQABAoIBAEXHFFPa2Q/g1MMJ5NzP/ngTVnewv1eTiPiCCpFnfjpBgxmXHhuFRYqScJ4MgajZvAfrg70Cih7Il4sSer1COljJAa+X4WNVmB9+0fuQwOMh1n1ZLCnEO0rsX3HFYHuXdgXmaHB9lj3lXvsPk0ltS1X83r436WMsbTl27CC22+MnmZ6V5wMclzTx5QOiCfoCItqyg82ArhS+wLbaoLV1M3p7GXN2YLluRtyBgnbxokLtC40RtGX8Nm3FOor71q+dHX650keLscVNlkGW5GXBnE0pxj9EbR/J2QBBZ4cRo8Z3X7r5De0+uC/s6pr7qFnGRr/rQwJdA3jhqrBWTNw1uUECgYEAuvDTvmmFTWGjPzK+e1khKiC4/pFy8ctb1bu39yYbWe4wsxMCB5YnUMjF0Hbt8Z8aFBsNfJMCYGkiAuKUcyDMkRh4RDph2JEyFlMTHYYuzVM7fiS/ivtzoXRSbo2DaqVjGaC4bcw47mtZGyrcqPaGgb2K+VA49Mno/WyftNiVNssCgYEA30X/u9zMLJ3sWM/J/5HVanwDEKAlN4fGztbGwl5uosqLRSiCmEsYIftywA2x+ie0Hk+jyq/pD43R/HBplSKjpyjemlnMv3nw24v/I6ye1PyyBympKff/0fczk08gupUcwneV8f33dyDmgk5ZA3s5FkysWn+TrR9Gmw9eC+2M/dMCgYEArzqE0IxqtnEaK2guYsLWMn3/yieefgWn7H2MYK+onbCGl6TulxvpeHDp85E3UvBW6pe9GZNXe/WwOtIWYqBRAITWXuX2x6C6OXDfjyIzBqXJM2HQ5b7z0ViO2C/wCmxCq0ga+Fig2ONo3+1ab0q+JCj+dtn6uYH10m8aeNM3cucCgYAsuLGjqHNBEJTRqTU1urk7rgFTKDCsMccRkRWYwx93/gftX1LhPFFmJR5z94pJqAA8/gi5xYhyNB72aHHNjHWpOtdzpT8Mr1keMKl3NNFPqhnis2aN4H3eSZyMChJtLQbosNlY8lzKAM4LFbRgrSLfI5Z2Pg2PZK9Yybg1vWw7PwKBgQCWVcgrgr43MeYdjBctZhLqBLH6vafEFgkBz9Mx21zqdIcxV03lXO+aM8YKZCqh+cqTq4YFU3w6PKao3tHvVtUvoL3VTpsVDP38zpn2Yht56hEhaFfKRxzHAzrSZ9tfFvko4zcOmRjA+IMEFtm4b3bM0QGUXkPYMuqfFv5KE+SZow==
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
        'X-iCP-EncKeyID': '261550',
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

            // 解析回應並提取 ApproveBindingToken 和 BindingTradeID
            const parsedData = JSON.parse(decryptedData);
            const approveBindingToken = parsedData.ApproveBindingToken;
            const bindingTradeID = parsedData.BindingTradeID;
            const bindingTradeNo = parsedData.BindingTradeNo; // 提取 BindingTradeNo

            if (approveBindingToken) {
                console.log('ApproveBindingToken:', approveBindingToken);

                // 將 ApproveBindingToken 寫入檔案
                fs.writeFile('ApproveBindingToken.txt', approveBindingToken.toString(), (err) => {
                    if (err) {
                        console.error('Error writing ApproveBindingToken to file:', err);
                    } else {
                        console.log('ApproveBindingToken saved to ApproveBindingToken.txt');
                    }
                });

                // 確保生成 QR Code
                try {
                    // 輸出至終端
                    const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
                    console.log('QR Code for ApproveBindingToken:\n', qrCode);

                    // 儲存為圖片檔案
                    await QRCode.toFile('bookhouse.png', approveBindingToken, {
                        width: 300,
                        margin: 2,
                    });
                    console.log('QR Code saved as bookhouse.png');
                } catch (err) {
                    console.error('Error generating QR Code:', err);
                }
            } else {
                console.error('ApproveBindingToken not found in response data.');
            }

            if (bindingTradeID) {
                console.log('BindingTradeID:', bindingTradeID);

                // 將 BindingTradeID 寫入檔案
                fs.writeFile('BindingTradeID.txt', bindingTradeID.toString(), (err) => {
                    if (err) {
                        console.error('Error writing BindingTradeID to file:', err);
                    } else {
                        console.log('BindingTradeID saved to BindingTradeID.txt');
                    }
                });
            } else {
                console.error('BindingTradeID not found in response data.');
            }

            if (bindingTradeNo) {
                console.log('BindingTradeNo:', bindingTradeNo);

                // 將 BindingTradeNo 寫入檔案
                fs.writeFile('BindingTradeNo.txt', bindingTradeNo.toString(), (err) => {
                    if (err) {
                        console.error('Error writing BindingTradeNo to file:', err);
                    } else {
                        console.log('BindingTradeNo saved to BindingTradeNo.txt');
                    }
                });
            } else {
                console.error('BindingTradeNo not found in response data.');
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