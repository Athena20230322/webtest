const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

// --- 設定區 ---
const AES_Key = "VhoGVCInVF2UJ1cQBVZCF48lGUVIoCng";
const AES_IV = "z3P4Se8qTFE0F1xI";
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA0hXyO7E10c4WR/S1XUFUyvlLS8wX/3RoL9nE4kwWJC+nTy8AFSVBgNz2KPnv3If+q8lG3bqq6TCiBmZxP33hbQH1H/cZPHag644nHlHc0/ZSunXB92jprH4xf96wfev12wqrMbCnYKytInEJnuHN+n3eq0LuyQ/WRcPVROJWxYFUO+uGLbFohtmppb0f/cSKOr0hVP15qZAEVSQwYHhu1CJAI/XoRLkZd87A2KHzvVJ2qkbjRbzXemRToE0v3GrWoUoBIMW3cJxgKieMW/HhQHfnz8njTf4nYlA4OSi2U43OA3Z9T+9gB5I8FvfOokt/LfhvO5q/l7QWB+yaX2hvuQIDAQABAoIBAAd57PYnWws1mpDiej7Ql6AmiYGvyG3YmmmThiBohUQx5vIYMdhOzFs14dO4+0p9k3hRECLNZQ4p4yY3qJGSHP7YWj0SOdVvQlBHrYg0cReg9TY6ARZZJzGyhvfuOJkul7/9C/UXfIlh88JdQ/KhxgcDSjSNi/pfRCiU7MbICD78h/pCS1zIWHaICZ2aL5rV2o5JwCcvDP8p3F+LFW/5u5kK0D0Pd29FXhf5MKHC4Mgrn2I44Uyhdud2Mf7wdvYvvcv2Nzn/EvM7uYZpkEyC3Y1Ow037fZjO3pVCVRt8Mbo4B75ORqXQnr1SbKXWXM/unUEIfMhsBRhx/diDCO8xyiECgYEA8UXIvYWREf+EN5EysmaHcv1jEUgFym8xUiASwwAv+LE9jQJSBiVym13rIGs01k1RN9z3/RVc+0BETTy9qEsUzwX9oTxgqlRk8R3TK7YEg6G/W/7D5DDM9bS/ncU7PlKA/FaEasHCfjs0IY5yJZFYrcA2QvvCl1X1NUZ4Hyumk1ECgYEA3ujTDbDNaSy/++4W/Ljp5pIVmmO27jy30kv1d3fPG6HRtPvbwRyUk/Y9PQpVpd7Sx/+GN+95Z3/zy1IHrbHN5SxE+OGzLrgzgj32EOU+ZJk5uj9qNBkNXh5prcOcjGcMcGL9OAC2oaWaOxrWin3fAzDsCoGrlzSzkVANnBRB6+kCgYEA2EaA0nq3dxW/9HugoVDNHCPNOUGBh1wzLvX3O3ughOKEVTF+S2ooGOOQkGfpXizCoDvgxKnwxnxufXn0XLao+YbaOz0/PZAXSBg/IlCwLTrBqXpvKM8h+yLCHXAeUhhs7UW0v2neqX7ylR32bnyirGW/fj3lyfjQrKf1p6NeV3ECgYB2X+fspk5/Iu+VJxv3+27jLgLg6UE1BPONbx8c4XgPsYB+/xz1UWsppCNjLgDLxCflY7HwNHEhYJakC5zeRcUUhcze6mTQU6uu556r3EGlBKXeXVzV69Pofngaef3Bpdu6NydHvUE/WIUuDBOQmkV7GVjQP4pTEv6lFYEUuMFFOQKBgHfINuaiIlITl/u59LPrvhTZoq6qg7N/3wVeAjYvbpv+b2cFgvOMQAr+S8eCDzijy2z4MENBTr/q6mkKe4NHFGtodP+bjSYEG+GnBEG+EUpAx3Wh/BL2f/sIiSOH9ODB6B847F+apa0OTawmslgGna9/985egGMto9g16EQ4ib1M
-----END PRIVATE KEY-----`;

// --- 工具函式 ---
function encryptAES_CBC_256(data, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES_CBC_256(encData, key, iv) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encData, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        return result || null;
    } catch (e) {
        return null;
    }
}

function signData(data, privateKey) {
    const rsa = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return rsa.sign(md);
}

function getCurrentTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return {
        tradeNo: `Batch${yyyy}${MM}${dd}${hh}${mm}${ss}${ms}`,
        tradeDate: `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`,
    };
}

// --- API 調用核心 ---
function callSetPayApi(barCode) {
    return new Promise((resolve, reject) => {
        const { tradeNo, tradeDate } = getCurrentTime();
        const amount = "36"; // 測試交易金額

        const data = {
            PlatformID: "10000266",
            MerchantID: "10000266",
            Ccy: "TWD",
            TxAmt: amount,
            ItemAmt: amount,
            NonRedeemAmt: "0",
            NonPointAmt: "0",
            StoreId: "217477",
            StoreName: "見晴",
            PosNo: "01",
            OPSeq: tradeNo,
            OPTime: tradeDate,
            PaymentNo: "038",
            Remark: "BatchTest",
            ReceiptPrint: "N",
            // 修正點：補出品項細節以通過 2057 金額檢核
            Itemlist: [
                {
                    ItemName: "測試商品",
                    Quantity: "1",
                    UnitAmt: amount,
                    SubAmt: amount
                }
            ],
            BuyerID: barCode,
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
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    if (jsonResponse.EncData) {
                        const decryptedStr = decryptAES_CBC_256(jsonResponse.EncData, AES_Key, AES_IV);
                        if (decryptedStr) {
                            const decryptedJson = JSON.parse(decryptedStr);
                            decryptedJson.RtnCode = decryptedJson.RtnCode || jsonResponse.RtnCode;
                            decryptedJson.RtnMsg = decryptedJson.RtnMsg || jsonResponse.RtnMsg;
                            resolve(decryptedJson);
                        } else {
                            resolve({ RtnCode: jsonResponse.RtnCode, RtnMsg: "解密失敗", raw: jsonResponse });
                        }
                    } else {
                        resolve({ RtnCode: jsonResponse.RtnCode, RtnMsg: jsonResponse.RtnMsg });
                    }
                } catch (e) {
                    reject(new Error("JSON Parsing Error: " + responseData));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(`EncData=${encodeURIComponent(encdata)}`);
        req.end();
    });
}

// --- 執行邏輯 ---
async function runBatchPayment() {
    try {
        if (!fs.existsSync('barcodes.txt')) {
            console.log("❌ 找不到 barcodes.txt");
            return;
        }

        const content = fs.readFileSync('barcodes.txt', 'utf8');
        const barcodeRegex = /IC[A-Z0-9]+/g;
        const barcodes = content.match(barcodeRegex);

        if (!barcodes) {
            console.log("❌ 檔案中沒有發現有效的 IC 條碼");
            return;
        }

        console.log(`🚀 開始批次扣款 (共 ${barcodes.length} 筆)...`);
        let summary = `Batch Report - ${new Date().toLocaleString()}\n`;
        summary += `--------------------------------------------------\n`;

        for (let i = 0; i < barcodes.length; i++) {
            const code = barcodes[i];
            process.stdout.write(`[${i + 1}/${barcodes.length}] 正在處理: ${code} ... `);

            try {
                const result = await callSetPayApi(code);

                if (result.RtnCode == 1) {
                    console.log(`✅ 成功! BankSeq: ${result.BankSeq}`);
                    summary += `SUCCESS | ${code} | BankSeq: ${result.BankSeq} | OPSeq: ${result.OPSeq}\n`;
                } else {
                    const reason = result.RtnMsg || "未知錯誤";
                    console.log(`❌ 失敗 (${result.RtnCode}): ${reason}`);
                    summary += `FAILED  | ${code} | Code: ${result.RtnCode} | Msg: ${reason}\n`;
                }
            } catch (err) {
                console.log(`⚠️ 異常: ${err.message}`);
                summary += `ERROR   | ${code} | Exception: ${err.message}\n`;
            }

            // 稍微停頓 800ms，模擬真實間隔也避免過快請求
            await new Promise(r => setTimeout(r, 800));
        }

        fs.writeFileSync('marketpaymentrefund.txt', summary);
        console.log(`\n📄 全部處理完成，結果已存入 marketpaymentrefund.txt`);

    } catch (err) {
        console.error("程式崩潰:", err);
    }
}

runBatchPayment();