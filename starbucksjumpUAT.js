const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const axios = require('axios');
const fs = require('fs'); // 引入 fs 模組以進行檔案操作
const dotenv = require('dotenv'); // 引入 dotenv 模組
require('dotenv').config();
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
// 指定 .env 檔案的絕對路徑並載入環境變數
dotenv.config({ path: 'c:/webtest20250123/.env' });


if (!SLACK_WEBHOOK_URL) {
    console.error("錯誤：找不到 SLACK_WEBHOOK_URL 環境變數");
    process.exit(1);
    }
// 你的 Slack Webhook URL
//const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

// 取得當前時間
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

const { tradeNo, tradeDate } = getCurrentTime();

// 交易數據
const data = {
    PlatformID: "10500855",
    MerchantID: "10500855",
    MerchantTradeNo: tradeNo,
    StoreID: "QATM01",
    StoreName: "星巴克線上儲值支付",
    MerchantTradeDate: tradeDate,
    TotalAmount: "1000",
    ItemAmt: "1000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "2",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke",
    RedirectURL: "https://www.starbucks.com.tw/home/",
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

// 發送 Slack 訊息
async function sendToSlack(message) {
    try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
        console.log("✅ Sent to Slack successfully");
    } catch (error) {
        console.error("❌ Error sending to Slack:", error);
    }
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
    path: '/api/V2/Payment/Cashier/CreateTradeICPO',
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

        try {
            const responseData = JSON.parse(response);
            if (responseData.EncData) {
                const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                console.log('Decrypted Response Data:', decryptedData);

                const parsedData = JSON.parse(decryptedData);
                if (parsedData.TradeToken) {
                    console.log('Trade Token:', parsedData.TradeToken);

                    // 產生 ICP 支付 URL
                    const icpPaymentUrl = `https://icpbridge-test.icashsys.com.tw/ICP?Actions=Mainaction&Event=ICPO002&Value=${parsedData.TradeToken}&Valuetype=1`;
                    console.log('ICP Payment URL:', icpPaymentUrl);

                    // 傳送到 Slack
                    await sendToSlack(`🚀 **ICP Payment 星巴克儲值icashpay支付**\n${icpPaymentUrl}`);

                    // 在系統上開啟 URL
                    const command = process.platform === 'win32' ? 'start' :
                                    process.platform === 'darwin' ? 'open' : 'xdg-open';
                    require('child_process').exec(`${command} "${icpPaymentUrl}"`);
                }
            }
        } catch (e) {
            console.error('❌ Failed to process response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Error:', e);
});

// 發送請求
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();

// 取得 MerchantTradeNo 並儲存到 .txt 檔案
const merchantTradeNo = tradeNo; // 從 getCurrentTime 函式中取得
const fileName = 'kfcMerchantTradeNo.txt';
fs.writeFileSync(fileName, `MerchantTradeNo: ${merchantTradeNo}`);
console.log(`MerchantTradeNo 已儲存到 ${fileName}`);