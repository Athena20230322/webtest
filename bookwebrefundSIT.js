const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 1. 工具與加密函式 ---
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return forge.util.encode64(rsa.sign(md));
}

function getCurrentTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return {
        refundTradeNo: `R${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,
        tradeDate: `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    };
}

// 讀取檔案解析 (修正讀取邏輯)
function getTransactionDetails(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const details = {};
        fileContent.split('\n').forEach(line => {
            const index = line.indexOf(':');
            if (index > -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                details[key] = value;
            }
        });
        return details;
    } catch (e) { return null; }
}

// --- 2. 設定區 ---
const AES_Key = "ebFzMlZp9PPK4yUDMWrER97JZUv28joQ";
const AES_IV = "XT14YYkZnL1gb8vj";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAkaBN9p/Ivu/FRg4OngM9biqHp1DrM5EaXJk2nBPOGjBNmcqM6N1rfLf4kKkg9t0FNkeFCqMySnWih9x36wDBGmOsVE3S90P35PPu9E4O4EFCZG1AcJGcoR5zUW3ZxRp+NTzVLzQ3IIhzNTMqBz+cOSdUM4TKKAUEU8Oa00yIA4ySUfmzs5bv0KJaxFDKSMLjVMbsfsbcXOgcTuo6aBuGGVF243HnXeNfXPu7yQDVLCzhI2nrKSvham2bAihLN2t//SV6IjfTha76fhLZ6BluavNsrmpec6umHYD7Jsg8IrEDXIvVbO0TG/vE0eDm7zMPPNFJOS2ZPX1x8sjZN24L2wIDAQABAoIBAA9aI/30+FfQtS5eewIDe21qxGRKLpGAIZRTfqNTny25m+Szqsk91oAOcQDnI5eC03LWdVsau0mIPzstbeLzcGgUy+0TS0NQAgk8Ahv1QrI3jwVBU0LKxwVhTWzvNL8HvPhl0l+olIs0d1jLbQnYleKcl87al+lCJiOigmb2MXyWI2/7r0LcFn1pNv0nUaTljarqEp01FDFKbvwh5ZE+NySguR6wYfWdPULxISVbyueRcPCSKvdmLHBCQmpccJa5BiQcFQtGiVu+Y3O9r+HXc+CW/pzOE8S400VcaAbpANWtkt4n5127hBBPk762nFiyPo3ZUrZMtaYVPeHysBJIUkECgYEAt7C8GPtRS6fK99x1UWnafdxrSVadcuN0rmwqdCb9/h4HftPD9lSGgKuN1U+3rW3YJMwzCPOLy5//7VqgI4ZxLhCucQCtnHsH4or5owM8yXtPXN+D2enqEhYdd5T57A/P/eJydLfd1FbYJoh7Z7V/zqonT5hadCMTAD2Xr7t7ICECgYEAyvOt50Ba7w/9Wdnge1hlzN46ArTdJFHRYr+zhV6Bq+RSKsWN+kzKxig+gY9fJ7Fsd8q99ZqzeEyIetTj5oJEp1OAXgsjZ/p4ScgAJLfnb+lYuarJAI/1hue4Y2VN0nA82xkju7kjx7mOCGVlPEJPytoIZxjce/agZRDNovuCHHsCgYBENcyjOi+l+FjWUXb/FF+d/QuZ4B/3WZ8qZeAd4ZzPkDcYUWqjPh/0B8BTRZbfP7rTb0BEQqvWoUNX0B9HEdVVVbxxGd9eDBGRfinU7o7UAoYl5pn/gWz56lxm21sy3WxOypfV37Dv+I+rP2MTz8H17BlM5TYxihS0MirxhpziAQKBgQCkGM+d0Z00+trA0bf+Q4VcVrrVAWRlP3pru9Dtn3J9h8kgKEgaAAlcm6GepEwuDflECrv5YDKIrGkV2BjFgsL8ADok0CC6q/yiu4HSLpiFFknVJdAMElpVz/p486ou4u1xwivwV0wk61V6WHG4fW2C+TQeGC3+VXVvAl0i0PVtDQKBgQCLEQ9lGN9FaO5AFVBfFZMssnsdF55F3udJrz3SNlW3YZvaK0ZSWMtfi7CWSD7EoW7+yEU784l8mm229pquqpA9Qj/JI11eHktgFCcKyQgqiNgT0Dz4OK6ayxkJ+24HmZNLZscv4Y29tbELKt3RJ7OSeOMcnu6zwWZR4HVUGIZhrQ==
-----END PRIVATE KEY-----`;

// --- 3. 執行 ---
const { refundTradeNo, tradeDate } = getCurrentTime();
const details = getTransactionDetails('C:/webtest/bookTransactionDetails.txt');

if (!details || !details.TransactionID || !details.TotalAmount) {
    console.error('❌ 錯誤：無法從檔案讀取 TransactionID 或 TotalAmount，請重新執行查詢程式。');
    process.exit(1);
}

const refundPayload = {
    PlatformID: "10525512",
    MerchantID: "10525512",
    OMerchantTradeNo: details.MerchantTradeNo,
    TransactionID: details.TransactionID,
    StoreID: "QATM01",
    StoreName: "QABOOKs",
    MerchantTradeNo: refundTradeNo,
    RefundTotalAmount: details.TotalAmount, // 確保這裡是數字字串
    RefundItemAmt: details.TotalAmount,
    RefundUtilityAmt: "0",
    RefundCommAmt: "0",
    MerchantTradeDate: tradeDate,
};

const encData = encryptAES_CBC_256(JSON.stringify(refundPayload), AES_Key, AES_IV);
const signature = signData(encData, Client_Private_Key);

const options = {
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/RefundICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '247476',
        'X-iCP-Signature': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

console.log(`[執行退款] 單號: ${refundPayload.OMerchantTradeNo}, 金額: ${refundPayload.RefundTotalAmount}`);

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => response += chunk);
    res.on('end', () => {
        console.log('\n--- 伺服器回應 ---');
        try {
            const resObj = JSON.parse(response);
            console.log(`RtnCode: ${resObj.RtnCode}, RtnMsg: ${resObj.RtnMsg}`);
            if (resObj.RtnCode == 1) console.log("✅ 退款成功！");
            else console.log("❌ 退款失敗。");
        } catch (e) { console.error("解析回應失敗"); }
    });
});

req.write(`EncData=${encodeURIComponent(encData)}`);
req.end();