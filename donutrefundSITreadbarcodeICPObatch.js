const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// 配置資訊
const AES_Key = "Ss5PaphpR2wuJGeFG2gk2Ps2fSSSiZAd";
const AES_IV = "ooLIECycNfzGn6bd";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEA9wPhInWySJgLv7b9AbPICpNBl1UTj1pq793otjYrWal6HNpEt9A7zKlkEeUd8YXfvrPFWURGrONqD4/7lX7zJ2ge36wCGcxXxklQpOQURcHGE0VshDtTMe3SiK/Kxd1yyTWxxDdbSmQqM2zWflB2lumcmNFGlSr5M7BwhnLorNdO3tcjAFNZrzQKeZvF4Q+qPOlaG4Jzb8V5ACartq8D9SL1DenV7MzHkbpdSbcV6RU0KBByUSlzlj6LTWjrHjZ6a8+q37paftGx8+XqlrGZN7Ny4X61g3l1WWS7E0VvsdtTH3M43qTMSXqwDjqhl/mnP7Uoc3aATnnE9QVV5tZN+wIDAQABAoIBAAUHvWTzQQjJ0Xg7ZLzNIwy8FPQQL0OWRsk3Tqh8D+pVt8vj0gE53cEVzf9JscNow4N7RVCQQfqXvJT88wjUITJM14KC9GplrX/qbEvMIHGPOAmabbkZPPquUI3bocuuIWR7K6STfNA8aMBlV5tFtJrvWCYKIcYJFJjhEr/zxRmhh2NsRaEqSkJbfkRr8BmwuEkC6ierj/YiYMQImC3uzXUg1nPbKzCyHU8nrZA67g2m4OxtyXVDKYkOOe85rdag+AZQTTbDFYbcUy0GohYiF0cKxe1t1n8nSk1Hr9UqSn6pqZQEdoa6Z8h3S9zIQrY0EqXWrf4MrWovAbkpQwI6MzECgYEA/XPObmWgraFvl93Yqw16/iOU7cQW0+vwNKXW4EEq1DrPL91KzyPP0lpjDLpCOQdEAglNnimCIEjyph//Sk8OWF3ur3cZda6wWMayPzumzHUfOPR56/CzchEi6N34x9mK34UwfjBpKibLJoyPImHJmN0RUy1KILus9ISYS29WNVMCgYEA+X+CMVr90lTdOc7wKJf1vJvEEU7EHyubx3opPKU+e1E7LtM9f1lx9zxyJX7nZn7j/6bG6r3X0T7+hJFsfkLl8hV9LIpK+xMQk5NJF9Dcao/t7RVOnPVLKX+AtzqIEby9NFNlMMPr5H2hZQvLIPp/Oo8KX3klJg4FCODLsIaJh7kCgYEAl0QorkbFURuKiK8FA4H2J/uAhS+FGFI2eJWJ2ynJsASxZzXB0kLjY/5CI3R+1Z56fmSjCIRpf29KMs/iA62PODpHnD2O2me6JCHifE7TzC8SxWFT6vcrgiasGSNxuYUilyjculOWUGv6zzUQsEqAkVVPY78iAMtB/GWup0b5wrUCgYBedHpqiwMq3LwABasAAz+iDup0jvhKwKyyITp5XinAb+lS+d//VXKC4hxou5mJQSK6B36pIgQRkKK0t4V2a4c4VhBUi2qFkRsmc40pegXoReMSbY2ceHTjGgU12O/onyaWJ7hYdOPaVgGDCqr1KkB+f+aybF+2/3nCebBDfTuV6QKBgQDVyQ5Es7bGiVPuzMLkDYjYaXyhphkoXcuremmO5PHSXQeWQrgyNuLEMtdxXhN8zS69a4MLUw4NQpO9V0cV1DKlfOIqXUjyD7MszQaGs3Rqz2zsK1ISLmplR6olUoJ89ZIq4Y/s0y115SasJYImJtgSkT5Zoyzooq5Zk/095hYK9w==
-----END PRIVATE KEY-----`;

// 動態生成當前時間
function getCurrentTime() {
    const now = new Date();
    return {
        tradeDate: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    };
}

// 解析多組交易資料
function getAllTransactions(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 以分隔線切割成多個區塊
        const blocks = fileContent.split(/^-+$/m);
        const transactionList = [];

        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            const details = {};
            lines.forEach(line => {
                const [key, value] = line.split(':').map(item => item.trim());
                if (key && value) details[key] = value;
            });
            // 確保該區塊包含必要欄位才加入
            if (details.OMerchantTradeNo && details.TransactionID) {
                transactionList.push(details);
            }
        });
        return transactionList;
    } catch (error) {
        console.error('讀取檔案失敗:', error);
        return [];
    }
}

// AES 加密
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 封裝 HTTP 請求為 Promise 以支援 await
function sendRequest(encdata, signatureBase64, index) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'icp-payment-stage.icashpay.com.tw',
            path: '/api/V2/Payment/Cashier/RefundICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '248256',
                'X-iCP-Signature': signatureBase64,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                console.log(`[第 ${index + 1} 筆結果]:`, responseBody);
                resolve(responseBody);
            });
        });

        req.on('error', (e) => {
            console.error(`[第 ${index + 1} 筆失敗]:`, e.message);
            reject(e);
        });

        const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
        req.write(encodedEncData);
        req.end();
    });
}

// 主程式：依序執行
async function runBatchProcess() {
    const transactionList = getAllTransactions('C:/webtest/TransactionDetails.txt');

    if (transactionList.length === 0) {
        console.error('沒有可處理的交易資料。');
        return;
    }

    console.log(`共偵測到 ${transactionList.length} 筆交易，開始處理...\n`);

    for (let i = 0; i < transactionList.length; i++) {
        const tx = transactionList[i];
        const { tradeDate } = getCurrentTime();

        const postData = {
            PlatformID: "10525542",
            MerchantID: "10525542",
            OMerchantTradeNo: tx.OMerchantTradeNo,
            TransactionID: tx.TransactionID,
            StoreID: "QATM01",
            StoreName: "財金購物測試多拿滋",
            MerchantTradeNo: tx.MerchantTradeNo,
            RefundTotalAmount: "2000",
            RefundItemAmt: "2000",
            RefundUtilityAmt: "0",
            RefundCommAmt: "0",
            MerchantTradeDate: tradeDate,
        };

        console.log(`正在處理第 ${i + 1} 筆: ${tx.OMerchantTradeNo}`);

        try {
            // 加密與簽名
            const encdata = encryptAES_CBC_256(JSON.stringify(postData), AES_Key, AES_IV);
            const signature = signData(encdata, Client_Private_Key);
            const X_iCP_Signature = forge.util.encode64(signature);

            // 發送請求並等待
            await sendRequest(encdata, X_iCP_Signature, i);
        } catch (error) {
            // 即使一筆失敗，也繼續處理下一筆
            console.error(`第 ${i + 1} 筆執行過程中發生例外`);
        }

        console.log('---');
    }

    console.log('所有批次處理完成。');
}

// 啟動
runBatchProcess();