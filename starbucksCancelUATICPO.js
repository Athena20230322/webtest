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
const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
const AES_IV = "cXeUoyqAkgq56aEq";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
-----END PRIVATE KEY-----`;

const cancelData = {
    PlatformID: "10500855",
    MerchantID: "10500855",
    OMerchantTradeNo: originalMerchantTradeNo,
};

const encDataString = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);
const signature = signData(encDataString, Client_Private_Key);

// --- 3. 發送請求 ---
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Cashier/CancelICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '217216',
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