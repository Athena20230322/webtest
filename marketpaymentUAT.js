const https = require('https');
const fs = require('fs');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

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

const AES_Key = "QsIghfphCVB6pqLEEJ8yPR3oDy4BIiMN";
const AES_IV = "nNwejeBfpZgv3DrA";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAyb9ybXNtmQKYWYwF3b2RIG+Oj0I4P/BOJ2OX6BBAM1GRHHxhGg7/PqI56J87jc1zq4VLxPxWOFoJzipulkQQQdn0eGaTqSgYABL7tdvHBnTpbxB1a8sCR8gI2KX3gdaJCHajZxSvfyjG20eTR084uZbF9Y14gCBE5b2+8Nkgatnt0gawczQzHOVlxtW6psFtUGeSsKeQCXiWl0SvLNlootycxImTnSfESHjzhM9NMlKqMyvLEzxDerr+3ALzHOMoDAiheBa/vtSG7KeXJAhEav2U6pz2jZoFjGNQOR3tL+QhrBNlQxoV6PW28grjPx9RBi7aOOrQz04qu66zwS4GjwIDAQABAoIBAAGMIJjXanXb5a8VuJ1FU9BJsKZORXr3AtmaOj1HZIY+jk62mTDMbEelhIRzGyb1xzWT3MFb5V6ORxPDwdBhmkMOMhW+o3SBSlnVlYtwxc39DqyODzWM4/rt25p1k6DaVf53YxzFXdGkx8OSG+OS1pV2c/n6Z53N2tHYzh2A2DHi252t6n259v+0ZJjCBxqa8TIYwX7vyd3XZ73JrmSmGmQh/sw1b2/u/d2NH1TkWNE7ttVcoAt0+Dzbk9OilV5kUxPa1WtW36fDjCU1xZTli/MM7WMw29A/tFuLdDj3qVRjcaaIX4L5tlEtMvYtHi6J/wQJx8KTOOj/FvKUXDPdHeECgYEA/mLELfgAe+tnXW3DSHSrWibctL1TFOtfm8e0WAh/hLtZkE2U+0dOz7ruw2MGLu9LkyvjrQ1QrpViiy7D09UpXXey4xR43azFCDOvr5wCkLwgN+HmA9jVl2x0xC5OKPH1zePa1LPWqOIjZJp+1LloyyTUzgPQd0C2Ghxos8QZDOECgYEAywcscV/NlN0gHZuXjI66KyICFpJTY2jTPrCMwAyM4Su1LrKjcwk/oGP4vMUVdYmyNIPrLcGInNncJOVr9v3YzoWw6jiGr6k0K4zE5MPaOOu7/wJluiIfPpfmMfpHSSDlXjUrt0oWLX0d3iqHK41vnAs3tMbL4tWBpPRiDhTGkW8CgYEA8WHwu5nng67FH29m7VrfuaTEqrA3pNMPnvcp1psBvYY1H2uuoZ1xWEYOB9Lv7BtfACCWYwAOfgr8Pgu7AEf1f150nWswoVAuinDZFW6ZNJN+kuhE5YOccZoVVo6F1e56israPBkF6KzkXrMHBH2GxbSGRZJy/qWl5jLs2x+JkaECgYASi0sx59A9Qp1GVwnWmsrCWc7bBO586/wvg6y3de4AOx/HbiWjwjp/ieIUS+QT4knWph37BexWd0e2TwY3fyQoaOmp2xPiQ5AyUh9BzenGvTFkr3FfOPKlovYxpmyQb2LD4hNmIGw6J21s93F1Nuv00sl5x5aj12CKEpBKPPeOHQKBgE0CMdoqfqXLFK9ht2/n38BXs6Th3xQEbnZpCsG03oZOGkpa32GemcMex8h0yLPLfjurIkw3+m2G2ex2Bhb2zk2yZsCpSzCu8AqdIPqY6sbpN2pLxIordvRXGU4S+0K8GY9Dr9kqbbBslxcrndzHpDWaJJPBar/GJ3z/VadpjFCS
-----END PRIVATE KEY-----`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
    const { tradeNo, tradeDate } = getCurrentTime();
    
    const data = {
      PlatformID: "10544058",
      MerchantID: "10544058",
      Ccy:"TWD",
      TxAmt: "36", // 使用者輸入付款金額
      NonRedeemAmt:"",
      NonPointAmt:"",
      StoreId:"217477",
      StoreName: "見晴",
      PosNo:"01",
      OPSeq: tradeNo, // 動態 OPSeq
      OPTime: tradeDate, // OPTime
      ReceiptNo:"",
      ReceiptReriod:"",
      TaxID:"",
      CorpID:"22555003",
      Vehicle:"",
      Donate:"",
      ItemAmt:"36",
      UtilityAmt:"",
      CommAmt:"",
      ExceptAmt1:"",
      ExceptAmt2:"",
      BonusType:"ByWallet",
      BonusCategory:"",
      BonusID:"",
      PaymentNo: "038",
      Remark: "123456",
      ReceiptPrint:"N",
      Itemlist: [
          { },
      ],
        BuyerID: inputBarCode.trim(),    
    };
    
    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);
    
    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/SETPay',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '197269',
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
                const jsonResponse = JSON.parse(responseData);
                if (jsonResponse.EncData) {
                    const decryptedData = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                    console.log("Decrypted Response Data:", decryptedData);
                    
                    const responseJson = JSON.parse(decryptedData);
                    const logData = `BuyerID: ${inputBarCode}\nOPSeq: ${responseJson.OPSeq}\nBankSeq: ${responseJson.BankSeq}\n`;
                    fs.writeFileSync('marketpaymentrefund.txt', logData);
                    console.log('Data saved to marketpaymentrefund.txt');
                }
            } catch (error) {
                console.error("Error parsing response JSON:", error);
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
