const https = require('https');
const fs = require('fs');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

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
function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 取得當前時間
function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `Sample${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

const AES_Key = "Ss5PaphpR2wuJGeFG2gk2Ps2fSSSiZAd";
const AES_IV = "ooLIECycNfzGn6bd";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA9wPhInWySJgLv7b9AbPICpNBl1UTj1pq793otjYrWal6HNpEt9A7zKlkEeUd8YXfvrPFWURGrONqD4/7lX7zJ2ge36wCGcxXxklQpOQURcHGE0VshDtTMe3SiK/Kxd1yyTWxxDdbSmQqM2zWflB2lumcmNFGlSr5M7BwhnLorNdO3tcjAFNZrzQKeZvF4Q+qPOlaG4Jzb8V5ACartq8D9SL1DenV7MzHkbpdSbcV6RU0KBByUSlzlj6LTWjrHjZ6a8+q37paftGx8+XqlrGZN7Ny4X61g3l1WWS7E0VvsdtTH3M43qTMSXqwDjqhl/mnP7Uoc3aATnnE9QVV5tZN+wIDAQABAoIBAAUHvWTzQQjJ0Xg7ZLzNIwy8FPQQL0OWRsk3Tqh8D+pVt8vj0gE53cEVzf9JscNow4N7RVCQQfqXvJT88wjUITJM14KC9GplrX/qbEvMIHGPOAmabbkZPPquUI3bocuuIWR7K6STfNA8aMBlV5tFtJrvWCYKIcYJFJjhEr/zxRmhh2NsRaEqSkJbfkRr8BmwuEkC6ierj/YiYMQImC3uzXUg1nPbKzCyHU8nrZA67g2m4OxtyXVDKYkOOe85rdag+AZQTTbDFYbcUy0GohYiF0cKxe1t1n8nSk1Hr9UqSn6pqZQEdoa6Z8h3S9zIQrY0EqXWrf4MrWovAbkpQwI6MzECgYEA/XPObmWgraFvl93Yqw16/iOU7cQW0+vwNKXW4EEq1DrPL91KzyPP0lpjDLpCOQdEAglNnimCIEjyph//Sk8OWF3ur3cZda6wWMayPzumzHUfOPR56/CzchEi6N34x9mK34UwfjBpKibLJoyPImHJmN0RUy1KILus9ISYS29WNVMCgYEA+X+CMVr90lTdOc7wKJf1vJvEEU7EHyubx3opPKU+e1E7LtM9f1lx9zxyJX7nZn7j/6bG6r3X0T7+hJFsfkLl8hV9LIpK+xMQk5NJF9Dcao/t7RVOnPVLKX+AtzqIEby9NFNlMMPr5H2hZQvLIPp/Oo8KX3klJg4FCODLsIaJh7kCgYEAl0QorkbFURuKiK8FA4H2J/uAhS+FGFI2eJWJ2ynJsASxZzXB0kLjY/5CI3R+1Z56fmSjCIRpf29KMs/iA62PODpHnD2O2me6JCHifE7TzC8SxWFT6vcrgiasGSNxuYUilyjculOWUGv6zzUQsEqAkVVPY78iAMtB/GWup0b5wrUCgYBedHpqiwMq3LwABasAAz+iDup0jvhKwKyyITp5XinAb+lS+d//VXKC4hxou5mJQSK6B36pIgQRkKK0t4V2a4c4VhBUi2qFkRsmc40pegXoReMSbY2ceHTjGgU12O/onyaWJ7hYdOPaVgGDCqr1KkB+f+aybF+2/3nCebBDfTuV6QKBgQDVyQ5Es7bGiVPuzMLkDYjYaXyhphkoXcuremmO5PHSXQeWQrgyNuLEMtdxXhN8zS69a4MLUw4NQpO9V0cV1DKlfOIqXUjyD7MszQaGs3Rqz2zsK1ISLmplR6olUoJ89ZIq4Y/s0y115SasJYImJtgSkT5Zoyzooq5Zk/095hYK9w==
-----END PRIVATE KEY-----`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
    const { tradeNo, tradeDate } = getCurrentTime();

    const data = {
      PlatformID: "10525542",
      MerchantID: "10525542",
      Ccy:"TWD",
      TxAmt: "36", // 使用者輸入付款金額
      NonRedeemAmt:"",
      NonPointAmt:"",
      StoreId:"",
      StoreName: "財金購物測試多拿滋",
      PosNo:"01",
      OPSeq: tradeNo, // 動態 OPSeq
      OPTime: tradeDate, // OPTime
      ReceiptNo:"",
      ReceiptReriod:"",
      TaxID:"",
      CorpID:"",
      Vehicle:"",
      Donate:"",
      ItemAmt:"36",
      UtilityAmt:"",
      CommAmt:"",
      ExceptAmt1:"",
      ExceptAmt2:"",
      BonusType:"ByWallet",
      BonusCategory:"",
      BonusID:"",
      PaymentNo: "038",
      Remark: "123456",
      ReceiptPrint:"N",
      Itemlist: [
          { },
      ],
        BuyerID: inputBarCode.trim(),
    };

    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/SETPay',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '248256',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        res.on('end', () => {
            console.log('Response:', responseData);
            try {
                const jsonResponse = JSON.parse(responseData);
                if (jsonResponse.EncData) {
                    const decryptedData = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                    console.log("Decrypted Response Data:", decryptedData);

                    const responseJson = JSON.parse(decryptedData);
                    const logData = `BuyerID: ${inputBarCode}\nOPSeq: ${responseJson.OPSeq}\nBankSeq: ${responseJson.BankSeq}\n`;
                    fs.writeFileSync('marketpaymentrefund.txt', logData);
                    console.log('Data saved to marketpaymentrefund.txt');
                }
            } catch (error) {
                console.error("Error parsing response JSON:", error);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e);
    });

    const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
    req.write(encodedEncData);
    req.end();

    rl.close();
});
