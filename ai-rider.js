const https = require('https');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

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
    PlatformID: "10523860",
    MerchantID: "10523886",
    MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
    StoreID: "TM01",
    StoreName: "AI-RIDER",
    MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
    TotalAmount: "5000",
    ItemAmt: "5000",
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
    BarCode: "IC142J02A9VQUOWSF3",
};

// AES 密鑰與 IV
const AES_Key = "vilehVUCuNWWLEVMInIzsDqA7ptJbwJL";
const AES_IV = "Vrtbhp93GzFrYu39";

// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEAx3Yo+1mvPE3GJH7W4qlGU3k3S0aOQfq6n7tyJoqEnel7Xtujg691mmKPOSSWhs0NPO1vmTYABbKKv0JmpvWr3sXGVL/eo5T9MUsGsKlLSjWThEySkN7OM8HrL2M4e4g2tRsOgMDa5LipcGVUdJJ6aKa0BHrKoCrwrS8vEFnE/txrM4WceE9g/LTzUuSdpEuvt62z3o/LGcv7YY5jAtJZFlBDx+u6+a3OXl/kR8WvVUqJfmW32TL27ledziBS+yc3aHPtqtmCnp9x+WV4rkMMXJfs4RCvG4cUlrSkpS1KYWuqsBJqtXbYm0Jb8zShWZXpSMJYdBELnBNsWKDIgzPkRQIDAQABAoIBABJNU85YeN1aL5O6tcH/kU3ogfvcwgHo3UX536wMqsWInoLiOXtEVtCvOYAfTNaaqxvLl6Fh1JexPcz17VBlm3sp/5xYLLgq3B6xSTBdoGRzTRFnK02yvA4AvbFP8+dV5NsyW97Rk2RIU3fWPG0j4aqHnV4J3FzdA8+IVFO2QP63lkkBYX2FJruOh+6D9RTgdOLUC61yTEsXWCxW5zQWmKhj/Vz8fZDxNeFBIpGtxA4hnQzOvw+pEIXrilWCq+x9HvEQ3tO3iTw1hK5GCVsNEB8JJJg0ZQUEG9XzoGBHd8gc69QIbBdjJ0JkV263Z+6h/D0VgreS9Ik4rjOQS8iU9XECgYEA+kYeHgvjDC1DvkueFGaX+sTtjFQJO+BAzbLBXbduQXhSYPAf8X5jIOtJT9KdxiFyH3eL1aWwmQHHOuApjw3vlo3rJHT3UAFcbGEZdW+wCiut/qaC92NhQ/H7XfvDJF+66+zZX2Vk6SveHp6Oxnto1f2NpKDmsmbWabwHlKijHfkCgYEAzAZty2VZsh3pEOI+W71kR5fCHMrUearXF6UBnXxbJFM7IoI8G6rlPRtDitLBSKwO8JNNFgORr0Gjo5I+pimqgkIuXrc4QbzhlPCfTA7l+MzMD8KBEIanUmsQJjSbViacrO1mYHvi6NWvYnil/2Rc7jYqTWVNzin4F1rIsmaie60CgYEA+cj7jB9vBxsyLn4IEvJmIvli4RiKcsEZzHLpPOCzYRJ2nZtrNjpfM17BN7LMlw+QeEl3Pc91lvBIaMGLmOReyFNyaVt37di95slugF/tQelgafTEZ6Y/UHH14FJC7E3DIG6ucOCgu3t13/d+JijLdC/wq2uPdGThAHyS0FMTIfkCgYAEIZExkCDL0X05oUsf8mrIZFNC3/yDZikqymWI+c6ioqjM3xQ2fzRbE2U/t1rAjPNUfbcO3g2iHdMhacGo/aj9MDfeJRmXgyqSKHkhQh/39LWhEBAq9H8I1TAjhecrTGbZvYjYJUoH6uO9O7IoxLB5BlG+9XEo3oKufmEX86oQlQKBgBZcVTplSVX2dSLZHGiLTRxVjf05JXOh8Fj9I1mwrfa67qbzAQtlR3raRFkhqRXoUU3yOBNFpy2ks5kliuP/KwdIF9TP6lkk38AboI0hUHmB7+lVnEy3CjQbFywh+fUa+4zYxGXoTKR3QPi/WdmazKkqdyG0y7Md3VRMuZEph9wx
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
  path: '/api/V2/Payment/Pos/DeductICPOF',
  method: 'POST',
  headers: {
    'X-iCP-EncKeyID': '187183',
    'X-iCP-Signature': X_iCP_Signature,
    'Content-Type': 'application/x-www-form-urlencoded', // 你可以根據需要修改 Content-Type
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    // 你可以在這裡處理回傳的數據
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

// 在此將加密過的資料作為請求的 body 發送
const encodedEncData = `EncData=${encodeURIComponent(encdata)}`; // 使用 `encodeURIComponent` 編碼 `encdata` 的內容
req.write(encodedEncData);
req.end();
