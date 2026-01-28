const https = require('https');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const fs = require('fs');

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
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入儲值金額 (TopUpAmt): ', (inputTopUpAmt) => {
    rl.question('請輸入現金儲值條碼 (BuyerID): ', (inputBarCode) => {
        
        const { tradeNo, tradeDate } = getCurrentTime();
        
        const data = {
            PlatformID: "10000266",
            MerchantID: "10000266",
            Ccy: "TWD",
            TopUpAmt: inputTopUpAmt.trim(),
            OPSeq: tradeNo,
            StoreId: "982351",
            StoreName: "鑫和睦",
            PosNo: "01",
            OPTime: tradeDate,
            CorpID: "22555003",
            PaymentNo: "038",
            Remark: "123456",
            Itemlist: [{}],
            BuyerID: inputBarCode.trim(),
        };

        const AES_Key = "wetEi4zKeJTDLcXCvqrDduAThvoeUudd";
        const AES_IV = "zlHw6q30q2qmWlzD";
        const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
        MIIEowIBAAKCAQEAyTVkMuX3QXVAlISnNwRgWmVaOEkv/sq0P++q/gAeKBoqMh20jCOO2tmGZ0XsBuvFToA8M1OwcLksGYJUeahd1oh3XerMr87+xS6L6+x3f+q7OJ2q5LGyYXzF06z5ilfnH5oGuwtx5+okU03JkO4pYMXeJC3wHnPD6FwGd4IGdI83qTE8IaE5vBbNshd/I3rLd9ETTNfmpll27gJYKbqDHFgtJoUwqXqo/VcHd2Wsrtma9tHM3Yd+5fl63mccTlN3+OKQnGT2hXtQNa99H9LdiGae+Aq+z/Xsj1VJVbI5P1TTVy6WAyGLQ2X5Kmakv+4LaB4+QDIxjecrCwYDCHlR3QIDAQABAoIBABgJE3rcCz0LyWbkcMgq8uqhfFVIct4ML1uK4QF+GJwgQgWiFEkAT2aXwQ0xplgOTo/J1EcqWmOgzyKN9dLhmLIRs7apn4Fp5/e8j3TjlsPWUb6Z4Qn4Ky+nlMcsPNP4m7Cj+OVboOP8DZJQ8sDoHlPD1z05qpssp4yof5JDm0tNgS/GfOQJFC+bF9xmNtTfqD+T6zeidaARuy/uPhSO2hG+NhNOjxcXwfIXihlGFxRNjTZtHmXDUgR5DXT4oJu0gNiz52QAX0tS4w+S3xsRE+Y7rYVn1oDUSwMSWEycmGfur9Lv6CExrnHB13j26QaZ25MK902tyJlFQYCV8esMO7ECgYEA6kU7Nqryrbld+lgsgg1Ks2nfqpYxnvGL6ITDYThphJdJhPTCITkUFPkVo9KNks3B2K/Hj1fhb7Kr3i80D0pE0Yospj8ZjNt+hieB/mjQ9BmONvdrgxi1fT/4Szwct631X5MJng9Nl23nHGgESV8xzIRs9K/IWUK9P/FArCSDAe0CgYEA298afAyg643Pdpb9qTM9/uJXHNkHHNPU7g+7Z2/mdjC/XZBy03qK7EdfZLZ4r/WXZxxUxwu0C7mAaezPxWZypR4jSSPn2yz0AUMtrVjZnDfZgGbtsynUt9OffgHhRXsRhQ94Lf56W7DteH/TxNwGuOmkgbajC2CcjCMNG4pNUbECgYAhnaWNhqIkA4FUtupMDxQ1AnAxzjN4lzh4OPTAMpQRjpPiHCzvD32uNL/CLihadGPob/C2xOl4Wa8HxsY1m3acirM1d8B20dgp7+lbVDcHj9M0V/R5b0Y7nr5GLW4BfVjEShkLMS71F7QeA176GErRCf+IbODWzhjR4BBjoymZUQKBgQDQ2b+ijaxdk7q5fvs8OXxuHDl7IXvsGhtsdm0g994F7pAYJBmuX/yOK82lMN665aIHQ5YT7D391RrxgwxpCcNkrJf/5adbPfwZJuLAgmFSToq/uQWY5ec1JkOdwdNl2Fzv853Isq0vY4RurZ1OpWGNTAIDZKTDLeYGB1VwD5MaQQKBgBOnuj4zP9rp3G4vqCPWWvk0wV9MYMEXFc96Nm84Tj+YW7x3pxTAXlV1VSeu8jKmdM0HkjQXM1mXfUuJo5WSM1FI1lKAMjLe31fhgxgEA6l4vtikHWXP/4IIyiYBqKyNOnJVxll34qaiYA80SkOEFJxX8QvBgHtWf7x2IKyFthEr
        -----END PRIVATE KEY-----`;
        
        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);

        const options = {
            hostname: 'icp-payment-preprod.icashpay.com.tw',
            path: '/api/V2/Payment/Pos/SETTopUp',
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': '117497',
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
                const responseJson = JSON.parse(responseData);
                const responseEncData = responseJson.EncData;
                const decryptedData = decryptAES_CBC_256(responseEncData, AES_Key, AES_IV);
                console.log("Decrypted Data:", decryptedData);
                
                const parsedData = JSON.parse(decryptedData);
                const { OPSeq, BankSeq } = parsedData;
                
                fs.writeFileSync('markettoprefund.txt', `BuyerID: ${inputBarCode.trim()}\nTopUpAmt: ${inputTopUpAmt.trim()}\nOPSeq: ${OPSeq}\nBankSeq: ${BankSeq}\n\n`);
                console.log('Data saved to markettoprefund.txt');
            });
        });

        req.on('error', (e) => {
            console.error('Error:', e);
        });

        req.write(`EncData=${encodeURIComponent(encdata)}`);
        req.end();
        rl.close();
    });
});
