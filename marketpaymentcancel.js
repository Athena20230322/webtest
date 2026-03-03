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
        tradeNo: `Cancel${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
const AES_IV = "z3P4Se8qTFE0F1xI";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

// 1. 讀取 TXT 檔案並擷取原交易的 OPSeq
let originalOPSeq = "";
const filePath = 'C:\\webtest\\marketpaymentrefund.txt';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const match = fileContent.match(/OPSeq:\s*([^\r\n]+)/);

    if (match && match[1]) {
        originalOPSeq = match[1].trim();
        console.log(`成功讀取原交易 OPSeq: ${originalOPSeq}`);
    } else {
        console.error("錯誤：無法在檔案中找到 OPSeq，請確認 txt 檔案格式。");
        process.exit(1);
    }
} catch (err) {
    console.error(`錯誤：讀取檔案失敗 (${filePath})\n請確認檔案是否存在。`, err.message);
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question(`準備取消交易 (原 OPSeq: ${originalOPSeq})，確認請按 Enter... `, () => {
    const { tradeNo, tradeDate } = getCurrentTime();

    // 依據規格書需求填入對應欄位
    const data = {
        PlatformID: "10000266",
        MerchantID: "10000266",
        OriOPSeq: originalOPSeq,
        OPSeq: tradeNo,
        OPTime: tradeDate,
        TxAmt: "36",
        StoreId: "217477",
        PosNo: "01",
        PaymentNo: "038"
    };

    console.log("正在送出取消請求...");

    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/SETPayCancel',
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
            try {
                const jsonResponse = JSON.parse(responseData);

                if (jsonResponse.EncData) {
                    // 解密 EncData
                    const decryptedData = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                    const responseJson = JSON.parse(decryptedData);

                    // 在終端機印出清楚的結果
                    console.log('\n--- 交易取消結果 ---');
                    console.log(`回傳代碼 (RtnCode): ${jsonResponse.RtnCode}`);
                    console.log(`回傳訊息 (RtnMsg): ${jsonResponse.RtnMsg}`);
                    console.log(`解密後的 EncData 內容: ${decryptedData}`);
                    console.log('--------------------\n');

                    // 組合要寫入 txt 檔的紀錄內容
                    const logData = `[${new Date().toLocaleString()}]\n` +
                                    `原交易 OPSeq: ${originalOPSeq}\n` +
                                    `API 回傳狀態: ${jsonResponse.RtnCode} - ${jsonResponse.RtnMsg}\n` +
                                    `CancelOPSeq: ${responseJson.OPSeq || tradeNo}\n` +
                                    `完整解密 EncData: ${decryptedData}\n` +
                                    `========================================\n`;

                    // 將紀錄附加到檔案後方
                    fs.appendFileSync('C:\\webtest\\marketcancel_log.txt', logData);
                    console.log('取消紀錄(包含解密內容)已儲存至 C:\\webtest\\marketcancel_log.txt');
                } else {
                    console.log('\nAPI 回傳錯誤或無 EncData:', responseData);
                }
            } catch (error) {
                console.error("解析回應時發生錯誤:", error);
                console.log("原始回傳資料:", responseData);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    const encodedEncData = `EncData=${encodeURIComponent(encdata)}`;
    req.write(encodedEncData);
    req.end();

    rl.close();
});