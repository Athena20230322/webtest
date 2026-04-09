const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');

// --- 功能函式 ---

function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
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
    return forge.util.encode64(rsa.sign(md));
}

// --- 1. 讀取單號 (確保路徑與 bookswebUAT.js 一致) ---
const filePath = 'C:/webtest/TransactionDetails.txt';
let originalMerchantTradeNo = "";

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // 使用正則表達式抓取 MerchantTradeNo: 後面的字串
    const match = fileContent.match(/MerchantTradeNo:\s*(\S+)/);
    if (match && match[1]) {
        originalMerchantTradeNo = match[1].trim();
        console.log(`[讀取成功] 準備取消交易單號: ${originalMerchantTradeNo}`);
    } else {
        throw new Error("檔案內容格式不正確");
    }
} catch (err) {
    console.error(`[讀取失敗] 找不到單號檔案: ${err.message}`);
    process.exit(1);
}

// --- 2. 設定參數 ---
const AES_Key = "8mFv0s9guiCeaw6KVevCzfIpMXjXpuR5";
const AES_IV = "EFq5p4WEXugFxxwR";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAy8cGoVwaBNx4FgTlJ0dR9/bAXPm2gG/0GCk3a7c8WAprQgJV7ZPXqek9KmF7eq1X3cPs+MP/ypsy0pBO76MSEYtRBGnjFsvps62NVzEXqvpg6EzIBG7iFCMVOcHSCVr9r6wanzkXVr4t9D+nCBiGmC/UGMlwPbu+LlAaSeHmB+1l/k3+4row7RY0HvJlM2UpkkEd0eArecvknXecVH7yDmJwUbexfJjyp2U8HLBOrok3q5VYtE9eqZzvaoGmYImD5c5BTkztaQyuiobbyYWxqATweYVUYYRrAI+PJUtGONMUZfKnwTwHPfIRMQFXjAjWnRYtmb5JjzAB+ERfRQb4SQIDAQABAoIBAAE/WkNwN7PCUPUUwDDGkP8YAml1sq/qmSK+VEAgKQoCiYTBh7RV0vYpUirv2dYQa/9H818HSon7YgsQv+SO3QENsOGtoqqn3B0x3/5upuej2YzSgeiOo54RioNSzaEp1QlXeZPYwTnSUQaAjtppbzmAFKfqMJO2kh16d0Hu7heSUhOdDuRS4q0WH90Coqt0RO1gc9AjJR/Y2Y6lkEbz6+WkA6ZODIZx+Jpb/QToGuclh0LoSxRCA6znSOJQ4DcfF155qLBzW/Q5bAtoedXelnW8RFM0OIFI8+kkvWWIhXpkW2JC4NcpMJN/tnB3AqGKo3Noy+iUK2nXHBP7TYnXjgECgYEA746RJYSaxXV8H8VLF4kA8u4Lmbt20CiL73mXu9n36xkPDE56WGbK0UmD8H58V47EH/nGL7uAYX6U1Mj/t4Tvl85AmxEwdAvlv11IL2aG32bq+HXskUW8NGdY2V92c42fEB6LSRHWBJ544qrXgAsXSIj6bEea2zPieRfRzubHqKECgYEA2cPAWukcvWpUThMlVoqnWhbzKVu8A2TrWDyuyvb0faqZRGpKmdrI3gd9ITA+zoJFNxDJCwNXU54KSA/sBtoAd/tVApBJZHH4Dgp0wVnKzG7VyF4cphJt3PMmy83LwT2OxJYam2fp4QDJ4A3J8KzMrbJzewUCABbSTwIF4pa45qkCgYBC3cOL+mCNH0b/Qz27mwVFycY5Kgd3AOpWdNUynRvDZqI5qCokRMT1+BQ468VfVz1NQ5XbOvYRwJhgcJ5YJmYONIb6AalJqwx9BtegS3j4IK0Tny7iOdnXssUtH6VbibtNb4knYzAe5/EMK+2tEutz1rA3yyDhcLEVZd2tZ+NxIQKBgQCjufPT5lS/bUR5dxepm5H7wCmOvPP9MVFpBCb/XvGv0iZuM+RnDQHdPZAs9dMi/PsBTdN6PkbYDYj5aU8yT5Huo77ksIsdxDqWg/IItXQuhF6jyW6Mxmpnp0FSFibN4XSIBbt3gIdtrmQZ2wQruiAhsHv20GsSmhYBZSn7lQrsEQKBgQDO6bPEWj63/9D3ZEdPSSad0D3K3wjw0wj+gYSSUNXlgJmROfLLGzc2lKiA3EzcI6HikpeULsTiVwHqbOX4PjTzUVHK8LRWt6Y7UzvzVST98sp1wzNcep5ZUvETSx6maPFuJAM2t3c/0w93KIgC8eZxKPb/TO59Nd3GoWvOhIBRQw==
-----END PRIVATE KEY-----`;

const cancelData = {
    PlatformID: "10513284",
    MerchantID: "10513284",
    OMerchantTradeNo: originalMerchantTradeNo,
};

const encDataString = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);
const signature = signData(encDataString, Client_Private_Key);

// --- 3. 發送請求 ---
const options = {
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CancelICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '179749',
        'X-iCP-Signature': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('\n--- 伺服器回應 ---');
        try {
            const responseJSON = JSON.parse(responseData);
            if (responseJSON.EncData) {
                const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                console.log("解密明文:", JSON.parse(decryptedResponse));
            }
            console.log("RtnCode:", responseJSON.RtnCode);
            console.log("RtnMsg:", responseJSON.RtnMsg);

            if (responseJSON.RtnCode === 1) {
                console.log("✅ 取消交易成功！");
            } else {
                console.log("❌ 取消失敗。提示：若已付款，請改用退款 API。");
            }
        } catch (error) {
            console.error("解析回應失敗:", responseData);
        }
    });
});

req.on('error', (e) => { console.error('請求錯誤:', e.message); });
// 傳送格式統一為 EncData=xxxx
req.write(`EncData=${encodeURIComponent(encDataString)}`);
req.end();