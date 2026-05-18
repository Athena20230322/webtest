const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const readline = require('readline');

// 建立輸入介面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 1. 先詢問使用者要輸入的單號
rl.question('請輸入 MerchantTradeNo: ', (inputTradeNo) => {
    if (!inputTradeNo) {
        console.error('未輸入單號，程式結束。');
        rl.close();
        process.exit(1);
    }
    rl.close();
    runTransaction(inputTradeNo);
});

function runTransaction(MerchantTradeNo) {
    const data = {
        PlatformID: "10523750",
        MerchantID: "10523750",
        MerchantTradeNo: MerchantTradeNo,
    };

    console.log(`開始處理單號: ${MerchantTradeNo}`);

    const AES_Key = "I2D3XLzMJAdbGcbyyzQFh3sVohrlnaqD";
    const AES_IV = "l2zJKgkxKIze3cGn";

    // 重要：私鑰必須靠左，不能有縮排空白
// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA1ZpebC+xA+86iajzTiFm9KBvkCRJ9QnXjJhzDQdrLzys2mCINWB8LJbBU9yMoEoC6e0iIvuUVKXCDo+6YhjTlpZIfAcUqFDYbdijTk4LYUZEMPTEypBtbSkKICTGjpPhIdO+xEzwBvR8Rc8ioEFou1J1V0465vjljHxalCoR85XYLxX+IAgKIz8e9IEUP8m21fpvV50h1XAEn5LY6rF2PylCXsAx8Jt2fS5zp1u66FV6Ev3kntQ4RFxrpXHV1I8eAjyMi4TVT4hSD2DG3bEN4UPec7vjPwEg9u1RYY5cbNhwQwBmd4jKaNdqNrjRKEqOTTsdiBLKN1fAjsaXq+/thwIDAQABAoIBAEhe24QDKpH/MVGnzPuZRJU4cGQhb29WzNGla0GsVEv2XkhE8ZFIJfpDf7AGpxy9xrv0LJ82ptyBJr0hRFBtQe8g7uEa0wxuC8432qiyt5dXI86Ed9J72Z9lCrm2TBHNl7cK03UV7jMlDZ/nXL94OeBRwVD5v+o2xStyjIvrrxZcfRlEvVNTOj9pE3p2tANH/ZrvIDMsIIfztdffjb2KummB8zcjDfqFudBeg48U1owZMqLprbNktQmG3wodEvdhwWPTYvVhRRUJ3t7OM26/6giYVPdWLDT6TTiVmyIsoZZwlPsIrqZX0gI8uIwMYY6ltRL5nuvXzqWY3BhBm4pktkECgYEA/foLDbzMP44nQnOdJnn5K3F0smR0wiK27HIeeAy5a6zsDmcTVmVUZGW1gB2MiOjAcCprzo1ZaBqfohei6XFLsOlGkOWcY+wu78nuqPzPLmUB6Xf5zUmaGYdM2qq3PmfbgR7cBFAH1mcBzi5afq0ZaxBu5hqWG/ix1bIAyGqUEkcCgYEA10387hHL5lB0yDwU/1CHMPnPsMh5DYLonsHC90C2CAsrnk/QE/Scm48XAAdzL2HI+CESVHOxNuWhOdwozdd2rRJzD1kwqYgdxfHkk2haJGyRZe7ZgEX5YNuYDPiSKfUHmAODO2MZNZuM7pQgTLdfDNQR7dHo0Z+HIdxvnqL9qsECgYAgMjZ8g1aRKAAqGGXvnr7LlxJoGvwCMExoJP9f0J0g3Ub/fGmjJi1QnOQpXZWXNYpPrdEE2j5fSCC8d6qbVVV3E9tyOulccXBxzXOH0KSjCQL5CdCNCauTWOeRQNsB+kCFWdgiY9Lahyxfatjl/iOewvKMEQq+eQRyRqJ6xagHuQKBgQDT41OFNAx3uDyGBuMfNTAnGeK090Zy7p9iBgyK6qt6lQuzPJbp3LT3PsYC6FIKknCHCX0Rkd4Yybp2x918XozT3TFRLJSAc43hjaJHE86KxDH/oCV7YOIA2Xv1X/fwxM1ZZDOVkXxwzonPDgYPmfM4G8kdRJSdICOMRnWvKHb+wQKBgD/4zeQJxjP2OSBH4n44NNZ0P4TX+Q2hc915pn6BbBf2xJlZsZwa1oehan1fJeXgnpee0Q5ZQlu2H0QvBhbVZHt0RRdwuzCQVH+qTrsvskqMSRx0YLbe7WmSt2R5RiTITD6NKG+UZDrHxKFu/VtpprSbpg/NL90O27qGiXzXqRK+
-----END PRIVATE KEY-----`;

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

    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-preprod.icashpay.com.tw',
        path: '/api/V2/Payment/Cashier/QueryTradeICPO',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '172385',
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
                const parsedResponse = JSON.parse(decryptedResponseData);

                const { TransactionID, MerchantTradeNo: respTradeNo } = parsedResponse;

                // 儲存格式修改
                const output = `OMerchantTradeNo: ${respTradeNo}\nTransactionID: ${TransactionID}\nMerchantTradeNo: ${respTradeNo}`;
                fs.writeFileSync('TransactionDetails.txt', output);

                console.log("處理完成，結果已存入 TransactionDetails.txt");
                console.log(output);
            } catch (err) {
                console.error("處理回傳時發生錯誤:", err.message);
            }
        });
    });

    req.on('error', (e) => { console.error('請求錯誤:', e); });
    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();
}