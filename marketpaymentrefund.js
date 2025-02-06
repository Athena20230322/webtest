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

// RSA 簽名
function signData(data, privateKey) {
  const rsa = forge.pki.privateKeyFromPem(privateKey);
  const md = forge.md.sha256.create();
  md.update(data, 'utf8');
  return rsa.sign(md);
}

// 讀取 marketpaymentrefund.txt 文件
function readFileData(callback) {
    fs.readFile('marketpaymentrefund.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('讀取文件失敗:', err);
            return;
        }
        const lines = data.split('\n');
        const buyerID = lines[0].split(':')[1].trim();
        const opSeq = lines[1].split(':')[1].trim();
        const bankSeq = lines[2].split(':')[1].trim();
        callback({ buyerID, opSeq, bankSeq });
    });
}

// 啟動 readline 等待使用者輸入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
  
    // 讀取 marketpaymentrefund.txt 內容
    readFileData(({ buyerID, opSeq, bankSeq }) => {
        // 取得當前時間
        const { tradeNo, tradeDate } = getCurrentTime();

        // 模擬店家數據
        const data = {
            OPSeq: opSeq, // 從 marketpaymentrefund.txt 載入 OPSeq
            BankSeq: bankSeq, // 從 marketpaymentrefund.txt 載入 BankSeq
            TxAmt: "10",
            OPRefundSeq: bankSeq, // 這裡假設 OPRefundSeq 使用 BankSeq 作為參數
            OPRefundTime: tradeDate, //OPRefundTime
            StoreId: "217477",
            StoreName: "見晴",
            PosNo: "01",
            CorpID: "22555003",
            Remark: "123456",
            BuyerID: buyerID, // 從 marketpaymentrefund.txt 載入 BuyerID
        };

        // AES 密鑰與 IV
        const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
        const AES_IV = "z3P4Se8qTFE0F1xI";

        // 客戶端私鑰
        const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

        // 加密與簽名
        const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
        const signature = signData(encdata, Client_Private_Key);
        const X_iCP_Signature = forge.util.encode64(signature);

        console.log("Encrypted Data (EncData):", encdata);
        console.log("X-iCP-Signature:", X_iCP_Signature);

        // 發送 HTTP 請求
        const options = {
          hostname: 'icp-payment-stage.icashpay.com.tw',
          path: '/api/V2/Payment/Pos/SETPayRefund',
          method: 'POST',
          headers: {
            'X-iCP-EncKeyID': '288768',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded', // 你可以根據需要修改 Content-Type
          },
        };

        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => {
              responseData += chunk;
          });
          res.on('end', () => {
              console.log('Response:', responseData);
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
//});
