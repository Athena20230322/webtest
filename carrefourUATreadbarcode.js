const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// 動態生成當前時間的函式
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

// AES 加密與解密函式
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
    return rsa.sign(md);
}

// --- 主要執行邏輯 ---

const barcodeFilePath = 'C:\\icppython\\barcode.txt';

try {
    // 1. 讀取條碼檔案
    if (!fs.existsSync(barcodeFilePath)) {
        console.error(`錯誤：找不到檔案 ${barcodeFilePath}`);
        process.exit(1);
    }

    const inputBarCode = fs.readFileSync(barcodeFilePath, 'utf8').trim();
    if (!inputBarCode) {
        console.error("錯誤：barcode.txt 檔案內容為空");
        process.exit(1);
    }

    console.log(`成功讀取條碼: ${inputBarCode}`);

    const { tradeNo, tradeDate } = getCurrentTime();

    // 2. 準備店家交易數據
    const data = {
        PlatformID: "10533993",
        MerchantID: "10533993",
        MerchantTradeNo: tradeNo,
        StoreID: "QATM01",
        StoreName: "家樂褔購物",
        MerchantTradeDate: tradeDate,
        TotalAmount: "1000",
        ItemAmt: "1000",
        UtilityAmt: "0",
        CommAmt: "0",
        ItemNonRedeemAmt: "0",
        UtilityNonRedeemAmt: "0",
        CommNonRedeemAmt: "0",
        NonPointAmt: "0",
        Item: [
            { ItemNo: "001", ItemName: "測試商品1", Quantity: "1" },
            { ItemNo: "002", ItemName: "測試商品2", Quantity: "1" },
        ],
        BarCode: inputBarCode,
    };

    const AES_Key = "G7bHiz7r58YSEqUutEtkieEoGDQvbMij";
    const AES_IV = "HyM09jTPru0fU9Zt";
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEowIBAAKCAQEA3Ype91XFXtRzfRczGoagYyFwoWFELVzqg5NhuQ/Ql361azHG41xYOZ7Nhszi289GFxCG9KjyQVPIkkG2nKiyufr4x8iGx2ILY/0OrDFzz4jI/VLtOzbU4V3LbLVllcLwIATZCrPkfjHkOcIiYUZT/TQU1m6xdoHgXkwMvzc3pO5ReNf09UBrsU2G5/TTpesEQoVFNzUhmCbx+AuJV5w+8H7scocUEn09IR2chwtbg5rqLrrkBXACFNomQ8BcHQwbquOBY/cXSuPjI+mMiXSp48nV2jBTI6OmdlxyF3U06FSU11SRsSVfvxxaw8azPij2yCY+yXb3Izbix+YF7GKdPwIDAQABAoIBAFBCRVZIifjpca9zPK3S8P8IydOFN9xRSZqCRch0HMcNfe8IOPv8Y+/4ApBf4J3ucP+BGss++4jEMCkgSmZlzV4IOKG0GXPZJrRCJNMoFUMt1FbF+LDXk/bTcpN/Af7oAPMwnmq8sj4vl/V+ydLA1kOoXxYyQvNiaOTwmzuY5v1GNoCJlmVsrSn9IJ9jEEK3z1dzGQbg1aQ7aYrH6MzVGQK2mI/n+j443tmV7ezui/iG0zMNBSsjPXpMOeDTGYgD+F4kAkXqZf5W2bzT2qDzU+8iBdFTFkltCAK9QKMCkl6hIwU7rppEPeAJ9R7JNkfjWzZfEEn42uOtm13KfZW/hpkCgYEA/Gdx7lWyQVsNK+yb2Cn/fd8UMm4ghfMBKpEAmfSVyxnXNhi6NOHjplbd4ini3SzZJ1e+DHCXPVzOq6u0iQgL7X+Xmb/fwV6BAV2I+coyrEMmjlbyqkOaAX7RjIcMxCcbX2gJfBe0Llt+g8C0eIKttqGC87CanhUGOMtCf7lgBacCgYEA4LJcpr22eWhTKfyV5qvMXQIkdEj/mS49PQUMPomW4kB3cpFHy2AHwcY8IcdoZAo513qCrPqJPfBpq+71I9iTjgdHhdME/Y3WZdiVDoqY5HC6FaVbdJuIsYwLiXP5ADCzv6DPHxah4Q1cC1SrILrI1Xvq+8VdtIsXyINHkBhKTqkCgYEAn7vLk1xycf/wZwLXYca6ZOs/eebN+FdgPpMDgWsTPTR+SUL+3Ka0DjndM9r0MqrGRqq1oGPEotXQCT6iAzKvcb8Urv2J2nM3SyjpncNDrFbW2K/X5L7hgN7EOJ3jC2QAY7GQhxLtOYU3nKPg0n9I9lJicFwsjayagmjIDdLAHPMCgYA4FYz2uYegSh/n7Pnld6As3uoGdGoH6/ixEF98BI+6rWijGgwXgUKuZTKBI+q0fbDuTc/sKSS0ZxuZJK3fYqGB4+NATemC+DI5fZPG62U6L8DiwkFPm7rExjXi+yV9nKpg/Fx2YAnLyK/ezCVip/yU/LcsXJkFBWrMS6hDGS0C8QKBgFRPUpR833FHjaCDWJ71G0ewFSPkO0Hm83e5VLQeG4BNIcU+kr+d6jl9gPkNx+KRo8hyAYiy8MFF/owSRQRJY7qQnngJMAJ4sDrtHA9+Z1q+9X6DPuM4NWN9NjvvkgKcHNt4Loe1sFn31piCKtqdlm16AQBI2cjCrILRnY/iqjN4
    -----END PRIVATE KEY-----`;

    // 3. 加密與簽名
    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    console.log("加密後的資料 (EncData):", encdata);

    // 4. 設定請求選項
    const options = {
        hostname: 'icp-payment-preprod.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/DeductICPOF',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '185618',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    // 5. 發送請求
    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            try {
                // 解析原始 JSON
                const responseJSON = JSON.parse(responseData);

                // --- 重點：先印出完整的回應訊息，這樣你就看得到 RtnMsg ---
                console.log('API 原始回應:', responseJSON);

                if (responseJSON.EncData) {
                    // 解密 EncData
                    const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                    const parsedResponse = JSON.parse(decryptedResponse);

                    console.log("解密後的詳細資料:", parsedResponse);

                    // 檢查是否成功 (RtnCode 1 通常代表成功，具體依 API 文檔為準)
                    if (responseJSON.RtnCode === 1) {
                        const { TransactionID, MerchantTradeNo } = parsedResponse;
                        const output = `TransactionID: ${TransactionID}\nMerchantTradeNo: ${MerchantTradeNo}`;
                        fs.writeFileSync('TransactionDetails.txt', output);
                        console.log("成功！交易資料已儲存至 TransactionDetails.txt");
                    } else {
                        console.warn(`交易未成功：[${responseJSON.RtnCode}] ${responseJSON.RtnMsg}`);
                        // 即使失敗，仍將解密後的時間戳記等資訊存檔參考
                        fs.writeFileSync('TransactionDetails.txt', `Error: ${responseJSON.RtnMsg}\nData: ${decryptedResponse}`);
                    }
                } else {
                    console.error('錯誤：回傳結果中沒有加密資料 (EncData)', responseJSON);
                }
            } catch (error) {
                console.error("解析或解密過程失敗:", error.message);
                console.error("原始回應內容:", responseData);
            }
        });
    });

    req.on('error', (e) => { console.error('網路請求發生錯誤:', e.message); });

    // 寫入 Body 資料並結束請求
    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();

} catch (err) {
    console.error("執行過程中發生系統錯誤:", err.message);
}