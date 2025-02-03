const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

const app = express();
app.use(bodyParser.json());

// AES 加密函式
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// RSA 簽名函式
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 加密密鑰與客戶端私鑰
const AES_Key = "xtzXnXnjDkhVWXNZlPJ2gMGAElKF28Kw";
const AES_IV = "IeAzH3aBMlD5pvai";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAyScTCR4BQ17b2UP33jhPcdcKQfWyWxk5xoYsxw7+xoWsc6e6KkxqQYY2BMZoMTy/t7Ko8sZnMLDYgaANlEnsDGidy/XoTbXLKNMPXiw9xsCsuQq5DoGlNimu5uvRgTLWsJqb34UBl5lOCHmlvHvdLzw4fO/zlMuSf4pBSFmwVFytJxuNgbXIhZyuVoWiFNR0SIzmouclyHjANaBnRgrXA/KXdvz1CjbCMlZz17L8n6POid9nMvGfUdGfkKxxooYSNyND4lVcb41C9f+l2pXroG9owVwUUgzIa38fmIi3VzxNrJ4vyYlNH5myMU2g7XKgOtWRxauP1jJS6xUEUVDwaQIDAQABAoIBACL6THEVaprQb+JD02Is4IOnJP17P9xfcpB23GpwzRSwQeCKlfCtAP0L3XDPH2cQbTYANyigH2l0FvHTZwkWIZm2x1mkFRUOO5mJue5iOwvIjUBQAQXovVXBwcwdzXxt3q8u81PWyQQXgF4w6QTxdPC1xAzVnMGO9JaA8AEot2SzuYckLjEGXrmUPLZCdJS5wbgwCwJuCxlHjWI0sihRgWs5FbxiHrTTlepSacO0gl4/r2225fbTy4SeSQDf4mKmXX9cEHMSpyCwXKFsQheXYXXvS/514Jomiou2ijTXywibxrv41KfdSK8NYCP85d0hGr0apvoomd7p3+cUuKUrsxECgYEA+t1xFcx79B2s47hcD1cv/AAFt1mjGCqS2AQnDsiCAMEERfx2vudoktUu+7abehWyo0NgkJqmG/xmY2LY/bMGP+OUnUhVDyPBQs4/Q6WIZmrIsIBYOoRzhMIE7VPUwEcD1bMGC0oGrFO3TjNfEd/him9Z+9jK5JFMYXeYj4ZQusMCgYEAzUUifEN0meksTZJo8qK5FPLbCdm7FAMEN/IrKacOO/ZROnFFtxpltezqon5mt2bxIaEbpPSgpNc4bhFpWXX/O/VaW9xVy6YGG5x0YFLaGVpLpvZNdsf0/eIP8X75hDfftKIskhtd9Frjk6zEu+989dipDQ5nRdUfekfNVTYC/WMCgYAOVs358wA6yd9x/L22WsNxYgbxnfwGi5htJH+fBrL3nBDEd1PKQavmiKzw0lU8uzTExDsmyNAp1Vl84M+KYMtAp599Bf9mqCKJ0QQot7N+NyhVfmCMp7l6oyRo9Fu6ydRcSKlVx9ttyjM2ExWiDev0X70C+jdOrUdyYsWjnofKxQKBgE9WMzf4Em8SUk9BEVMGVaalHse14bqgV9cPwGL+8F94mniOIzXb/AfOo/leBXFJVlV7IWYmLpjHnkXccO1kz9tqvxvWE0r8xkuRsuEv5J/76FWFyPbp3eTqpOLgAqx5s/rq23M1JKE3J9KB6iABNjkHHn+vW3cAIoRukAwpLgqlAoGAA3YT/HRvyTF4P+jUBoORsjYbK2/4kJ6Zi5hTRGbkFn9kmRIdJ0sflGrV7y8Av/aE8KBTOqFETvBZQoW47X3BSjDYVqQhvlhtNjEV3cqd7PFLpF8JELh+MRDgvRA+iwozDiG89+lS2cogP8smW6i2VYQsg1fLbQWW5J5lgBHLMq4=\n-----END PRIVATE KEY-----`;


// 提供條碼扣款的 API
app.post('/deduct', (req, res) => {
    const { barcode } = req.body;

    if (!barcode) {
        return res.status(400).json({ error: '條碼未提供' });
    }

    const data = {
        PlatformID: "10536635",
        MerchantID: "10536635",
        MerchantTradeNo: `Sample${Date.now()}`, // 動態交易編號
        StoreID: "TM01",
        StoreName: "COSMED",
        MerchantTradeDate: new Date().toISOString(),
        TotalAmount: "10000",
        Item: [{ ItemNo: "001", ItemName: "測試商品1", Quantity: "1" }],
        BarCode: barcode,
    };

    const encData = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encData, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/DeductICPOF',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '274676',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const reqToPayment = https.request(options, (paymentRes) => {
        let responseData = '';
        paymentRes.on('data', (chunk) => {
            responseData += chunk;
        });

        paymentRes.on('end', () => {
            try {
                const responseJSON = JSON.parse(responseData);
                const decryptedResponse = CryptoJS.AES.decrypt(
                    responseJSON.EncData,
                    CryptoJS.enc.Utf8.parse(AES_Key),
                    { iv: CryptoJS.enc.Utf8.parse(AES_IV), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
                ).toString(CryptoJS.enc.Utf8);

                const parsedResponse = JSON.parse(decryptedResponse);
                res.json(parsedResponse);
            } catch (error) {
                res.status(500).json({ error: '解密失敗', details: error.message });
            }
        });
    });

    reqToPayment.on('error', (e) => {
        res.status(500).json({ error: '支付請求失敗', details: e.message });
    });

    reqToPayment.write(`EncData=${encodeURIComponent(encData)}`);
    reqToPayment.end();
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
