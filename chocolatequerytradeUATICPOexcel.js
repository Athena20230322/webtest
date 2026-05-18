const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const xlsx = require('xlsx');

// --- 配置區 (已同步第一段程式碼的設定) ---
const EXCEL_PATH = 'C:\\webtest\\TradeDetail.xlsx';
const AES_Key = "I2D3XLzMJAdbGcbyyzQFh3sVohrlnaqD"; // 同第一段
const AES_IV = "l2zJKgkxKIze3cGn";                   // 同第一段
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA1ZpebC+xA+86iajzTiFm9KBvkCRJ9QnXjJhzDQdrLzys2mCINWB8LJbBU9yMoEoC6e0iIvuUVKXCDo+6YhjTlpZIfAcUqFDYbdijTk4LYUZEMPTEypBtbSkKICTGjpPhIdO+xEzwBvR8Rc8ioEFou1J1V0465vjljHxalCoR85XYLxX+IAgKIz8e9IEUP8m21fpvV50h1XAEn5LY6rF2PylCXsAx8Jt2fS5zp1u66FV6Ev3kntQ4RFxrpXHV1I8eAjyMi4TVT4hSD2DG3bEN4UPec7vjPwEg9u1RYY5cbNhwQwBmd4jKaNdqNrjRKEqOTTsdiBLKN1fAjsaXq+/thwIDAQABAoIBAEhe24QDKpH/MVGnzPuZRJU4cGQhb29WzNGla0GsVEv2XkhE8ZFIJfpDf7AGpxy9xrv0LJ82ptyBJr0hRFBtQe8g7uEa0wxuC8432qiyt5dXI86Ed9J72Z9lCrm2TBHNl7cK03UV7jMlDZ/nXL94OeBRwVD5v+o2xStyjIvrrxZcfRlEvVNTOj9pE3p2tANH/ZrvIDMsIIfztdffjb2KummB8zcjDfqFudBeg48U1owZMqLprbNktQmG3wodEvdhwWPTYvVhRRUJ3t7OM26/6giYVPdWLDT6TTiVmyIsoZZwlPsIrqZX0gI8uIwMYY6ltRL5nuvXzqWY3BhBm4pktkECgYEA/foLDbzMP44nQnOdJnn5K3F0smR0wiK27HIeeAy5a6zsDmcTVmVUZGW1gB2MiOjAcCprzo1ZaBqfohei6XFLsOlGkOWcY+wu78nuqPzPLmUB6Xf5zUmaGYdM2qq3PmfbgR7cBFAH1mcBzi5afq0ZaxBu5hqWG/ix1bIAyGqUEkcCgYEA10387hHL5lB0yDwU/1CHMPnPsMh5DYLonsHC90C2CAsrnk/QE/Scm48XAAdzL2HI+CESVHOxNuWhOdwozdd2rRJzD1kwqYgdxfHkk2haJGyRZe7ZgEX5YNuYDPiSKfUHmAODO2MZNZuM7pQgTLdfDNQR7dHo0Z+HIdxvnqL9qsECgYAgMjZ8g1aRKAAqGGXvnr7LlxJoGvwCMExoJP9f0J0g3Ub/fGmjJi1QnOQpXZWXNYpPrdEE2j5fSCC8d6qbVVV3E9tyOulccXBxzXOH0KSjCQL5CdCNCauTWOeRQNsB+kCFWdgiY9Lahyxfatjl/iOewvKMEQq+eQRyRqJ6xagHuQKBgQDT41OFNAx3uDyGBuMfNTAnGeK090Zy7p9iBgyK6qt6lQuzPJbp3LT3PsYC6FIKknCHCX0Rkd4Yybp2x918XozT3TFRLJSAc43hjaJHE86KxDH/oCV7YOIA2Xv1X/fwxM1ZZDOVkXxwzonPDgYPmfM4G8kdRJSdICOMRnWvKHb+wQKBgD/4zeQJxjP2OSBH4n44NNZ0P4TX+Q2hc915pn6BbBf2xJlZsZwa1oehan1fJeXgnpee0Q5ZQlu2H0QvBhbVZHt0RRdwuzCQVH+qTrsvskqMSRx0YLbe7WmSt2R5RiTITD6NKG+UZDrHxKFu/VtpprSbpg/NL90O27qGiXzXqRK+
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
            PlatformID: "10523750",    // 同第一段
            MerchantID: "10523750",    // 同第一段
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
                'X-iCP-EncKeyID': '172385',              // 同第一段
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