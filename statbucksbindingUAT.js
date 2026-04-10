const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const QRCode = require('qrcode');

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

// 取得當前時間
const { tradeNo, tradeDate } = getCurrentTime();

// 模擬店家數據
const data = {
    PlatformID: "10500855",
    MerchantID: "10500855",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"綁定星巴克",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0",
    MaxMonthAmt: "3000",
};

// AES 密鑰與 IV
const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
const AES_IV = "cXeUoyqAkgq56aEq";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
-----END PRIVATE KEY-----`;

// AES 加密
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// AES 解密
function decryptAES_CBC_256(encryptedData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 加密與簽名
const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
const signature = signData(encdata, Client_Private_Key);
const X_iCP_Signature = forge.util.encode64(signature);

console.log("Encrypted Data (EncData):", encdata);
console.log("X-iCP-Signature:", X_iCP_Signature);

// 發送 HTTP 請求
const options = {
    hostname: 'icp-payment-preprod.icashpay.com.tw',
    path: '/api/V2/Payment/Binding/CreateICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '217216',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
        response += chunk;
    });
    res.on('end', async () => {
        console.log('Response:', response);

        // 假設回應包含加密的 EncData
        const responseData = JSON.parse(response);
        if (responseData.EncData) {
            const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
            console.log('Decrypted Response Data:', decryptedData);

            // 解析回應並提取 ApproveBindingToken
            const parsedData = JSON.parse(decryptedData);
            const approveBindingToken = parsedData.ApproveBindingToken;

           if (approveBindingToken) {
    console.log('ApproveBindingToken:', approveBindingToken);

    // 確保生成 QR Code
    try {
        // 輸出至終端
        const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
        console.log('QR Code for ApproveBindingToken:\n', qrCode);

        // 儲存為圖片檔案
        await QRCode.toFile('statbucks.png', approveBindingToken, {
            width: 300,
            margin: 2,
        });
        console.log('QR Code saved as statbucks.png');
    } catch (err) {
        console.error('Error generating QR Code:', err);
    }
} else {
    console.error('ApproveBindingToken not found in response data.');
}

        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

// 在此將加密過的資料作為請求的 body 發送
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();