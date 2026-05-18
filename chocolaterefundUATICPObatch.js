const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 配置資訊 (已同步第一段程式碼的設定) ---
const AES_Key = "I2D3XLzMJAdbGcbyyzQFh3sVohrlnaqD";
const AES_IV = "l2zJKgkxKIze3cGn";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA1ZpebC+xA+86iajzTiFm9KBvkCRJ9QnXjJhzDQdrLzys2mCINWB8LJbBU9yMoEoC6e0iIvuUVKXCDo+6YhjTlpZIfAcUqFDYbdijTk4LYUZEMPTEypBtbSkKICTGjpPhIdO+xEzwBvR8Rc8ioEFou1J1V0465vjljHxalCoR85XYLxX+IAgKIz8e9IEUP8m21fpvV50h1XAEn5LY6rF2PylCXsAx8Jt2fS5zp1u66FV6Ev3kntQ4RFxrpXHV1I8eAjyMi4TVT4hSD2DG3bEN4UPec7vjPwEg9u1RYY5cbNhwQwBmd4jKaNdqNrjRKEqOTTsdiBLKN1fAjsaXq+/thwIDAQABAoIBAEhe24QDKpH/MVGnzPuZRJU4cGQhb29WzNGla0GsVEv2XkhE8ZFIJfpDf7AGpxy9xrv0LJ82ptyBJr0hRFBtQe8g7uEa0wxuC8432qiyt5dXI86Ed9J72Z9lCrm2TBHNl7cK03UV7jMlDZ/nXL94OeBRwVD5v+o2xStyjIvrrxZcfRlEvVNTOj9pE3p2tANH/ZrvIDMsIIfztdffjb2KummB8zcjDfqFudBeg48U1owZMqLprbNktQmG3wodEvdhwWPTYvVhRRUJ3t7OM26/6giYVPdWLDT6TTiVmyIsoZZwlPsIrqZX0gI8uIwMYY6ltRL5nuvXzqWY3BhBm4pktkECgYEA/foLDbzMP44nQnOdJnn5K3F0smR0wiK27HIeeAy5a6zsDmcTVmVUZGW1gB2MiOjAcCprzo1ZaBqfohei6XFLsOlGkOWcY+wu78nuqPzPLmUB6Xf5zUmaGYdM2qq3PmfbgR7cBFAH1mcBzi5afq0ZaxBu5hqWG/ix1bIAyGqUEkcCgYEA10387hHL5lB0yDwU/1CHMPnPsMh5DYLonsHC90C2CAsrnk/QE/Scm48XAAdzL2HI+CESVHOxNuWhOdwozdd2rRJzD1kwqYgdxfHkk2haJGyRZe7ZgEX5YNuYDPiSKfUHmAODO2MZNZuM7pQgTLdfDNQR7dHo0Z+HIdxvnqL9qsECgYAgMjZ8g1aRKAAqGGXvnr7LlxJoGvwCMExoJP9f0J0g3Ub/fGmjJi1QnOQpXZWXNYpPrdEE2j5fSCC8d6qbVVV3E9tyOulccXBxzXOH0KSjCQL5CdCNCauTWOeRQNsB+kCFWdgiY9Lahyxfatjl/iOewvKMEQq+eQRyRqJ6xagHuQKBgQDT41OFNAx3uDyGBuMfNTAnGeK090Zy7p9iBgyK6qt6lQuzPJbp3LT3PsYC6FIKknCHCX0Rkd4Yybp2x918XozT3TFRLJSAc43hjaJHE86KxDH/oCV7YOIA2Xv1X/fwxM1ZZDOVkXxwzonPDgYPmfM4G8kdRJSdICOMRnWvKHb+wQKBgD/4zeQJxjP2OSBH4n44NNZ0P4TX+Q2hc915pn6BbBf2xJlZsZwa1oehan1fJeXgnpee0Q5ZQlu2H0QvBhbVZHt0RRdwuzCQVH+qTrsvskqMSRx0YLbe7WmSt2R5RiTITD6NKG+UZDrHxKFu/VtpprSbpg/NL90O27qGiXzXqRK+
-----END PRIVATE KEY-----`;

// 動態生成當前時間的函式
function getCurrentTime() {
    const now = new Date();
    return {
        tradeDate: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    };
}

// 解析多組交易資料 (讀取 TransactionDetails.txt)
function getAllTransactions(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 以分隔線切割區塊
        const blocks = fileContent.split(/^-+$/m);
        const transactionList = [];

        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            const details = {};
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim(); // 防止路徑或時間中有冒號
                    if (key && value) details[key] = value;
                }
            });
            // 檢查必要欄位
            if (details.OMerchantTradeNo && details.TransactionID) {
                transactionList.push(details);
            }
        });
        return transactionList;
    } catch (error) {
        console.error('讀取檔案失敗:', error.message);
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

// 封裝 HTTP 請求為 Promise
function sendRequest(encdata, signatureBase64, index) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'icp-payment-preprod.icashpay.com.tw', // 使用 preprod
            path: '/api/V2/Payment/Cashier/RefundICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '172385',                 // 同第一段
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

// 主程式：依序執行批次退款
async function runBatchProcess() {
    const transactionList = getAllTransactions('C:/webtest/TransactionDetails.txt');

    if (transactionList.length === 0) {
        console.error('沒有可處理的交易資料，請檢查 TransactionDetails.txt 格式是否正確。');
        return;
    }

    console.log(`共偵測到 ${transactionList.length} 筆交易，開始處理退款...\n`);

    for (let i = 0; i < transactionList.length; i++) {
        const tx = transactionList[i];
        const { tradeDate } = getCurrentTime();

        // 構建退款數據 (使用第一段程式碼的邏輯)
        const postData = {
            PlatformID: "10523750",
            MerchantID: "10523750",
            OMerchantTradeNo: tx.OMerchantTradeNo, // 來自檔案
            TransactionID: tx.TransactionID,       // 來自檔案
            StoreID: "QATM01",
            StoreName: "巧克力店",
            MerchantTradeNo: tx.MerchantTradeNo,   // 來自檔案
            RefundTotalAmount: "500",              // 固定退款 500
            RefundItemAmt: "500",
            RefundUtilityAmt: "0",
            RefundCommAmt: "0",
            MerchantTradeDate: tradeDate,
        };

        console.log(`正在處理第 ${i + 1} 筆: 原單號 ${tx.OMerchantTradeNo}`);

        try {
            // 加密與簽名
            const encdata = encryptAES_CBC_256(JSON.stringify(postData), AES_Key, AES_IV);
            const signature = signData(encdata, Client_Private_Key);
            const X_iCP_Signature = forge.util.encode64(signature);

            // 發送請求並等待結果
            await sendRequest(encdata, X_iCP_Signature, i);
        } catch (error) {
            console.error(`第 ${i + 1} 筆執行異常`);
        }

        console.log('---');
    }

    console.log('所有批次退款處理完成。');
}

// 啟動
runBatchProcess();