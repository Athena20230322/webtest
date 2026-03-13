const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// AES 加密/解密函式
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

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// --- 1. 讀取檔案取得原交易序號 ---
const filePath = 'C:\\webtest\\TransactionDetails.txt';
let originalMerchantTradeNo = "";

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // 使用正規表示法尋找 MerchantTradeNo: 後面的字串
    const match = fileContent.match(/MerchantTradeNo:\s*(\S+)/);
    if (match && match[1]) {
        originalMerchantTradeNo = match[1].trim();
        console.log(`成功讀取原交易序號: ${originalMerchantTradeNo}`);
    } else {
        throw new Error("檔案格式不正確，找不到 MerchantTradeNo");
    }
} catch (err) {
    console.error(`讀取檔案失敗: ${err.message}`);
    process.exit(1); // 終止程式
}

// --- 2. 設定參數與加密 ---
const AES_Key = "G7bHiz7r58YSEqUutEtkieEoGDQvbMij";
const AES_IV = "HyM09jTPru0fU9Zt";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA3Ype91XFXtRzfRczGoagYyFwoWFELVzqg5NhuQ/Ql361azHG41xYOZ7Nhszi289GFxCG9KjyQVPIkkG2nKiyufr4x8iGx2ILY/0OrDFzz4jI/VLtOzbU4V3LbLVllcLwIATZCrPkfjHkOcIiYUZT/TQU1m6xdoHgXkwMvzc3pO5ReNf09UBrsU2G5/TTpesEQoVFNzUhmCbx+AuJV5w+8H7scocUEn09IR2chwtbg5rqLrrkBXACFNomQ8BcHQwbquOBY/cXSuPjI+mMiXSp48nV2jBTI6OmdlxyF3U06FSU11SRsSVfvxxaw8azPij2yCY+yXb3Izbix+YF7GKdPwIDAQABAoIBAFBCRVZIifjpca9zPK3S8P8IydOFN9xRSZqCRch0HMcNfe8IOPv8Y+/4ApBf4J3ucP+BGss++4jEMCkgSmZlzV4IOKG0GXPZJrRCJNMoFUMt1FbF+LDXk/bTcpN/Af7oAPMwnmq8sj4vl/V+ydLA1kOoXxYyQvNiaOTwmzuY5v1GNoCJlmVsrSn9IJ9jEEK3z1dzGQbg1aQ7aYrH6MzVGQK2mI/n+j443tmV7ezui/iG0zMNBSsjPXpMOeDTGYgD+F4kAkXqZf5W2bzT2qDzU+8iBdFTFkltCAK9QKMCkl6hIwU7rppEPeAJ9R7JNkfjWzZfEEn42uOtm13KfZW/hpkCgYEA/Gdx7lWyQVsNK+yb2Cn/fd8UMm4ghfMBKpEAmfSVyxnXNhi6NOHjplbd4ini3SzZJ1e+DHCXPVzOq6u0iQgL7X+Xmb/fwV6BAV2I+coyrEMmjlbyqkOaAX7RjIcMxCcbX2gJfBe0Llt+g8C0eIKttqGC87CanhUGOMtCf7lgBacCgYEA4LJcpr22eWhTKfyV5qvMXQIkdEj/mS49PQUMPomW4kB3cpFHy2AHwcY8IcdoZAo513qCrPqJPfBpq+71I9iTjgdHhdME/Y3WZdiVDoqY5HC6FaVbdJuIsYwLiXP5ADCzv6DPHxah4Q1cC1SrILrI1Xvq+8VdtIsXyINHkBhKTqkCgYEAn7vLk1xycf/wZwLXYca6ZOs/eebN+FdgPpMDgWsTPTR+SUL+3Ka0DjndM9r0MqrGRqq1oGPEotXQCT6iAzKvcb8Urv2J2nM3SyjpncNDrFbW2K/X5L7hgN7EOJ3jC2QAY7GQhxLtOYU3nKPg0n9I9lJicFwsjayagmjIDdLAHPMCgYA4FYz2uYegSh/n7Pnld6As3uoGdGoH6/ixEF98BI+6rWijGgwXgUKuZTKBI+q0fbDuTc/sKSS0ZxuZJK3fYqGB4+NATemC+DI5fZPG62U6L8DiwkFPm7rExjXi+yV9nKpg/Fx2YAnLyK/ezCVip/yU/LcsXJkFBWrMS6hDGS0C8QKBgFRPUpR833FHjaCDWJ71G0ewFSPkO0Hm83e5VLQeG4BNIcU+kr+d6jl9gPkNx+KRo8hyAYiy8MFF/owSRQRJY7qQnngJMAJ4sDrtHA9+Z1q+9X6DPuM4NWN9NjvvkgKcHNt4Loe1sFn31piCKtqdlm16AQBI2cjCrILRnY/iqjN4
-----END PRIVATE KEY-----`;

const cancelData = {
    PlatformID: "10533993",
    MerchantID: "10533993",
    OMerchantTradeNo: originalMerchantTradeNo,
};

const encDataString = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);
const signature = signData(encDataString, Client_Private_Key);
const XiCP_Signature = forge.util.encode64(signature);

const requestBody = JSON.stringify({ EncData: encDataString });

// --- 3. 發送 API 請求 ---
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CancelICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '185618',
        'X-iCP-Signature': XiCP_Signature,
        'Content-Type': 'application/json',
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
                console.log("解密後的結果:", JSON.parse(decryptedResponse));
            }
            console.log("RtnCode (回傳代碼):", responseJSON.RtnCode);
            if (responseJSON.RtnCode === 1) {
                console.log("✅ 取消交易成功！");
            } else {
                console.log("❌ 取消交易失敗，請檢查 RtnCode。");
            }
        } catch (error) {
            console.error("解析回應失敗:", responseData);
        }
    });
});

req.on('error', (e) => { console.error('請求錯誤:', e); });
req.write(requestBody);
req.end();