const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
//const { exec } = require('child_process');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const fs = require('fs'); // 引入 fs 模組以進行檔案操作

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
    PlatformID: "10524697",
    MerchantID: "10524697",
    MerchantTradeNo: tradeNo,
    StoreID: "Dev2-Test",
    StoreName: "Dev2-Test",
    TradeMode: "2",
    MerchantTradeDate: tradeDate,
    TotalAmount: "700",
    ItemAmt: "500",
    UtilityAmt: "200",
    ItemNonRedeemAmt: "100",
    UtilityNonRedeemAmt: "100",
    NonPointAmt: "0",
    CallbackURL: "https://www.google.com?CallbackURL",
    RedirectURL: "https://www.google.com?RedirectURL",
    AuthICPAccount:"",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
};

// AES 密鑰與 IV
const AES_Key = "eBPfnO3bSysAZv4NN3jY4cDDeUEi9zd8";
const AES_IV = "LVa03Iqz4nditW1c";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpQIBAAKCAQEAoij7jR1rRrx0DyY36D5eIYnd94/M6+MdZ0MJLCmLTFnFrck+p6ADWd0kezQRLsV4LnUnkMWz9O2UjiNV3OAO+R9EvOG1euThv20Vcab11FAf7gHcDvMGmEPtoejgwwRveZllvyuZ+q+NJig4w1c5LRwZ1tCrAWqMO/0FzCW4akQpVQo0fJGAmNg9FW+vd0FxWJ9Vu/vTcfoVGASwZ0kvDukgTpV0w4qhsAW7MpO7hkc/rPmpvRIjsRU32/VZa08x9+VW7Zkere3pa2E9UVtrdtwvwnsrui/dNjYSoXLmX1ncg/Cn8Bzk1EFAlMrzLFTIoJWzxqs5iJetrd+BGrp/+QIDAQABAoIBABVvfm/KdkOnpgiEoE+ibZYDCqTuzNitBoDVGIbOcmakLUs04YPjVTNmq1Zf7Ro2KetWOuXaby3kI/GKvo8PzTA65RQPcApv7Al+asnBwhg6g+YAjULVTEdfdK+k6uUh68xyrcOmCK4zJjY84I1YioB/M56KVI3qNDcP0i7eGPEZnbNc4QheLAFHYqgI6WzBC8Tu8D6u3Vmn38SXi6LWwJ0cKM7M+EmdB+lNcoJ5EOgSxGR1eJfm5rqckQXwWZ8LPwZZQ0+U/Kuiq/1G1YxKvIunZnVsSov9/OC7leZSfwunZWByGB/se0vzFgHlnEaq17+vOrTQejBzHz8Saq0pmeMCgYEA4b/f4fqLfyPJSwujN/Wmdo+vmVVXQP2K1rEI0kO4sNGF5ewR2NNdAWJM/rTgycHKPGHmb3XcFqU5dQXCKULimypCvp5Z+mASlYtWfcdzvkT5SsRfNDu5Qg3qiehauw3Zhiu38xRc6d292Mqny+5WoUK+7LIkMZOM/iRpiWNvVssCgYEAt+O7h/ZSpf2KRWHyDRrsbf9hwXwluyAbGexeuMpnghSa2+7eygjLTSsh0/YYTQehrRLEFI5QgSoKVVy41n2IgdqpzPA/g3o3b/0sjdnUlPoEmSvo7yM8O62xCSgdB3vsMgCXNiQOfTzmoIgjUM0vgWLX7u/85w9WWoFANorvZ8sCgYEA00IOL5mZhadlrnb7jVizKOyZ9bIpb0ZV8UfG6444fi/1UA81PGW/+ZWWXB3E5soViaBMVy5CgmaoeFylMJvJGE/aGixyI55Yhd3ZWOeX5w0BBfjy5xyk563COMBaeAYj9C1hfXcm5CyAhypPEMbABzVBGpwyxrpADWzh3pJRFTUCgYEApnZSxotm2bggORqnANIEgLaUCZCWn0Q7BEaCoIkpFgoM/VbI+t7nGp4W60d1TBXCd2frdCg4HBSwcgGTmSbeMZ5943UAKcay9H+cm3Q7CfkhvH6RSBj/Z46eGgnj7Whysfjy6SHOs/QzWdKjFXwIqvmNO1CoAYpSw28Jb9ZpTe0CgYEA1ukUWepliTcD4jN4O17OHDF4bEPVwDF+RVpyWW/Oeuk+Ys0pfzqQwWkv5qJe7IGiPVqfl7QMAJFSN83PhYQuO0Dykkj5rQ9vC0JW6kRDpaTHh1vKCkxk4nTGecFoiulrZrbgmvagU0zsvRxHoHQ2RUGTjaQbxz95xTL7MY2GCmE=
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
    path: '/api/V2/Payment/Cashier/CreateTradeICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '329467',
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
                if (parsedData.TradeToken) {
                    console.log('Trade Token:', parsedData.TradeToken);

                    // 在系統上顯示 QR Code
                    qrcodeTerminal.generate(parsedData.TradeToken, { small: true });

                    // 生成 QR Code
                    qrcode.toFile('grab.png', parsedData.TradeToken, {
                        errorCorrectionLevel: 'H'
                    }, (err) => {
                        if (err) throw err;
                        console.log('QR Code saved as grab.png');
                    });

                    // 在系統上開啟 TradeToken
                    const command = process.platform === 'win32' ? 'start' :
                                    process.platform === 'darwin' ? 'open' : 'xdg-open';       
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

// 取得 MerchantTradeNo 並儲存到 .txt 檔案
const merchantTradeNo = tradeNo; // 從 getCurrentTime 函式中取得
const fileName = 'obedientstoreMerchantTradeNo.txt';
fs.writeFileSync(fileName, `MerchantTradeNo: ${merchantTradeNo}`);
console.log(`MerchantTradeNo 已儲存到 ${fileName}`);