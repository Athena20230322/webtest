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

const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
const AES_IV = "z3P4Se8qTFE0F1xI";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
    const { tradeNo, tradeDate } = getCurrentTime();
    
    const data = {
      PlatformID: "10000266",
      MerchantID: "10000266",
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
            'X-iCP-EncKeyID': '288768',
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
