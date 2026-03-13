const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');

// --- 功能函式定義 ---

// AES 加密 (CBC 模式, PKCS7 Padding)
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

// RSA 簽名 (SHA256 with RSA)
function signData(data, privateKeyPem) {
    const rsa = forge.pki.privateKeyFromPem(privateKeyPem);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signature = rsa.sign(md);
    return forge.util.encode64(signature);
}

// --- 1. 讀取檔案取得原交易序號 ---
const filePath = 'C:\\webtest\\TransactionDetails.txt';
let originalMerchantTradeNo = "";

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const match = fileContent.match(/MerchantTradeNo:\s*(\S+)/);
    if (match && match[1]) {
        originalMerchantTradeNo = match[1].trim();
        console.log(`[系統] 讀取原交易序號: ${originalMerchantTradeNo}`);
    } else {
        throw new Error("檔案中找不到 MerchantTradeNo 欄位");
    }
} catch (err) {
    console.error(`[錯誤] 讀取檔案失敗: ${err.message}`);
    process.exit(1);
}

// --- 2. 設定參數與加密處理 ---
const AES_Key = "gUBgxSJ3bvKp2dtgrA40XxrpslvCNABN";
const AES_IV = "BLZZ5mACZJ9atujc";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0VqkL3pZj5n2x4gaLLBLdBe6y6g1n0SypfX5a/qFWcQCiKYBZmBACa/3htcRePN2vlnLickCbplM4Aq0kbEOfYmMHKeWa14QoMuTyLfWfOeHwKCFMed0HOVm6nqE+bIhstSVPBx6Jyarlf6FueURxfJ1kWnnG07kApn1kCqb92BM0PHtSYQA3UFfa8CuQACqPQIDVkOOdlxzJP2ayJmyr8SIu0YS4QtGxyw2giockt2GOpragg+7urcYS7SQ8bHQvo+Sa3iUMkdeO3+wAd8ZLy27C3kRBUHR04etgEoKbQwP0SMrKqHrQ6vqEMFV+n0h2985H76VWGJiPKH0ug51mwIDAQABAoIBAE5XKNFLa3A9IQeRepn2boXGy3OiQk6TGnbYELnDSVtJ6djQpf11TwFRA8NFf5hPIsQgPfYVbf+NBiNgXimWo+F+MxwV6kfLL1W8WFTn1i9vRHFkn/MItX6KqXRc3J3DdrDAtAeGcH9uDQ9X6xqhCYGVNUFw67ZgUxpWGnoUN8DdbvSO3c196jeVSsFvYue6SHLA+/HWe2WryzFBa+cHJR+/aXSgWs/q5VheeXCrc/kg/r+NGKf+RVTJohz8HRNiLNPYJItXqWt7sQS5FUkdXM5iDJFi7Fh78TmI9OjpcbeavyKgZ4a77ddVVZJbqA3MESeIdSDYJ499bkxwiBWpTGECgYEA3ascRFsCQ7GWXK3hNgB2hwRibIEGVJ0E4J3koNAl3hTe7GaWLWfSpFDSpvvlMAa+d89tEV6PKSpzh/KBf7BAvh2ZjaXCsE2jVyfPPHMq5S2DDk4snb2oP42d/H2FPaT+Ch+HQLjPfHFDQMKdbonB8am5WQu25vQYDfX7W/7WCWcCgYEA8cdIQLUYumYsAmESKCEr2lkNVb/LI2zJmKeeScJ5Ibz2olfXcbnMZHa6PxJOZUv5uobyky4JI6wKtHsfgSoRE2apL3OI1B5gVmg4oqJXx3zlz5GrgiaRlA2atQqiyK2z2DVPJcmYw2IuEdI9hDcbpz5dhyBgR/htQm1T/+1FLa0CgYB84R4eoErpSg3UjpzW6HHd5KlySUoAtyj9RdZ8hmce8xEXiz/Furzflyzlp/lZEiORqcjfRS9P2LuXdhZgkjIXKOPN+flxi3ue6S2F97fNvtMbZw0ZnLRBgY3kpe4/aUk4+MQgwT0a9VAXFszMbk1V0PE7ai8Tc6ZtjwuZqzp3twKBgQDSuQxZET1nICuVO0NW5GpTGLBNnyaOTn955AVKZgurAwW2QncMsJHasbvrwqm/EbOrBXigHExs4cJGwNSZf694SE6Gg9yqe3sddCKAZJu6yzmEaoKfobvZ3O2MgqOT4gjQFM5Rsd3J1GUwtRtWg60/W1Sqs+YWdAfOEHlYolRb1QKBgH6uIqn7ZLqoTtqK+kYqlCF7g8BXT13/owh97rBqj5Irn9LLNVr3R6HH6EXm3PfiTlU+Z6tiMP9czmfM6083G3dATAKi83M3MZC96TH+yW+NAwlMGI14BwZGb4XEja/NRB/Ux8CRLdsRZFHDrE3UTiRr5c5erCvJ2ysRieIGaD5T
-----END PRIVATE KEY-----`;

// 準備加密前的資料內容
const cancelData = {
    PlatformID: "10511339",
    MerchantID: "10511339",
    OMerchantTradeNo: originalMerchantTradeNo,
};

// 執行 AES 加密
const encDataString = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);

// 對加密後的字串進行簽章
const XiCP_Signature = signData(encDataString, Client_Private_Key);

// 封裝成 Body (JSON 格式)
const requestBody = JSON.stringify({ EncData: encDataString });

// --- 3. 發送 API 請求 ---
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CancelICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '126259',
        'X-iCP-Signature': XiCP_Signature,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
    },
};

console.log('[傳送] 正在請求取消交易...');

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('\n--- 伺服器回應 ---');
        try {
            const responseJSON = JSON.parse(responseData);
            console.log("RtnCode (回傳代碼):", responseJSON.RtnCode);

            // 若 RtnCode 為 1 代表成功，並嘗試解密資料
            if (responseJSON.RtnCode === 1 && responseJSON.EncData) {
                const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                console.log("✅ 取消成功！解密結果:", JSON.parse(decryptedResponse));
            } else {
                console.log(`❌ 取消交易失敗。錯誤代碼: ${responseJSON.RtnCode}`);
                // 1011 通常是簽章或加密內容格式有誤
            }
        } catch (error) {
            console.error("解析回應 JSON 失敗，原始回應:", responseData);
        }
    });
});

req.on('error', (e) => {
    console.error('[請求錯誤]:', e.message);
});

req.write(requestBody);
req.end();