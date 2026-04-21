const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// 配置資訊
const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
const AES_IV = "cXeUoyqAkgq56aEq";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
-----END PRIVATE KEY-----`;

// 動態生成當前時間
function getCurrentTime() {
    const now = new Date();
    return {
        tradeDate: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    };
}

// 解析多組交易資料
function getAllTransactions(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 以分隔線切割成多個區塊
        const blocks = fileContent.split(/^-+$/m);
        const transactionList = [];

        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            const details = {};
            lines.forEach(line => {
                const [key, value] = line.split(':').map(item => item.trim());
                if (key && value) details[key] = value;
            });
            // 確保該區塊包含必要欄位才加入
            if (details.OMerchantTradeNo && details.TransactionID) {
                transactionList.push(details);
            }
        });
        return transactionList;
    } catch (error) {
        console.error('讀取檔案失敗:', error);
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

// 封裝 HTTP 請求為 Promise 以支援 await
function sendRequest(encdata, signatureBase64, index) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'icp-payment-proprod.icashpay.com.tw',
            path: '/api/V2/Payment/Cashier/RefundICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '217216',
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

// 主程式：依序執行
async function runBatchProcess() {
    const transactionList = getAllTransactions('C:/webtest/TransactionDetails.txt');

    if (transactionList.length === 0) {
        console.error('沒有可處理的交易資料。');
        return;
    }

    console.log(`共偵測到 ${transactionList.length} 筆交易，開始處理...\n`);

    for (let i = 0; i < transactionList.length; i++) {
        const tx = transactionList[i];
        const { tradeDate } = getCurrentTime();

        const postData = {
            PlatformID: "10500855",
            MerchantID: "10500855",
            OMerchantTradeNo: tx.OMerchantTradeNo,
            TransactionID: tx.TransactionID,
            StoreID: "QATM01",
            StoreName: "星巴克線上儲值支付",
            MerchantTradeNo: tx.MerchantTradeNo,
            RefundTotalAmount: "1000",
            RefundItemAmt: "1000",
            RefundUtilityAmt: "0",
            RefundCommAmt: "0",
            MerchantTradeDate: tradeDate,
        };

        console.log(`正在處理第 ${i + 1} 筆: ${tx.OMerchantTradeNo}`);

        try {
            // 加密與簽名
            const encdata = encryptAES_CBC_256(JSON.stringify(postData), AES_Key, AES_IV);
            const signature = signData(encdata, Client_Private_Key);
            const X_iCP_Signature = forge.util.encode64(signature);

            // 發送請求並等待
            await sendRequest(encdata, X_iCP_Signature, i);
        } catch (error) {
            // 即使一筆失敗，也繼續處理下一筆
            console.error(`第 ${i + 1} 筆執行過程中發生例外`);
        }

        console.log('---');
    }

    console.log('所有批次處理完成。');
}

// 啟動
runBatchProcess();