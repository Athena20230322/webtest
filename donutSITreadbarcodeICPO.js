const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const readline = require('readline');

// 建立輸入介面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 1. 先詢問使用者要輸入的單號
rl.question('請輸入 MerchantTradeNo: ', (inputTradeNo) => {
    if (!inputTradeNo) {
        console.error('未輸入單號，程式結束。');
        rl.close();
        process.exit(1);
    }
    rl.close();
    runTransaction(inputTradeNo);
});

function runTransaction(MerchantTradeNo) {
    const data = {
        PlatformID: "10525542",
        MerchantID: "10525542",
        MerchantTradeNo: MerchantTradeNo,
    };

    console.log(`開始處理單號: ${MerchantTradeNo}`);

    const AES_Key = "Ss5PaphpR2wuJGeFG2gk2Ps2fSSSiZAd";
    const AES_IV = "ooLIECycNfzGn6bd";

    // 重要：私鑰必須靠左，不能有縮排空白
// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA9wPhInWySJgLv7b9AbPICpNBl1UTj1pq793otjYrWal6HNpEt9A7zKlkEeUd8YXfvrPFWURGrONqD4/7lX7zJ2ge36wCGcxXxklQpOQURcHGE0VshDtTMe3SiK/Kxd1yyTWxxDdbSmQqM2zWflB2lumcmNFGlSr5M7BwhnLorNdO3tcjAFNZrzQKeZvF4Q+qPOlaG4Jzb8V5ACartq8D9SL1DenV7MzHkbpdSbcV6RU0KBByUSlzlj6LTWjrHjZ6a8+q37paftGx8+XqlrGZN7Ny4X61g3l1WWS7E0VvsdtTH3M43qTMSXqwDjqhl/mnP7Uoc3aATnnE9QVV5tZN+wIDAQABAoIBAAUHvWTzQQjJ0Xg7ZLzNIwy8FPQQL0OWRsk3Tqh8D+pVt8vj0gE53cEVzf9JscNow4N7RVCQQfqXvJT88wjUITJM14KC9GplrX/qbEvMIHGPOAmabbkZPPquUI3bocuuIWR7K6STfNA8aMBlV5tFtJrvWCYKIcYJFJjhEr/zxRmhh2NsRaEqSkJbfkRr8BmwuEkC6ierj/YiYMQImC3uzXUg1nPbKzCyHU8nrZA67g2m4OxtyXVDKYkOOe85rdag+AZQTTbDFYbcUy0GohYiF0cKxe1t1n8nSk1Hr9UqSn6pqZQEdoa6Z8h3S9zIQrY0EqXWrf4MrWovAbkpQwI6MzECgYEA/XPObmWgraFvl93Yqw16/iOU7cQW0+vwNKXW4EEq1DrPL91KzyPP0lpjDLpCOQdEAglNnimCIEjyph//Sk8OWF3ur3cZda6wWMayPzumzHUfOPR56/CzchEi6N34x9mK34UwfjBpKibLJoyPImHJmN0RUy1KILus9ISYS29WNVMCgYEA+X+CMVr90lTdOc7wKJf1vJvEEU7EHyubx3opPKU+e1E7LtM9f1lx9zxyJX7nZn7j/6bG6r3X0T7+hJFsfkLl8hV9LIpK+xMQk5NJF9Dcao/t7RVOnPVLKX+AtzqIEby9NFNlMMPr5H2hZQvLIPp/Oo8KX3klJg4FCODLsIaJh7kCgYEAl0QorkbFURuKiK8FA4H2J/uAhS+FGFI2eJWJ2ynJsASxZzXB0kLjY/5CI3R+1Z56fmSjCIRpf29KMs/iA62PODpHnD2O2me6JCHifE7TzC8SxWFT6vcrgiasGSNxuYUilyjculOWUGv6zzUQsEqAkVVPY78iAMtB/GWup0b5wrUCgYBedHpqiwMq3LwABasAAz+iDup0jvhKwKyyITp5XinAb+lS+d//VXKC4hxou5mJQSK6B36pIgQRkKK0t4V2a4c4VhBUi2qFkRsmc40pegXoReMSbY2ceHTjGgU12O/onyaWJ7hYdOPaVgGDCqr1KkB+f+aybF+2/3nCebBDfTuV6QKBgQDVyQ5Es7bGiVPuzMLkDYjYaXyhphkoXcuremmO5PHSXQeWQrgyNuLEMtdxXhN8zS69a4MLUw4NQpO9V0cV1DKlfOIqXUjyD7MszQaGs3Rqz2zsK1ISLmplR6olUoJ89ZIq4Y/s0y115SasJYImJtgSkT5Zoyzooq5Zk/095hYK9w==
-----END PRIVATE KEY-----`;

    function encryptAES_CBC_256(data, key, iv) {
        const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }

    function decryptAES_CBC_256(encryptedData, key, iv) {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    function signData(data, privateKey) {
        const rsa = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha256.create();
        md.update(data, 'utf8');
        return rsa.sign(md);
    }

    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Cashier/QueryTradeICPO',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '248256',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            try {
                const responseJson = JSON.parse(responseData);
                const decryptedResponseData = decryptAES_CBC_256(responseJson.EncData, AES_Key, AES_IV);
                const parsedResponse = JSON.parse(decryptedResponseData);

                const { TransactionID, MerchantTradeNo: respTradeNo } = parsedResponse;

                // 儲存格式修改
                const output = `OMerchantTradeNo: ${respTradeNo}\nTransactionID: ${TransactionID}\nMerchantTradeNo: ${respTradeNo}`;
                fs.writeFileSync('TransactionDetails.txt', output);

                console.log("處理完成，結果已存入 TransactionDetails.txt");
                console.log(output);
            } catch (err) {
                console.error("處理回傳時發生錯誤:", err.message);
            }
        });
    });

    req.on('error', (e) => { console.error('請求錯誤:', e); });
    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();
}