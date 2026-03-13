const https = require('https');
const fs = require('fs');
const readline = require('readline');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// ==========================================
// 1. 加解密與共用函數設定
// ==========================================

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

// 取得當前時間 (帶有前綴參數以便區分付款與取消)
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

const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
const AES_IV = "z3P4Se8qTFE0F1xI";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// ==========================================
// 2. 取消交易的邏輯封裝
// ==========================================
function doCancelTransaction(originalOPSeq) {
    console.log(`\n========================================`);
    console.log(`⚠️ 啟動自動取消交易機制`);
    console.log(`   原付款 OPSeq: ${originalOPSeq}`);
    console.log(`========================================`);

    const { tradeNo, tradeDate } = getCurrentTime('Cancel'); // 產生新的 Cancel 序號

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
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            try {
                const jsonResponse = JSON.parse(responseData);
                if (jsonResponse.EncData) {
                    const decryptedData = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                    const responseJson = JSON.parse(decryptedData);

                    console.log('\n--- 自動取消交易結果 ---');
                    console.log(`回傳代碼 (RtnCode): ${jsonResponse.RtnCode}`);
                    console.log(`回傳訊息 (RtnMsg): ${jsonResponse.RtnMsg}`);
                    console.log(`解密內容: ${decryptedData}`);

                    const logData = `[${new Date().toLocaleString()}]\n` +
                                    `原交易 OPSeq: ${originalOPSeq}\n` +
                                    `API 回傳狀態: ${jsonResponse.RtnCode} - ${jsonResponse.RtnMsg}\n` +
                                    `CancelOPSeq: ${responseJson.OPSeq || tradeNo}\n` +
                                    `完整解密 EncData: ${decryptedData}\n` +
                                    `========================================\n`;

                    fs.appendFileSync('C:\\webtest\\marketcancel_log.txt', logData);
                    console.log('✅ 自動取消紀錄已儲存至 C:\\webtest\\marketcancel_log.txt');
                } else {
                    console.log('\n取消交易 API 回傳錯誤:', responseData);
                }
            } catch (error) {
                console.error("解析取消回應時發生錯誤:", error);
            } finally {
                rl.close(); // 取消交易完成後關閉終端機輸入
            }
        });
    });

    req.on('error', (e) => {
        console.error('自動取消交易連線失敗:', e.message);
        rl.close();
    });

    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();
}

// ==========================================
// 3. 主流程：付款交易
// ==========================================
rl.question('請輸入付款條碼 (BuyerID): ', (inputBarCode) => {
    const { tradeNo, tradeDate } = getCurrentTime('Sample');

    const data = {
      PlatformID: "10000266",
      MerchantID: "10000266",
      Ccy:"TWD",
      TxAmt: "36",
      NonRedeemAmt:"",
      NonPointAmt:"",
      StoreId:"217477",
      StoreName: "見晴",
      PosNo:"01",
      OPSeq: tradeNo,
      OPTime: tradeDate,
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
      Itemlist: [ { } ],
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
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log('\n--- 付款回應 ---');
            console.log('Response:', responseData);
            try {
                const jsonResponse = JSON.parse(responseData);
                if (jsonResponse.EncData) {
                    const decryptedData = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                    console.log("Decrypted Response Data:", decryptedData);

                    const responseJson = JSON.parse(decryptedData);
                    const logData = `BuyerID: ${inputBarCode}\nOPSeq: ${responseJson.OPSeq}\nBankSeq: ${responseJson.BankSeq}\n`;
                    fs.writeFileSync('C:\\webtest\\marketpaymentrefund.txt', logData);
                    console.log('✅ 交易成功！資料已儲存至 marketpaymentrefund.txt');
                }
            } catch (error) {
                console.error("解析付款回應 JSON 時發生錯誤:", error);
            } finally {
                rl.close(); // 正常完成付款時關閉
            }
        });
    });

    // === 模擬 Timeout 機制 ===
    // 設為 1 毫秒必定觸發 Timeout；正式環境請改為例如 15000 (15秒)
    const timeoutMs = 1;

    req.setTimeout(timeoutMs, () => {
        console.error(`\n[系統提示] 付款請求已超過 ${timeoutMs} 毫秒無回應，觸發 Timeout！`);
        req.destroy(new Error('TIMEOUT_TRIGGERED')); // 拋出特定錯誤代號以利辨識
    });

    req.on('error', (e) => {
        if (e.message === 'TIMEOUT_TRIGGERED') {
            console.error('>> 連線已強制中斷，準備啟動補救措施。');
            // 觸發 Timeout，呼叫自動取消函數，並傳入「本次付款」的 OPSeq (即 tradeNo)
            doCancelTransaction(tradeNo);
        } else {
            console.error('發生預期外的網路錯誤:', e.message);
            rl.close();
        }
    });

    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();
});