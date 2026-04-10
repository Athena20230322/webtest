const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const xlsx = require('xlsx'); // 引用 xlsx 套件

// --- 配置區 ---
const EXCEL_PATH = 'C:\\webtest\\TradeDetail.xlsx';
const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
const AES_IV = "cXeUoyqAkgq56aEq";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
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
            PlatformID: "10500855",
            MerchantID: "10500855",
            MerchantTradeNo: MerchantTradeNo,
        };

        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);

        const options = {
            hostname: 'icp-payment-preprod.icashpay.com.tw',
            path: '/api/V2/Payment/Cashier/QueryTradeICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '217216',
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