const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const fs = require('fs');

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
    PlatformID: "10523833",
    MerchantID: "10523833",
    MerchantTradeNo: tradeNo,
    StoreID: "TM01",
    StoreName: "Taroko",
    MerchantTradeDate: tradeDate,
    TotalAmount: "10000",
    ItemAmt: "10000",
    UtilityAmt: "0",
    ItemNonRedeemAmt: "0",
    UtilityNonRedeemAmt: "0",
    NonPointAmt: "0",
    Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
    TradeMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "https://www.google.com",
};

// AES 密鑰與 IV
const AES_Key = "utKS2Uaj6RdcGrw8z7zVxGs7s6j1sz1H";
const AES_IV = "f6aRCJ6PEWoICUGs";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA2dQJVBPSRyytl6oihMLxiQj3MV54/St8DmVYVA0EcWU4Tyf2r8iHdQpESG/JAvRyOdONnAAzk7LIu81ptLsl4PWuiDEzVUrOWqOSeq+OClPCMBuCcVYehZCpsPuQmXo/DsexS3A9itY60JqqusalHEAZydnm0T39KQw2FdkLFbiSdOMicvV9KymKsdP78VD1omd7ZcKo2MX3YZNe4GI2+xRC/DWgSP4hKpR2gwPJ95421lx0xFmdfTDp+pfZwiomhM4YDjYUsoI+2d5hkqKoWOf+ggSuyFFYCqAEY3mvd6lb8pWByvKQuq9E9AOIyXC/Vxq6wjvLZ78H28kH/voaTQIDAQABAoIBAA+EZea4o8E2EFFZHsI3iJEYaP2PaziDwBUJc1LyJh0gLAmi1pVRSGmrbHpUMO0A4LXjBA03IXV10La6LGZ3cicV8VPah2YzIO3phZjaR9jPUdUZ/JSaISymxcPUY98Jtj4VYSP3MAHOKYdB4Vl9UaE90BMmQ+WneruRbF/pjnstQWSb6pWJJVgSOwdLFT4MHDApmCvo663p7P6741wWLcRfZp44+AhhFKMR+/4DY1yjhoBM5IpVKDdwvDXDUjgcQxABSIM3yzvMbxLp65ze3FQj5pXYRGStQsSfpX5BBUbq0YV3eOoOci2QDmDagnhyd0SLmfWtD8MpmQj0hUgtMFkCgYEA8t0faCvmW5MdbQvIFGEnvvFaD3hcom8YGJV+qRWWTM+IGhd2ZVMkuNO8DaYN+Dx0bnMO8Xh5+malYKsJGUIWZ5VRmP3DQA5jqRoOBKHvSs2rghriNQRQRdlOdnBWt/5686D0iEJfqjTO2V3yBLtIkIAvzDFgnjix5IoQ8aA98dkCgYEA5ZxA0CeW9pLK9lXgcjbnI4MQC2Lc6lLfEQfZEC3mHGClR3GAsO6BG/bxLFSVfaZeaWkBv9JKMkGD5HSE3nZH8rP4xy5MYD2KyQTUAz4E1+JrfVzbUI5RNKvzpftewxwVy3CNIr15W4fJnxXfCC1X07jX8Mj/Gw7MRqvCUb7Br5UCgYAKwf69J4ypq8eW5/mx5WfUTm6V1tgLne4sUJrutHUW6+50cWueK2OqCD8BP8TIpSznI5Oa4KJOlDNpJ8pcYxAJAJU/uKXodXq2p9/NFrs5zgh11+kDPjCsF2chWfKNbelWV1/dlUsViAdNm5q32O/q7rKvUdSczZgbrn33pgh4aQKBgE96N6EVoxa0lxaPgUJnqLhNHJekX+2oQ9hkTAliqd02wt8o9a/Izt38K1z55kj49oMsOtPIGbCtptbEUl2iuaLUEw/3Aa7qfoi4aB67L/f+QtDA/JU0vf0qbAsPKK0GorCpw+C7jy9UoEC11F7DOzxpJi4NlOgrxh/MQlYDXo3FAoGBANrKxULcZC2kPMc5hckdnZniyvq4W3E2W1cuLX8fOGnC0XLY//zG6iUL2s3Cwwh7dyEkenQ4Dom/fejgRYyP2gaf8huURL7QRJsn0iLjhHmpfo0n51QIeEaeWYydScsFIiV5+P1KXKTRM48j+ymYakVSe/5gvPzaVBiTUMlAX0np
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
    path: '/api/V2/Payment/Cashier/CreateTradeICPO',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '173330',
        'X-iCP-Signature': X_iCP_Signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
        response += chunk;
    });
    res.on('end', () => {
        console.log('Response:', response);

        try {
            const responseData = JSON.parse(response);
            if (responseData.EncData) {
                const decryptedData = decryptAES_CBC_256(responseData.EncData, AES_Key, AES_IV);
                console.log('Decrypted Response Data:', decryptedData);

                const parsedData = JSON.parse(decryptedData);
                if (parsedData.TradeToken) {
                    console.log('Trade Token:', parsedData.TradeToken);
                    console.log('Trade Token Length:', parsedData.TradeToken.length);

                    // Encode a URL with the TradeToken
                    const qrData = `https://your-server.com/payment?token=${encodeURIComponent(parsedData.TradeToken)}`;
                    // Raw TradeToken text
                    const qrTextData = parsedData.TradeToken;

                    // Display QR Code in terminal (for the URL)
                    qrcodeTerminal.generate(qrData, { small: true });

                    // Generate QR Code for the URL with optimized settings
                    try {
                        qrcode.toFile('taroko_url.png', qrData, {
                            errorCorrectionLevel: 'H', // Higher error correction for better scannability
                            version: 40, // Keep version 40 since the token might be large
                            scale: 8, // Increase module size for better scannability
                            margin: 4, // Add more quiet space around the QR code
                            width: 400 // Set overall image width for better resolution
                        }, (err) => {
                            if (err) {
                                console.error('QR Code generation for URL failed:', err);
                                // Fallback: Save TradeToken to file
                                fs.writeFileSync('tradeToken_url.txt', parsedData.TradeToken);
                                console.log('TradeToken saved to tradeToken_url.txt');
                                return;
                            }
                            console.log('QR Code for URL saved as taroko_url.png');
                        });

                        // Generate QR Code for the plain TradeToken text with optimized settings
                        qrcode.toFile('taroko_text.png', qrTextData, {
                            errorCorrectionLevel: 'H', // Higher error correction for better scannability
                            version: 40, // Keep version 40 since the token might be large
                            scale: 8, // Increase module size for better scannability
                            margin: 4, // Add more quiet space around the QR code
                            width: 400 // Set overall image width for better resolution
                        }, (err) => {
                            if (err) {
                                console.error('QR Code generation for text failed:', err);
                                // Fallback: Save TradeToken to file
                                fs.writeFileSync('tradeToken_text.txt', parsedData.TradeToken);
                                console.log('TradeToken saved to tradeToken_text.txt');
                                return;
                            }
                            console.log('QR Code for text saved as taroko_text.png');
                        });
                    } catch (e) {
                        console.error('QR Code generation error:', e);
                        // Fallback: Save TradeToken to file
                        fs.writeFileSync('tradeToken.txt', parsedData.TradeToken);
                        console.log('TradeToken saved to tradeToken.txt');
                    }
                }
            }
        } catch (e) {
            console.error('Failed to process response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

// 發送請求
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
req.write(encodedEncData);
req.end();