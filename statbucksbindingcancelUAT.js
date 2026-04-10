const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// 動態生成當前時間的函式
function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `Sample${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

// 讀取檔案並解析內容
function getTransactionDetails(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const transactionDetails = {};

        fileContent.split('\n').forEach((line) => {
            const [key, value] = line.split(':').map(item => item.trim());
            if (key && value) {
                transactionDetails[key] = value;
            }
        });

        return transactionDetails;
    } catch (error) {
        console.error('Error reading transaction details file:', error);
        return null;
    }
}

// 讀取單值檔案
function readSingleValueFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8').trim();
        return content;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

// AES 解密
function decryptAES_CBC_256(encryptedData, key, iv) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return CryptoJS.enc.Utf8.stringify(decrypted);
    } catch (error) {
        console.error('Error decrypting response data:', error);
        return null;
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

// 發送 HTTP 請求並支援重試
function sendRequest(options, encodedEncData, retries = 3, delay = 2000) {
    return new Promise((resolve, reject) => {
        const attempt = () => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const responseData = JSON.parse(data);
                        resolve(responseData);
                    } catch (error) {
                        console.error('Error parsing response:', error);
                        reject(error);
                    }
                });
            });

            req.on('error', (e) => {
                console.error('Request error:', e);
                if (retries > 0) {
                    console.log(`Retrying... (${retries} attempts left)`);
                    setTimeout(() => {
                        retries--;
                        attempt();
                    }, delay);
                } else {
                    reject(e);
                }
            });

            req.write(encodedEncData);
            req.end();
        };

        attempt();
    });
}

// 取得當前時間
const { tradeNo, tradeDate } = getCurrentTime();

// 讀取交易細節
const transactionDetails = getTransactionDetails('C:/webtest/TransactionDetails.txt');
if (!transactionDetails) {
    console.error('Failed to retrieve transaction details. Exiting.');
    process.exit(1);
}

// 讀取 BindingTradeNo、ApproveBindingToken 和 BindingTradeID
const bindingTradeNo = readSingleValueFile('C:/webtest/BindingTradeNo.txt');
const approveBindingToken = readSingleValueFile('C:/webtest/ApproveBindingToken.txt');
const bindingTradeID = readSingleValueFile('C:/webtest/BindingTradeID.txt');

if (!bindingTradeNo || !approveBindingToken || !bindingTradeID) {
    console.error('Failed to retrieve BindingTradeNo, ApproveBindingToken, or BindingTradeID. Exiting.');
    process.exit(1);
}

// 模擬店家數據
const data = {
    PlatformID: "10500855",
    MerchantID: "10500855",
    BindingTradeNo: bindingTradeNo, // 載入 BindingTradeNo 的值
    Token: approveBindingToken,     // 載入 ApproveBindingToken 的值
    BindingTradeID: bindingTradeID, // 載入 BindingTradeID 的值
    UnBindingDate: tradeDate,      // 使用當前時間
    UnBindingBy: "1",
};

// AES 密鑰與 IV
const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
const AES_IV = "cXeUoyqAkgq56aEq";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
-----END PRIVATE KEY-----`;

// 加密與簽名
const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
const signature = signData(encdata, Client_Private_Key);
const X_iCP_Signature = forge.util.encode64(signature);

console.log("Encrypted Data (EncData):", encdata);
console.log("X-iCP-Signature:", X_iCP_Signature);

// 發送 HTTP 請求
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Binding/CancelICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '217216',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

// 主程式邏輯
async function main() {
    try {
        const responseData = await sendRequest(options, `EncData=${encodeURIComponent(encdata)}`);
        console.log('Response:', JSON.stringify(responseData, null, 2));

        // 檢查是否有 EncData 並解密
        if (responseData.EncData) {
            const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
            if (decryptedData) {
                console.log('Decrypted Response Data:', decryptedData);
                try {
                    const parsedDecryptedData = JSON.parse(decryptedData);
                    console.log('Parsed Decrypted Response Data:', JSON.stringify(parsedDecryptedData, null, 2));
                } catch (error) {
                    console.error('Error parsing decrypted response data:', error);
                }
            } else {
                console.error('Failed to decrypt response EncData.');
            }
        } else {
            console.log('No EncData in response.');
        }

        // 檢查是否為網路不穩定錯誤
        if (responseData.RtnCode === 1011) {
            console.warn('Network instability detected (RtnCode: 1011). Consider retrying later.');
        }
    } catch (error) {
        console.error('Failed to send request after retries:', error);
        process.exit(1);
    }
}

main();