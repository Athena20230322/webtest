const https = require('https');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
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
function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// RSA 簽名
function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

// 啟動 readline 等待使用者輸入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BarCode): ', (inputBarCode) => {
    // 取得當前時間
    const { tradeNo, tradeDate } = getCurrentTime();

    // 模擬店家數據
    const data = {
        PlatformID: "10523841",
        MerchantID: "10523841",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "環球購物中心",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "10000",
        ItemAmt: "10000",
        UtilityAmt: "0",
        CommAmt: "0",
        ItemNonRedeemAmt: "0",
        UtilityNonRedeemAmt: "0",
        CommNonRedeemAmt: "0",
        NonPointAmt: "0",
        Item: [
            { ItemNo: "001", ItemName: "測試商品1", Quantity: "1" },
            { ItemNo: "002", ItemName: "測試商品2", Quantity: "1" },
        ],
        BarCode: inputBarCode.trim(), // 使用者輸入的條碼
    };

    // AES 密鑰與 IV
    const AES_Key = "CRzBfyTRtOFXkurE7qYGj6DVoEnXGlHa";
    const AES_IV = "4NapCqD2Qz7gvNTX";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEowIBAAKCAQEAmWpUrw//gZwaIRZSfyXsg23p94Q5d1F8d4PNt6p3P5I2cB9/Fi2cZB+hQTCLdOBKaIBlsfhQCcXIp6ymVyFj8QuIq/j3wwq68uN6nYnPpF3m/Dbeve0pHLmKRay9hAleTwlUgLwtl1gUUpeko+X9nFQEU0HrBWnYDvsnp8Hm3IbwWzZHIpgzCTBWkjWifp+B/8KlDEKQ8c7f6HkV6hQw3v9hcE7Ec0DyayfH9wPlvPBkA1bmXBBKeAG/rQ21pe90BsEZqD+SVt3EqERPQJ/gFT2/Izfi5NHybKnIYcZoDrYPGwnjGSc+z/qfu8xGCIOOL9KprU0PYvyVLm9AmCFDkwIDAQABAoIBABwgOVxK843gf43XWNKEsmK6EO3W6O4uG0KSAHIOp4QZGy/dJmB7hjN49QhNjROlVx7ngz1oh8vy3cGXznsk3PzBH5Jft5Sjb/i9qaoeLNo2ePV+XcG2LBZfEbGKZMhDK24UCND9LuKTPE6UDJQbwy4Y3R4idKLub7T3aKLB0sBVF/xsaYKlnwdAlf1SgHfIv1cnWwb5NtbBC/M2zwpudO9E5w5+/SpFeGwheRZFUl8AxmHXq8dhQ6psb4QSi99NmmrICyShtPUb9E3OFWxoi/ibU7hwD/nOA8NEzi02NAdhw7hook52HlEtBji4KJF+UVOVThcRHkEvK3IEWpBrzoECgYEAuJh9WuVUZLZ+3UEmDiF4gMJsL7NSD0E7mFECwat/CW8ys+Tu/XJvTc0054aASmsOleBPTPV/Os3G6BK244onGcElYdK3ffss9Jy1sjRLkvYcYSBevR+GdZbifAydNPRO5puryeoXOszDvL8A4dJrG7AMS8x9SB5wWCtKU8wfC1MCgYEA1MI5TA3ls4AmDxrNtCW6ouVImuzozC27ueAPLYvfa+EyfuVEIOP/rApLqDdyL3rPIeFcfkE8g+ZQBbiX5H/ZnfSBUhn+QVcs78wY8/gRODzePoDnPmdwZmoVFFaaCOdFcuWW7e3gVgQJwCgPcF0RYJURb+rB5p/xy0B4HYJCHsECgYAmSLn22AkguhilmpVh6N8tFSWK3w3tzAGoHWUM9ZxrQHyrgpduSQV8hUqrmeGRjZKA0vyfYWr5ryPJjdgQaN6jIMO3/hPANQ+ly7qDMwVZfWF1Y1lCr/8a9CgUwij4ipKykSaXwcz/jOgrhRGRxCoim+hw8AArrORv5MqNhpAJsQKBgCuPYH/L0J3BvQkWqcsadm3nl8fwfXFgY7EYyMLAgovp3ZbRhfNd+vjUWs0kHQLPmB0NsQxAew1eWD/znVWxP3LxnpCatc3W9WJbXTiGL7Bd9frCFZZXQ1IUoiA54uuzvipaC17Hd0jlJsHq8c5Fn8swehN58x0u3iiJGI6iHruBAoGBAJiXTL/103LRkzPLbNgJI75Jzw3n+UBKAKG/3zs82qIDxKvTSpFldzXXXzhI4rCPZfwrnU5flKrs2nefTpLRvKygVLzOaSCEJySwUL0yljIIgi8qiThZ7J3xwX38XrkuCiuO6GCqUaNSFFt0gcqBMGT2QNZVGM/nYDrBjgtl7shq
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
        path: '/api/V2/Payment/Pos/DeductICPOF',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '173364',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        res.on('end', () => {
            console.log('Response:', responseData);

            try {
                // 解析並解密 EncData
                const responseJSON = JSON.parse(responseData);
                const decryptedResponse = decryptAES_CBC_256(responseJSON.EncData, AES_Key, AES_IV);
                const parsedResponse = JSON.parse(decryptedResponse);

                console.log("Decrypted Response:", parsedResponse);

                // 取得 TransactionID 和 MerchantTradeNo
                const { TransactionID, MerchantTradeNo } = parsedResponse;

                // 儲存到 .txt 檔案
                const output = `TransactionID: ${TransactionID}\nMerchantTradeNo: ${MerchantTradeNo}`;
                fs.writeFileSync('TransactionDetails.txt', output);
                console.log("Transaction details have been saved to TransactionDetails.txt");
            } catch (error) {
                console.error("Error decrypting or parsing response:", error);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e);
    });

    const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
    req.write(encodedEncData);
    req.end();

    rl.close();
});
