const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const QRCode = require('qrcode');
const fs = require('fs');
const axios = require('axios');

// Slack Webhook URL
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

// Imgur Client ID (你需要註冊Imgur並獲取自己的Client ID)
const IMGUR_CLIENT_ID = 'fc927902fd8d9a1';

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
    PlatformID: "10524013",
    MerchantID: "10524013",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"元大證券投資信託授權綁定",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "LBVoh6byFh1ViSo8pMEqPIIPJgZUVbA0";
const AES_IV = "KBlsFkZUaSS4iWir";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAwyobEiNOvwymp7CyOTziT4B+dhLBunkwHSNhZjL98FKtKRmt5JUmaEyGhDYCnPMcHRXmWMXJvtPmf/EBm5DamspNo6w13thxk15PbQcuovTKjeKwAbUG1phZeG+KBRyCS+UMORIpt9EWjWnNJcw4oMnfGWfGnckt05nbIJ3LTf402RcS4Jglkhgwh7123vaeYq4C4Rre7iubqCfMn8+FosvHZwxZT0cwya2+dzvYTOa4p4lddxO3e3ZCqyHmc1CWzNNQ6sK6N5unAGbYKzesXe8IqMFaGaXDSpkBRLy0Vn2k6w+si0Ufy1yOfCbieOB5QB2Uudz/ix9FL9znEfwNZwIDAQABAoIBAB3l3OjN7OSFXnXbsqnkbbJf4mpZ3EDMtktjHgAx4/Ia5aPMEcuDR94m3wfxCDxysoYIKADF0sQU9+pLXwODJjdxXNcr7MLF+2bn8Jioxthi/NwjSUhcVamurteC6td2ncVdAkmEl/csz7ImmQK8gu5Vjq54gJZaeVaXFYPXzeCVbJBwLfRUFw99CVNQ+Yx8s+DzZqEjLCQC2EX7uBenkuIxzv6c39BxfONgYIpIHOiu3A2OiUwtQe3yJFChtFBIBPiNT94vs8Yc2PN+awanNQ+lI9HnZYqyJJWTGqohUXg1fw81GlM0030I3jRw8ma8JnmJuxn1RmRKWACrcYAZm50CgYEAyb7mt6BekZPu1xgkGGY5x7UTu1ekqxpdZQNL1jIC4xZ4wCqyCwCXnGCRpX746JLoVMIDYjz/Q3rH9E122Hep+MZRXiP4nWsy3BWjt09QToerfZgHyE+oO1zvahuN2Qbh1PFxHCveFBhCxa5+IxUvWr5jIdaqLxRClBoUGDkMxeMCgYEA96YfUECaHR38P1RMs/OsA1bHEdPp6ED7TwVHCX8XcBjOqlNiq9YFAyQXa7MbFxwdAxb0PGzYirdxfW3UVoWsgm4XjuUcDpVktP8mzAYedX2TPmPzUydtzDQQJcav8bcDn1cSPbLpCB/4TZdflo/R4RoKzbQuutpLsz90WCfE0a0CgYARz7La32O6Ao+BmfYF2XCcexYk4hX9rTQ1qNbXME8k8WTzwlE5u3GnMrdpHw6mqeGtKfvWfoAi2wIwRW6KqfXtqsSgRRi7/SzeVWLA2lXCuSOg0P1O6Al4RDo26fvZ/0uM20wbKpxOtd2fSkqEmmg14L0rzaH0yhserDa99Lt19QKBgQDeWpbE/KwjNpgU2IDiFgg9Gz40AJyFP0slYSyuFyGZMXzlq2btuITZlB8/QRoyvrhB3OtAEc6/hgPtRZ6gbPc+SND4KTfu1C4O4QUZrOjOPwjkvONtpvpLnfddo664DcW/3HLxWOEovWO5bw+RZOJiBXrrxTsr4/KSJ4gz2sk6JQKBgGJ1MIeRlemFQy67XynAIj04X210MyHLXvZ+5D5umjS98cF51JvtudqxsJH6OSCIP7CoJ6HvQO1zfmjaHcgpv6kSmuyX+GxIuub7W3mPwOrBQabOwZ8XHi9HKyKociMXYz4YXON/NIlFB9h8wqSHheFmQ47LLDmMZaqV6lYoqNOU
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


// 新增上傳圖片到Imgur的函數
async function uploadToImgur(imagePath) {
    try {
        const image = fs.readFileSync(imagePath);
        const response = await axios.post(
            'https://api.imgur.com/3/image',
            {
                image: image.toString('base64'),
                type: 'base64'
            },
            {
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data.link;
    } catch (error) {
        console.error('Error uploading to Imgur:', error);
        throw error;
    }
}

// 修改後的發送至Slack函數
async function sendImageToSlack(imagePath) {
    try {
        // 上傳圖片到Imgur並獲取URL
        const imageUrl = await uploadToImgur(imagePath);

        const payload = {
            channel: 'C08CAL4L80M',
            username: 'QR Code Bot',
            text: '元大證券投資信託授權綁定generated QR Code:',
            attachments: [
                {
                    fallback: 'QR Code',
                    image_url: imageUrl,
                },
            ],
        };

        await axios.post(SLACK_WEBHOOK_URL, payload);
        console.log('Image URL sent to Slack successfully:', imageUrl);
    } catch (error) {
        console.error('Error sending image to Slack:', error);
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
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Binding/CreateICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '192655',
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

                try {
                    const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
                    console.log('QR Code for ApproveBindingToken:\n', qrCode);

                    await QRCode.toFile('yuanta.png', approveBindingToken, {
                        width: 300,
                        margin: 2,
                    });
                    console.log('QR Code saved as yuanta.png');

                    // 使用新的sendImageToSlack函數
                    await sendImageToSlack('Mertotaxi.png');
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

const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();