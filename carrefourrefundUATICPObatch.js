const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 配置資訊 (已同步第一段程式碼的設定) ---
const AES_Key = "G7bHiz7r58YSEqUutEtkieEoGDQvbMij";
const AES_IV = "HyM09jTPru0fU9Zt";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA3Ype91XFXtRzfRczGoagYyFwoWFELVzqg5NhuQ/Ql361azHG41xYOZ7Nhszi289GFxCG9KjyQVPIkkG2nKiyufr4x8iGx2ILY/0OrDFzz4jI/VLtOzbU4V3LbLVllcLwIATZCrPkfjHkOcIiYUZT/TQU1m6xdoHgXkwMvzc3pO5ReNf09UBrsU2G5/TTpesEQoVFNzUhmCbx+AuJV5w+8H7scocUEn09IR2chwtbg5rqLrrkBXACFNomQ8BcHQwbquOBY/cXSuPjI+mMiXSp48nV2jBTI6OmdlxyF3U06FSU11SRsSVfvxxaw8azPij2yCY+yXb3Izbix+YF7GKdPwIDAQABAoIBAFBCRVZIifjpca9zPK3S8P8IydOFN9xRSZqCRch0HMcNfe8IOPv8Y+/4ApBf4J3ucP+BGss++4jEMCkgSmZlzV4IOKG0GXPZJrRCJNMoFUMt1FbF+LDXk/bTcpN/Af7oAPMwnmq8sj4vl/V+ydLA1kOoXxYyQvNiaOTwmzuY5v1GNoCJlmVsrSn9IJ9jEEK3z1dzGQbg1aQ7aYrH6MzVGQK2mI/n+j443tmV7ezui/iG0zMNBSsjPXpMOeDTGYgD+F4kAkXqZf5W2bzT2qDzU+8iBdFTFkltCAK9QKMCkl6hIwU7rppEPeAJ9R7JNkfjWzZfEEn42uOtm13KfZW/hpkCgYEA/Gdx7lWyQVsNK+yb2Cn/fd8UMm4ghfMBKpEAmfSVyxnXNhi6NOHjplbd4ini3SzZJ1e+DHCXPVzOq6u0iQgL7X+Xmb/fwV6BAV2I+coyrEMmjlbyqkOaAX7RjIcMxCcbX2gJfBe0Llt+g8C0eIKttqGC87CanhUGOMtCf7lgBacCgYEA4LJcpr22eWhTKfyV5qvMXQIkdEj/mS49PQUMPomW4kB3cpFHy2AHwcY8IcdoZAo513qCrPqJPfBpq+71I9iTjgdHhdME/Y3WZdiVDoqY5HC6FaVbdJuIsYwLiXP5ADCzv6DPHxah4Q1cC1SrILrI1Xvq+8VdtIsXyINHkBhKTqkCgYEAn7vLk1xycf/wZwLXYca6ZOs/eebN+FdgPpMDgWsTPTR+SUL+3Ka0DjndM9r0MqrGRqq1oGPEotXQCT6iAzKvcb8Urv2J2nM3SyjpncNDrFbW2K/X5L7hgN7EOJ3jC2QAY7GQhxLtOYU3nKPg0n9I9lJicFwsjayagmjIDdLAHPMCgYA4FYz2uYegSh/n7Pnld6As3uoGdGoH6/ixEF98BI+6rWijGgwXgUKuZTKBI+q0fbDuTc/sKSS0ZxuZJK3fYqGB4+NATemC+DI5fZPG62U6L8DiwkFPm7rExjXi+yV9nKpg/Fx2YAnLyK/ezCVip/yU/LcsXJkFBWrMS6hDGS0C8QKBgFRPUpR833FHjaCDWJ71G0ewFSPkO0Hm83e5VLQeG4BNIcU+kr+d6jl9gPkNx+KRo8hyAYiy8MFF/owSRQRJY7qQnngJMAJ4sDrtHA9+Z1q+9X6DPuM4NWN9NjvvkgKcHNt4Loe1sFn31piCKtqdlm16AQBI2cjCrILRnY/iqjN4
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
                'X-iCP-EncKeyID': '185618',                 // 同第一段
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
            PlatformID: "10533993",
            MerchantID: "10533993",
            OMerchantTradeNo: tx.OMerchantTradeNo, // 來自檔案
            TransactionID: tx.TransactionID,       // 來自檔案
            StoreID: "QATM01",
            StoreName: "家樂褔購物",
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