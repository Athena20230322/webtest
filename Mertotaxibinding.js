const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const QRCode = require('qrcode');
const fs = require('fs'); // 引入 fs 模組用於寫入檔案

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
    PlatformID: "10513284",
    MerchantID: "10513284",
    BindingTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreName: "測試商戶1",
    BindingMode: "1",
    CallbackURL: "https://prod-21.japaneast.logic.azure.com/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4",
    RedirectURL: "",
    merchantUserID: tradeDate, // 動態 merchantUserID
    DisplayInformation:"綁定測試",
    BindingSubject:"綁定大都會車隊",
    RedeemFlag:"0",
    ExpiredType:"1",
    TotalAmtLimit:"10000",
    NonPointAmt: "0", 
    MaxMonthAmt: "30000000",
};

// AES 密鑰與 IV
const AES_Key = "8mFv0s9guiCeaw6KVevCzfIpMXjXpuR5";
const AES_IV = "EFq5p4WEXugFxxwR";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAy8cGoVwaBNx4FgTlJ0dR9/bAXPm2gG/0GCk3a7c8WAprQgJV7ZPXqek9KmF7eq1X3cPs+MP/ypsy0pBO76MSEYtRBGnjFsvps62NVzEXqvpg6EzIBG7iFCMVOcHSCVr9r6wanzkXVr4t9D+nCBiGmC/UGMlwPbu+LlAaSeHmB+1l/k3+4row7RY0HvJlM2UpkkEd0eArecvknXecVH7yDmJwUbexfJjyp2U8HLBOrok3q5VYtE9eqZzvaoGmYImD5c5BTkztaQyuiobbyYWxqATweYVUYYRrAI+PJUtGONMUZfKnwTwHPfIRMQFXjAjWnRYtmb5JjzAB+ERfRQb4SQIDAQABAoIBAAE/WkNwN7PCUPUUwDDGkP8YAml1sq/qmSK+VEAgKQoCiYTBh7RV0vYpUirv2dYQa/9H818HSon7YgsQv+SO3QENsOGtoqqn3B0x3/5upuej2YzSgeiOo54RioNSzaEp1QlXeZPYwTnSUQaAjtppbzmAFKfqMJO2kh16d0Hu7heSUhOdDuRS4q0WH90Coqt0RO1gc9AjJR/Y2Y6lkEbz6+WkA6ZODIZx+Jpb/QToGuclh0LoSxRCA6znSOJQ4DcfF155qLBzW/Q5bAtoedXelnW8RFM0OIFI8+kkvWWIhXpkW2JC4NcpMJN/tnB3AqGKo3Noy+iUK2nXHBP7TYnXjgECgYEA746RJYSaxXV8H8VLF4kA8u4Lmbt20CiL73mXu9n36xkPDE56WGbK0UmD8H58V47EH/nGL7uAYX6U1Mj/t4Tvl85AmxEwdAvlv11IL2aG32bq+HXskUW8NGdY2V92c42fEB6LSRHWBJ544qrXgAsXSIj6bEea2zPieRfRzubHqKECgYEA2cPAWukcvWpUThMlVoqnWhbzKVu8A2TrWDyuyvb0faqZRGpKmdrI3gd9ITA+zoJFNxDJCwNXU54KSA/sBtoAd/tVApBJZHH4Dgp0wVnKzG7VyF4cphJt3PMmy83LwT2OxJYam2fp4QDJ4A3J8KzMrbJzewUCABbSTwIF4pa45qkCgYBC3cOL+mCNH0b/Qz27mwVFycY5Kgd3AOpWdNUynRvDZqI5qCokRMT1+BQ468VfVz1NQ5XbOvYRwJhgcJ5YJmYONIb6AalJqwx9BtegS3j4IK0Tny7iOdnXssUtH6VbibtNb4knYzAe5/EMK+2tEutz1rA3yyDhcLEVZd2tZ+NxIQKBgQCjufPT5lS/bUR5dxepm5H7wCmOvPP9MVFpBCb/XvGv0iZuM+RnDQHdPZAs9dMi/PsBTdN6PkbYDYj5aU8yT5Huo77ksIsdxDqWg/IItXQuhF6jyW6Mxmpnp0FSFibN4XSIBbt3gIdtrmQZ2wQruiAhsHv20GsSmhYBZSn7lQrsEQKBgQDO6bPEWj63/9D3ZEdPSSad0D3K3wjw0wj+gYSSUNXlgJmROfLLGzc2lKiA3EzcI6HikpeULsTiVwHqbOX4PjTzUVHK8LRWt6Y7UzvzVST98sp1wzNcep5ZUvETSx6maPFuJAM2t3c/0w93KIgC8eZxKPb/TO59Nd3GoWvOhIBRQw==
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
    hostname: 'icp-payment-stage.icashpay.com.tw',
    path: '/api/V2/Payment/Binding/CreateICPBinding',
    method: 'POST',
    headers: {
        'X-iCP-EncKeyID': '179749',
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

            // 解析回應並提取 ApproveBindingToken 和 BindingTradeID
            const parsedData = JSON.parse(decryptedData);
            const approveBindingToken = parsedData.ApproveBindingToken;
            const bindingTradeID = parsedData.BindingTradeID;

            if (approveBindingToken) {
                console.log('ApproveBindingToken:', approveBindingToken);

                // 確保生成 QR Code
                try {
                    // 輸出至終端
                    const qrCode = await QRCode.toString(approveBindingToken, { type: 'terminal' });
                    console.log('QR Code for ApproveBindingToken:\n', qrCode);

                    // 儲存為圖片檔案
                    await QRCode.toFile('Mertotaxi.png', approveBindingToken, {
                        width: 300,
                        margin: 2,
                    });
                    console.log('QR Code saved as Mertotaxi.png');
                } catch (err) {
                    console.error('Error generating QR Code:', err);
                }
            } else {
                console.error('ApproveBindingToken not found in response data.');
            }

            if (bindingTradeID) {
                console.log('BindingTradeID:', bindingTradeID);

                // 將 BindingTradeID 寫入檔案
                fs.writeFile('BindingTradeID.txt', bindingTradeID.toString(), (err) => {
                    if (err) {
                        console.error('Error writing BindingTradeID to file:', err);
                    } else {
                        console.log('BindingTradeID saved to BindingTradeID.txt');
                    }
                });
            } else {
                console.error('BindingTradeID not found in response data.');
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