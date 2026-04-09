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
        PlatformID: "10513284",
        MerchantID: "10513284",
        MerchantTradeNo: MerchantTradeNo,
    };

    console.log(`開始處理單號: ${MerchantTradeNo}`);

    const AES_Key = "8mFv0s9guiCeaw6KVevCzfIpMXjXpuR5";
    const AES_IV = "EFq5p4WEXugFxxwR";

    // 重要：私鑰必須靠左，不能有縮排空白
// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAy8cGoVwaBNx4FgTlJ0dR9/bAXPm2gG/0GCk3a7c8WAprQgJV7ZPXqek9KmF7eq1X3cPs+MP/ypsy0pBO76MSEYtRBGnjFsvps62NVzEXqvpg6EzIBG7iFCMVOcHSCVr9r6wanzkXVr4t9D+nCBiGmC/UGMlwPbu+LlAaSeHmB+1l/k3+4row7RY0HvJlM2UpkkEd0eArecvknXecVH7yDmJwUbexfJjyp2U8HLBOrok3q5VYtE9eqZzvaoGmYImD5c5BTkztaQyuiobbyYWxqATweYVUYYRrAI+PJUtGONMUZfKnwTwHPfIRMQFXjAjWnRYtmb5JjzAB+ERfRQb4SQIDAQABAoIBAAE/WkNwN7PCUPUUwDDGkP8YAml1sq/qmSK+VEAgKQoCiYTBh7RV0vYpUirv2dYQa/9H818HSon7YgsQv+SO3QENsOGtoqqn3B0x3/5upuej2YzSgeiOo54RioNSzaEp1QlXeZPYwTnSUQaAjtppbzmAFKfqMJO2kh16d0Hu7heSUhOdDuRS4q0WH90Coqt0RO1gc9AjJR/Y2Y6lkEbz6+WkA6ZODIZx+Jpb/QToGuclh0LoSxRCA6znSOJQ4DcfF155qLBzW/Q5bAtoedXelnW8RFM0OIFI8+kkvWWIhXpkW2JC4NcpMJN/tnB3AqGKo3Noy+iUK2nXHBP7TYnXjgECgYEA746RJYSaxXV8H8VLF4kA8u4Lmbt20CiL73mXu9n36xkPDE56WGbK0UmD8H58V47EH/nGL7uAYX6U1Mj/t4Tvl85AmxEwdAvlv11IL2aG32bq+HXskUW8NGdY2V92c42fEB6LSRHWBJ544qrXgAsXSIj6bEea2zPieRfRzubHqKECgYEA2cPAWukcvWpUThMlVoqnWhbzKVu8A2TrWDyuyvb0faqZRGpKmdrI3gd9ITA+zoJFNxDJCwNXU54KSA/sBtoAd/tVApBJZHH4Dgp0wVnKzG7VyF4cphJt3PMmy83LwT2OxJYam2fp4QDJ4A3J8KzMrbJzewUCABbSTwIF4pa45qkCgYBC3cOL+mCNH0b/Qz27mwVFycY5Kgd3AOpWdNUynRvDZqI5qCokRMT1+BQ468VfVz1NQ5XbOvYRwJhgcJ5YJmYONIb6AalJqwx9BtegS3j4IK0Tny7iOdnXssUtH6VbibtNb4knYzAe5/EMK+2tEutz1rA3yyDhcLEVZd2tZ+NxIQKBgQCjufPT5lS/bUR5dxepm5H7wCmOvPP9MVFpBCb/XvGv0iZuM+RnDQHdPZAs9dMi/PsBTdN6PkbYDYj5aU8yT5Huo77ksIsdxDqWg/IItXQuhF6jyW6Mxmpnp0FSFibN4XSIBbt3gIdtrmQZ2wQruiAhsHv20GsSmhYBZSn7lQrsEQKBgQDO6bPEWj63/9D3ZEdPSSad0D3K3wjw0wj+gYSSUNXlgJmROfLLGzc2lKiA3EzcI6HikpeULsTiVwHqbOX4PjTzUVHK8LRWt6Y7UzvzVST98sp1wzNcep5ZUvETSx6maPFuJAM2t3c/0w93KIgC8eZxKPb/TO59Nd3GoWvOhIBRQw==
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
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Cashier/QueryTradeICPO',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '179749',
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