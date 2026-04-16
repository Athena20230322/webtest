const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const xlsx = require('xlsx');

// --- 配置區 (已同步第一段程式碼的設定) ---
const EXCEL_PATH = 'C:\\webtest\\TradeDetail.xlsx';
const AES_Key = "G7bHiz7r58YSEqUutEtkieEoGDQvbMij"; // 同第一段
const AES_IV = "HyM09jTPru0fU9Zt";                   // 同第一段
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA3Ype91XFXtRzfRczGoagYyFwoWFELVzqg5NhuQ/Ql361azHG41xYOZ7Nhszi289GFxCG9KjyQVPIkkG2nKiyufr4x8iGx2ILY/0OrDFzz4jI/VLtOzbU4V3LbLVllcLwIATZCrPkfjHkOcIiYUZT/TQU1m6xdoHgXkwMvzc3pO5ReNf09UBrsU2G5/TTpesEQoVFNzUhmCbx+AuJV5w+8H7scocUEn09IR2chwtbg5rqLrrkBXACFNomQ8BcHQwbquOBY/cXSuPjI+mMiXSp48nV2jBTI6OmdlxyF3U06FSU11SRsSVfvxxaw8azPij2yCY+yXb3Izbix+YF7GKdPwIDAQABAoIBAFBCRVZIifjpca9zPK3S8P8IydOFN9xRSZqCRch0HMcNfe8IOPv8Y+/4ApBf4J3ucP+BGss++4jEMCkgSmZlzV4IOKG0GXPZJrRCJNMoFUMt1FbF+LDXk/bTcpN/Af7oAPMwnmq8sj4vl/V+ydLA1kOoXxYyQvNiaOTwmzuY5v1GNoCJlmVsrSn9IJ9jEEK3z1dzGQbg1aQ7aYrH6MzVGQK2mI/n+j443tmV7ezui/iG0zMNBSsjPXpMOeDTGYgD+F4kAkXqZf5W2bzT2qDzU+8iBdFTFkltCAK9QKMCkl6hIwU7rppEPeAJ9R7JNkfjWzZfEEn42uOtm13KfZW/hpkCgYEA/Gdx7lWyQVsNK+yb2Cn/fd8UMm4ghfMBKpEAmfSVyxnXNhi6NOHjplbd4ini3SzZJ1e+DHCXPVzOq6u0iQgL7X+Xmb/fwV6BAV2I+coyrEMmjlbyqkOaAX7RjIcMxCcbX2gJfBe0Llt+g8C0eIKttqGC87CanhUGOMtCf7lgBacCgYEA4LJcpr22eWhTKfyV5qvMXQIkdEj/mS49PQUMPomW4kB3cpFHy2AHwcY8IcdoZAo513qCrPqJPfBpq+71I9iTjgdHhdME/Y3WZdiVDoqY5HC6FaVbdJuIsYwLiXP5ADCzv6DPHxah4Q1cC1SrILrI1Xvq+8VdtIsXyINHkBhKTqkCgYEAn7vLk1xycf/wZwLXYca6ZOs/eebN+FdgPpMDgWsTPTR+SUL+3Ka0DjndM9r0MqrGRqq1oGPEotXQCT6iAzKvcb8Urv2J2nM3SyjpncNDrFbW2K/X5L7hgN7EOJ3jC2QAY7GQhxLtOYU3nKPg0n9I9lJicFwsjayagmjIDdLAHPMCgYA4FYz2uYegSh/n7Pnld6As3uoGdGoH6/ixEF98BI+6rWijGgwXgUKuZTKBI+q0fbDuTc/sKSS0ZxuZJK3fYqGB4+NATemC+DI5fZPG62U6L8DiwkFPm7rExjXi+yV9nKpg/Fx2YAnLyK/ezCVip/yU/LcsXJkFBWrMS6hDGS0C8QKBgFRPUpR833FHjaCDWJ71G0ewFSPkO0Hm83e5VLQeG4BNIcU+kr+d6jl9gPkNx+KRo8hyAYiy8MFF/owSRQRJY7qQnngJMAJ4sDrtHA9+Z1q+9X6DPuM4NWN9NjvvkgKcHNt4Loe1sFn31piCKtqdlm16AQBI2cjCrILRnY/iqjN4
-----END PRIVATE KEY-----`;

// --- 工具函式 ---
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

// 封裝 Request 為 Promise
function requestTransaction(MerchantTradeNo) {
    return new Promise((resolve, reject) => {
        const data = {
            PlatformID: "10533993",    // 同第一段
            MerchantID: "10533993",    // 同第一段
            MerchantTradeNo: MerchantTradeNo,
        };

        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);

        const options = {
            hostname: 'icp-payment-preprod.icashpay.com.tw', // 同第一段
            path: '/api/V2/Payment/Cashier/QueryTradeICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '185618',              // 同第一段
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
                    // 檢查回傳是否有 EncData
                    if (!responseJson.EncData) {
                        return reject(`API 回傳錯誤: ${responseData}`);
                    }
                    const decryptedResponseData = decryptAES_CBC_256(responseJson.EncData, AES_Key, AES_IV);
                    resolve(JSON.parse(decryptedResponseData));
                } catch (err) {
                    reject(`解析錯誤 (${MerchantTradeNo}): ` + err.message);
                }
            });
        });

        req.on('error', (e) => reject(`網路錯誤 (${MerchantTradeNo}): ` + e.message));
        req.write(`EncData=${encodeURIComponent(encdata)}`);
        req.end();
    });
}

// --- 主程式 ---
async function startProcess() {
    try {
        console.log(`讀取檔案: ${EXCEL_PATH}`);
        if (!fs.existsSync(EXCEL_PATH)) {
            console.error("找不到 Excel 檔案，請檢查路徑。");
            return;
        }

        const workbook = xlsx.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 讀取 O 欄，從第 6 列開始 (Excel 的 O6 對應位址為 {c:14, r:5})
        const tradeNos = [];
        const range = xlsx.utils.decode_range(worksheet['!ref']);

        for (let rowNum = 5; rowNum <= range.e.r; rowNum++) {
            const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: 14 }); // 14 是 O 欄
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
                tradeNos.push(cell.v.toString().trim());
            }
        }

        if (tradeNos.length === 0) {
            console.log("未在 O6 欄位找到任何單號。");
            return;
        }

        console.log(`找到 ${tradeNos.length} 筆單號，開始批次查詢...`);

        let finalOutput = "";

        for (const no of tradeNos) {
            try {
                process.stdout.write(`正在查詢: ${no} ... `);
                const result = await requestTransaction(no);

                const logEntry = `OMerchantTradeNo: ${result.MerchantTradeNo}\nTransactionID: ${result.TransactionID}\nMerchantTradeNo: ${result.MerchantTradeNo}\n--------------------\n`;
                finalOutput += logEntry;
                console.log(`[成功]`);
            } catch (error) {
                console.log(`[失敗]`);
                console.error(`  詳情:`, error);
                finalOutput += `單號 ${no} 查詢失敗: ${error}\n--------------------\n`;
            }
        }

        fs.writeFileSync('TransactionDetails.txt', finalOutput);
        console.log("\n所有處理完成，結果已存入 TransactionDetails.txt");

    } catch (err) {
        console.error("處理過程中發生錯誤:", err.message);
    }
}

startProcess();