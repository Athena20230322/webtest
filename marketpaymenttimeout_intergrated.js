const https = require('https');
const fs = require('fs');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// ==========================================
// 1. 基礎設定與加密函數
// ==========================================
const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
const AES_IV = "z3P4Se8qTFE0F1xI";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES_CBC_256(encData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
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

function getCurrentTime(prefix = 'Sample') {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
        tradeNo: `${prefix}${yyyy}${MM}${dd}${hh}${mm}${ss}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// ==========================================
// 2. 規格書符合版：取消交易流程 (ICPOS003)
// ==========================================
function doCancelTransaction(originalOPSeq) {
    console.log(`\n--- 🚀 [規格書同步] 執行取消交易 API (ICPOS003) ---`);
    console.log(`介接路徑: /api/V2/Payment/Pos/SETPayCancel`);

    // 依規格書 EncData 內容：OPSeq, CorpID
    const cancelData = {
        OPSeq: originalOPSeq,
        CorpID: "22555003" // 規格書定義固定帶入此統編
    };

    const encdata = encryptAES_CBC_256(JSON.stringify(cancelData), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const postData = `EncData=${encodeURIComponent(encdata)}`;
    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/SETPayCancel',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '288768',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log('\n--- 🎯 取消回應 (Response) ---');
            try {
                const json = JSON.parse(responseData);
                // 規格書定義 Body 包含 EncData, RtnCode, RtnMsg
                console.log(`RtnCode: ${json.RtnCode}`);
                console.log(`RtnMsg: ${json.RtnMsg}`);

                if (json.EncData) {
                    const dec = decryptAES_CBC_256(json.EncData, AES_Key, AES_IV);
                    console.log(`解密 EncData 內容 (OPSeq結果): ${dec}`);
                }
            } catch (e) {
                console.log('無法解析回應 Body');
            }
            console.log('\n[測試結束] 自動補救流程已完成。');
            rl.close();
        });
    });

    req.on('error', (e) => {
        console.error('取消請求失敗:', e.message);
        rl.close();
    });

    req.write(postData);
    req.end();
}

// ==========================================
// 3. 主流程：付款請求與模擬超時
// ==========================================
rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
    const { tradeNo, tradeDate } = getCurrentTime('Sample');

    // 付款資料 (簡化版，確保 OPSeq 正確)
    const paymentData = {
        PlatformID: "10000266",
        MerchantID: "10000266",
        Ccy: "TWD",
        TxAmt: "36",
        StoreId: "217477",
        PosNo: "01",
        OPSeq: tradeNo,
        OPTime: tradeDate,
        CorpID: "22555003",
        ItemAmt: "36",
        BonusType: "ByWallet",
        PaymentNo: "038",
        BuyerID: inputBarCode.trim(),
    };

    const encdata = encryptAES_CBC_256(JSON.stringify(paymentData), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);
    const postData = `EncData=${encodeURIComponent(encdata)}`;

    const options = {
        hostname: 'icp-payment-stage.icashpay.com.tw',
        path: '/api/V2/Payment/Pos/SETPay',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '288768',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        },
    };

    console.log(`\n[系統] 付款請求已發送 (序號: ${tradeNo})`);

    let alreadyCancelled = false;
    const req = https.request(options, (res) => {
        console.log(`[模擬延遲] 偵測到伺服器 Header，故意等待 10 秒模擬處理超時...`);
    });

    // 核心模擬：10 秒一到立刻摧毀付款連線並轉向取消 API
    const forceTimeout = setTimeout(() => {
        if (!alreadyCancelled) {
            alreadyCancelled = true;
            console.error(`\n[🚨 警報] 已達 10 秒超時門檻！正在切斷付款請求並自動執行「取消交易」...`);
            req.destroy();
            doCancelTransaction(tradeNo);
        }
    }, 10000);

    req.on('error', (e) => {
        if (!alreadyCancelled) {
            console.error('連線發生其他錯誤:', e.message);
            clearTimeout(forceTimeout);
            rl.close();
        }
    });

    req.write(postData);
    req.end();
});