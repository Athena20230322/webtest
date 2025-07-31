/*
 * 確保您已經安裝了所有必要的套件。
 * 請在您的專案目錄中，打開終端機並執行以下指令：
 * npm install crypto-js node-forge qrcode-terminal qrcode fs axios form-data
 */

const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// --- 常數設定 ---
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const IMGBB_API_KEY = '41af6e9423f282b09e91761a4bec3e06';
const AES_Key = "Nu52fAODFfP2xM2dGT4LLoS10ZldZzoh";
const AES_IV = "KJUYfTyo7Emy2sT9";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAzk25wl5iqDJARbX4QsaBFeWMDmwJJuof39DlmIOle+ghPNT5DFaZv/oo9h53W0+MT+bfvsLknzv/wJnKCajbBmi6A8yh5s0imEOLt6kZTruIVG3KM4d+K0r5HhIJ1CYXGiQh0s6KcY88w7oYlgCRvCGcxsTe8I93THZT5ZRXr8MRxZmVIdA6kifYFztA5JbVt5Gw56dHd+eSjXobXkdmimsn0RuQEhTwnpgrxI0dJM+kO4IqKfNItMiDv48kLCbIuhjw1HSFKSKMbOpf/r1j1ApCKS03TXpDXg2IpgTLLiYNYjTipMWS78qnrZywLeqTS8JnwMkdpVxjy8i+1W4RPwIDAQABAoIBAEO6gbcdfH8ijDY2oOvvNlbFdv8PGcwUReWZM58n7Q6qLStG8gJKdgxwKL1wUBgCnBppPeBnJF5geLy24HzeWhWXESaJKkfW5boeRsLDeaL+7ylkp+LV4yZ8ZR+ppV9oJ+J1pUMLeqkAcN8C++pXAoFEea9J17UbLHvGRxHSax0wsvXenm7yESKZ8euJHdDo7XQ8f+saqsDHN9sJ1Hw8PH+YWKMTc0KYyLkXH6NkPHJPcgziPX31opyuvQPSrOJ9RjERqiNYU6LMeORMdSbgQnR+v7HVuwuX8MDaEaAId8ykJ7UBP7qodSfHUO9e+0o4bYOgaoWHzonV6gQuKjnNR3kCgYEA4A2ekYUQnHcqn2+jzJSNVM69ApbluDV1uL63J1npWgTvKBnlPczVhg25G595L1l9YvrIRUawbad9Q537KIIAH6F9FfSl9b2vlXo0D0PYR0JRwDLlVXMwJZ40Ee6slkgsmeDOto+yOk/lk61XMXpEvDkKei5ov57C6cVmFJcsotcCgYEA67g2K1oou6i3SchaehCxbue/owK/ydeLPYr983yfMiDZfOA4D3v2RF4aSmMnPe3sUq4ZRew5nyVJ8f5f14Dirs2jglaQsdopkrNroTNuyLZUZfI9/v/6VVRNTQXigPOcS2NbLmXN0fMi6VxlU8IN3vkXE+cyOv0/eRV258IgH9kCgYAYvqhSngWVojuc3DGU+JsbULHjRVMdoxnbS4Ti3bU98emP3jxJNQQoB//3owc5SYLlmZjgvcvicGsPOrVwZdspoyYzdI+XsllgAt0ZCn8qb5KjzXsyksQwg2ZwzJFXD6WNYRyzYO9oLUbHpo9IsZ5Bw3L6x4FeGGSieOCrSX7uhQKBgDViAJKM1pC5Qtko0KS4Rxaw0UufgcO6VsRXR+/ulzcJDXgkZ03KaxlMnnOeRPLXgR+wYfTd7KbIERkG3Lm3bJ7d31vTMu20VJnunD9joIFAGZkE5Vlsq0rLzr3UyVke0pSYKbw2PgiAIbXrwN7ZIb8PdlSBlXSaiddoLweJhTDxAoGBAKgAyumIYzjryg6mHFemWVidfKMK9UjywGDz0UXxP3UBk3ME8aIw0ynqyjCK8ULspo3dmGA4ze32fKo97xTzUhtx9YkcvXQe8axtqkBLDROHvxUvnhyIZgexey6I+w023LbIbUUr2F/cB0YOP5kidjwrCpTqat0jcir4T26VetRN
-----END PRIVATE KEY-----`;

// --- 輔助函式 ---
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
    return CryptoJS.enc.Utf8.stringify(decrypted);
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

async function uploadToImgBB(imagePath) {
    try {
        const image = fs.readFileSync(imagePath);
        const base64Image = image.toString('base64');
        const form = new FormData();
        form.append('image', base64Image);
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, form, {
            headers: form.getHeaders(),
        });
        if (response.data.success) {
            console.log('ImgBB 上傳成功:', response.data.data.url);
            return response.data.data.url;
        } else {
            throw new Error('ImgBB 上傳失敗: ' + JSON.stringify(response.data));
        }
    } catch (error) {
        console.error('ImgBB 上傳時發生錯誤:', error.message);
        throw error;
    }
}

async function sendImageToSlack(imagePath) {
    try {
        const imageUrl = await uploadToImgBB(imagePath);
        const payload = {
            channel: 'C08CAL4L80M',
            username: 'QR Code Bot',
            text: 'CreateTradeICPO 產生的 QR Code:',
            blocks: [
                { type: 'section', text: { type: 'mrkdwn', text: 'CreateTradeICPO 產生的 QR Code:' } },
                { type: 'image', image_url: imageUrl, alt_text: '交易 QR Code' },
            ],
        };
        await axios.post(SLACK_WEBHOOK_URL, payload);
        console.log('圖片已成功發送到 Slack。');
    } catch (error) {
        console.error('發送圖片到 Slack 時發生錯誤:', error.message);
    }
}

// --- 主執行函式 ---
async function main() {
    // 使用 try...catch 包裹整個執行過程，以捕捉任何錯誤
    try {
        console.log("腳本開始執行...");

        // 步驟 1: 準備資料
        const { tradeNo, tradeDate } = getCurrentTime();
        const data = {
            PlatformID: "10000236",
            MerchantID: "10000236",
            MerchantTradeNo: tradeNo,
            StoreID: "Dev2-Test",
            StoreName: "Dev2-Test",
            TradeMode: "2",
            MerchantTradeDate: tradeDate,
            TotalAmount: "700",
            ItemAmt: "500",
            UtilityAmt: "200",
            ItemNonRedeemAmt: "100",
            UtilityNonRedeemAmt: "100",
            NonPointAmt: "0",
            CallbackURL: "https://www.google.com?CallbackURL",
            RedirectURL: "https://www.google.com?RedirectURL",
            AuthICPAccount: "",
            Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
        };
        console.log("步驟 1: 資料準備完畢。");

        // 步驟 2: 加密與簽名
        console.log("步驟 2: 正在加密與簽名...");
        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);
        console.log("加密與簽名完成。");
        console.log("Encrypted Data (EncData):", encdata);
        console.log("X-iCP-Signature:", X_iCP_Signature);

        // 步驟 3: 發送 HTTP 請求
        const options = {
            hostname: 'icp-payment-stage.icashpay.com.tw',
            path: '/api/V2/Payment/Cashier/CreateTradeICPO',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '289774',
                'X-iCP-Signature': X_iCP_Signature,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        console.log("\n步驟 3: 正在發送 API 請求...");
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', async () => {
                console.log('API 請求完成，收到回應:', responseBody);
                try {
                    const responseData = JSON.parse(responseBody);
                    if (responseData.EncData) {
                        const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                        console.log('解密後的回應資料:', decryptedData);

                        const parsedData = JSON.parse(decryptedData);
                        if (parsedData.TradeToken) {
                            console.log('成功取得 Trade Token:', parsedData.TradeToken);
                            qrcodeTerminal.generate(parsedData.TradeToken, { small: true });

                            console.log('正在生成 QR Code 圖片檔案...');
                            await qrcode.toFile('grab.png', parsedData.TradeToken, { errorCorrectionLevel: 'H' });
                            console.log('QR Code 圖片已儲存為 grab.png');

                            console.log('正在發送圖片至 Slack...');
                            await sendImageToSlack('grab.png');
                        } else {
                            console.error("錯誤：回應中未找到 TradeToken。");
                        }
                    } else {
                         console.error("錯誤：回應中未找到 EncData。");
                    }
                } catch (e) {
                    console.error('處理 API 回應時發生錯誤:', e);
                }
            });
        });

        req.on('error', (e) => {
            console.error('API 請求本身發生錯誤:', e);
        });

        const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
        req.write(encodedEncData);
        req.end();
        console.log("API 請求已送出。");

        // 步驟 4: 儲存 MerchantTradeNo
        const fileName = 'iyugoMerchantTradeNo.txt';
        fs.writeFileSync(fileName, `MerchantTradeNo: ${tradeNo}`);
        console.log(`\n步驟 4: MerchantTradeNo 已儲存到 ${fileName}`);

    } catch (error) {
        // 捕捉整個過程中的任何同步錯誤
        console.error("腳本執行過程中發生嚴重錯誤:", error);
    }
}

// 執行主函式
main();
