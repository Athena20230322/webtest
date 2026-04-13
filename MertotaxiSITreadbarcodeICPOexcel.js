const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const xlsx = require('xlsx'); // 引用 xlsx 套件

// --- 配置區 ---
const EXCEL_PATH = 'C:\\webtest\\TradeDetail.xlsx';
const AES_Key = "8mFv0s9guiCeaw6KVevCzfIpMXjXpuR5";
const AES_IV = "EFq5p4WEXugFxxwR";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAy8cGoVwaBNx4FgTlJ0dR9/bAXPm2gG/0GCk3a7c8WAprQgJV7ZPXqek9KmF7eq1X3cPs+MP/ypsy0pBO76MSEYtRBGnjFsvps62NVzEXqvpg6EzIBG7iFCMVOcHSCVr9r6wanzkXVr4t9D+nCBiGmC/UGMlwPbu+LlAaSeHmB+1l/k3+4row7RY0HvJlM2UpkkEd0eArecvknXecVH7yDmJwUbexfJjyp2U8HLBOrok3q5VYtE9eqZzvaoGmYImD5c5BTkztaQyuiobbyYWxqATweYVUYYRrAI+PJUtGONMUZfKnwTwHPfIRMQFXjAjWnRYtmb5JjzAB+ERfRQb4SQIDAQABAoIBAAE/WkNwN7PCUPUUwDDGkP8YAml1sq/qmSK+VEAgKQoCiYTBh7RV0vYpUirv2dYQa/9H818HSon7YgsQv+SO3QENsOGtoqqn3B0x3/5upuej2YzSgeiOo54RioNSzaEp1QlXeZPYwTnSUQaAjtppbzmAFKfqMJO2kh16d0Hu7heSUhOdDuRS4q0WH90Coqt0RO1gc9AjJR/Y2Y6lkEbz6+WkA6ZODIZx+Jpb/QToGuclh0LoSxRCA6znSOJQ4DcfF155qLBzW/Q5bAtoedXelnW8RFM0OIFI8+kkvWWIhXpkW2JC4NcpMJN/tnB3AqGKo3Noy+iUK2nXHBP7TYnXjgECgYEA746RJYSaxXV8H8VLF4kA8u4Lmbt20CiL73mXu9n36xkPDE56WGbK0UmD8H58V47EH/nGL7uAYX6U1Mj/t4Tvl85AmxEwdAvlv11IL2aG32bq+HXskUW8NGdY2V92c42fEB6LSRHWBJ544qrXgAsXSIj6bEea2zPieRfRzubHqKECgYEA2cPAWukcvWpUThMlVoqnWhbzKVu8A2TrWDyuyvb0faqZRGpKmdrI3gd9ITA+zoJFNxDJCwNXU54KSA/sBtoAd/tVApBJZHH4Dgp0wVnKzG7VyF4cphJt3PMmy83LwT2OxJYam2fp4QDJ4A3J8KzMrbJzewUCABbSTwIF4pa45qkCgYBC3cOL+mCNH0b/Qz27mwVFycY5Kgd3AOpWdNUynRvDZqI5qCokRMT1+BQ468VfVz1NQ5XbOvYRwJhgcJ5YJmYONIb6AalJqwx9BtegS3j4IK0Tny7iOdnXssUtH6VbibtNb4knYzAe5/EMK+2tEutz1rA3yyDhcLEVZd2tZ+NxIQKBgQCjufPT5lS/bUR5dxepm5H7wCmOvPP9MVFpBCb/XvGv0iZuM+RnDQHdPZAs9dMi/PsBTdN6PkbYDYj5aU8yT5Huo77ksIsdxDqWg/IItXQuhF6jyW6Mxmpnp0FSFibN4XSIBbt3gIdtrmQZ2wQruiAhsHv20GsSmhYBZSn7lQrsEQKBgQDO6bPEWj63/9D3ZEdPSSad0D3K3wjw0wj+gYSSUNXlgJmROfLLGzc2lKiA3EzcI6HikpeULsTiVwHqbOX4PjTzUVHK8LRWt6Y7UzvzVST98sp1wzNcep5ZUvETSx6maPFuJAM2t3c/0w93KIgC8eZxKPb/TO59Nd3GoWvOhIBRQw==
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
            PlatformID: "10513284",
            MerchantID: "10513284",
            MerchantTradeNo: MerchantTradeNo,
        };

        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);

        const options = {
            hostname: 'icp-payment-stage.icashpay.com.tw',
            path: '/api/V2/Payment/Cashier/QueryTradeICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '179749',
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

        console.log(`找到 ${tradeNos.length} 筆單號，開始查詢...`);

        let finalOutput = "";

        for (const no of tradeNos) {
            try {
                console.log(`正在查詢: ${no}`);
                const result = await requestTransaction(no);

                const logEntry = `OMerchantTradeNo: ${result.MerchantTradeNo}\nTransactionID: ${result.TransactionID}\nMerchantTradeNo: ${result.MerchantTradeNo}\n--------------------\n`;
                finalOutput += logEntry;
                console.log(`[成功] ${no}`);
            } catch (error) {
                console.error(`[失敗] ${no}:`, error);
                finalOutput += `單號 ${no} 查詢失敗: ${error}\n--------------------\n`;
            }
        }

        fs.writeFileSync('TransactionDetails.txt', finalOutput);
        console.log("\n所有處理完成，結果已存入 TransactionDetails.txt");

    } catch (err) {
        console.error("讀取 Excel 發生錯誤:", err.message);
    }
}

startProcess();