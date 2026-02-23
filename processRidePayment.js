const http = require('http');
const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 測試環境切換開關 ---
const useLocalMock = false;

const config = {
    aesKey: 'XGYX4IpxRqA06fyNRairC84bEWaeiuTS',
    aesIV: 'HDm8VtQAbJopj6m0',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAyG2eMFbTT3F72l2hPeNcApoIbVcxUSPayarOcx1+aeEqFmy9zP5709WxO59tjb9ibX39sg6GPSWtJmtmZwF79/DbOdhaVKbCmbrxzyqo3xheQ90mIvtXLrOmomty8ItA70lYs0LFijKNBG5pZ4K3kjy2GntnlAuB8X3NmHtyH3O9/jrSswgUXV3oy38tVonOmizRV0A7sDeI0qOKTFpJpQ+exAbQJOLyR9R9712clP8fuDeKcRtvkBG8iWE9I1bDjelfjn+XVPwumizxb7PktAvFwAEKxvjgbIoGOGdfOiIKXOO3qtixLv/ZDpiqg8FfNDrx+YLTzUH0mtNdaDoC3wIDAQABAoIBAAIYbJ91FkIjMxgeLiSJ/yPDKCm7JXeuMsg0ohzqUYXaMJ5Ju8BBZtpY8RXo/Z8OQawDCwcfXMBAkmtaPcNU7M6zn28e4m7hIXFfAXkuKSl6mpMGDwiC7S8+pJQtIGdVurOQZj4q3rV/qswW5WuLc8+Hv/WjQFAiwKndgVaXRSMBW4hSgmp4jyrN3Nqyef8T/vlFsHy5Vk5pQBQlMsov8TRujBkpN+a1ijMiCOZsaLirfgtWgGMkay957LH9IGmwcxM0u+nX4yqet/2yQOXOlWRS4KVGNEAxx+jLFKA5430Z1aEVHCYvzqEOGMChvOWT2xifu6QBuST/MZDEXYwXSM0CgYEA3DwGAXxSI995vdtkMzQuSCuSGdUGkzKn+WiEndDehvIS3tFD9uNxuj3KqLAXCf8V+O65XcGZSfUTfeRsGxFldbwoCGaYa331OeD0mRZju0eR8bmeRelYuJzxzdXTXtXQaoyJJyqkFfnX+cqanmBhO4ay5YHG7+d46VNbNTHIX00CgYEA6PosUk+RBdb9w7sc5cA4QoSGgY0gTVsqX0FKmcQBf63pT0hkLArKHXJhf+NPHKzfG6Q8tHJuCP/lFcOZgWo7vqkJ17fzP5PQ/KnvM+WuXgQR2HOqvvzf0ijFlZ27JxEQpqHvHv4ivaIcDNNYlIU8JL54kZPuhejFyFn9bRoMbNsCgYAJ1E/8Tv0nhrjbRWhydJjANdmed4iEl1Ux531Lwd+8rB81fKeI5FvWER3za3CLzKvBYX46dgKOb3bAPqqohp09pPkwbsvMuGFyhNzF3F71I9uaq0sqGaERFEgihLGbYPWdW8pfSiLqrCz8hBNkkC6mxntDjQhA+tbFqye99wvXXQKBgQCOFQQyrpOjHBpm5BYbh77H0kq1d3vbsV2F+iuk2wSO+WDwGRX+RhY9HySW+emlc0gdc2wSIDc7BdSQEVnssvz8qdp21JhkjaFGddyLqedNLu4zM1dOYqmdYYAeXrNkf+PHu7o5DIPjYpn4uGutKBQl1INzROSShgMYzMjhYKFzQQKBgQCycC1LMsAMc6Sa8Cy552lOY8xadq6j3SWR/ntl8flqv7n8HzVGMG7T+gSMfYDqHHupuOoQKpsDd/RCnr+07VbIG2oBHw0pUqSc5A25YcmLnA2UozKzZTUxE/we1VbDQSP1m4tp97xcjUG1+h4NnTTJviQ/xrqRBBuRCAYbChppIQ=
-----END PRIVATE KEY-----`,
    encKeyID: '234076',
    apiHost: useLocalMock ? '127.0.0.1' : 'icp-payment-stage.icashpay.com.tw',
    apiPath: '/api/V2/Payment/Traffic/DoPayment',
    port: useLocalMock ? 8000 : 443,
    merchantId: '10524012',
    terminalId: 'A01630526'
};

// --- Part 1: 工具函式 ---

// AES-256-CBC 加密
function encryptAES(data, key, iv) {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc',
            Buffer.from(key, 'utf8'),
            Buffer.from(iv, 'utf8'));
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (error) {
        console.error('AES加密失敗:', error);
        throw error;
    }
}

function base64Decode(encodedData) {
    try {
        encodedData = encodedData.trim();
        while (encodedData.length % 4 !== 0) encodedData += '=';
        return Buffer.from(encodedData, 'base64');
    } catch (e) { return null; }
}

function parseTLV(data) {
    const result = [];
    let pos = 0;
    while (pos < data.length) {
        if (pos + 2 > data.length) break;
        const tag = data[pos];
        const length = data[pos + 1];
        pos += 2;
        if (pos + length > data.length) break;
        const value = data.slice(pos, pos + length);
        result.push({
            tag: tag.toString(16).padStart(2, '0'),
            length,
            value,
            value_str: value.toString('utf8')
        });
        pos += length;
    }
    return result;
}

function extractOrgQrcodeFromTLV(tlvData) {
    const tag54Item = tlvData.find(item => item.tag === '54');
    if (!tag54Item) return null;
    const nestedTlvData = parseTLV(tag54Item.value);
    const found = nestedTlvData.find(item => item.tag === '46' || item.tag === '01');
    return found ? found.value_str : null;
}

// --- Part 2: 交易電文與簽章 ---

function buildTransactionRecord(orgQrcode, terminalId) {
    const now = new Date();
    const ts = now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');

    const vendorPrefix = terminalId.charAt(0);
    const mfId = `${vendorPrefix}01630526`.slice(0, 10);

    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const recordId = `${terminalId}${ts.slice(8)}${randomSuffix}`.padEnd(20, '0');

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: recordId,
            merchantId: config.merchantId,
            consumptionType: "1", // 1: 扣款
            transactionType: "1", // 1: 段次扣款 (根據您的原程式碼註解)
            terminalId: terminalId,
            terminalMfId: mfId,
            terminalSwVersion: "M3.3",
            sdkVersion: "1005",
            merchantType: "3", // 3: 市區公車
            currency: "TWD",
            originalAmount: 50.0,
            discountAmount: 30.0,
            transactionAmount: 20.0,
            discountInfo: [
                { typeId: "23", amount: 20.0 } // 23: 轉乘優惠
            ],
            transactionDatetime: ts,
            stationNo: "ST001",
            stationName: "台北車站",
            stationName2: "Taipei Main Station",
            lbsInfoX: "121.517055",
            lbsInfoY: "25.047743",
            txnPersonalProfile: "0",
            penalty: 0,
            advanceAmt: 0.0,
            personalUsePoints: 0,
            personalCounter: 0,
            shiftStart: ts
        },
        qr80: "0102030405060708090", // 示例值
        qr8A: "0102030405060708",    // 示例值
        qr67: ""
    };
}

/**
 * 生成支付MAC簽名 (SHA256withRSA)
 * 簽章內容：QR43 + TransDate + Amount(8位補零) + QR80 + QR8A
 */
function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    try {
        const formattedAmount = Math.floor(amount).toString().padStart(8, '0');
        const signData = `${qr43}${transDate}${formattedAmount}${qr80}${qr8A}`;

        const md = forge.md.sha256.create();
        md.update(signData, 'utf8');
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const signature = privateKey.sign(md);

        // 返回 Base64 處理後的特定長度 (依規格書取前 20 碼或完整編碼)
        return forge.util.encode64(signature).slice(0, 20);
    } catch (error) {
        console.error('生成支付MAC失敗:', error);
        throw error;
    }
}

// --- Part 3: 主執行流程 ---

async function processPayment(qrDataString, terminalId) {
    try {
        // 1. 解析 QR Data 並提取交易序號
        const decodedData = base64Decode(qrDataString);
        if (!decodedData) throw new Error("Base64 解碼失敗");

        const tlvData = parseTLV(decodedData);
        const orgQrcode = extractOrgQrcodeFromTLV(tlvData);
        if (!orgQrcode) throw new Error("無法從 TLV 提取 orgQrcode");

        // 2. 構建交易記錄 (Record Struct)
        const transactionRecord = buildTransactionRecord(orgQrcode, terminalId);
        const params = transactionRecord.terminalPosParam;

        // 3. 生成簽章 (ICP_Gen_PaymentMAC)
        const qr43 = "1234567890123456"; // 應為實際讀取的虛擬卡號
        const paymentMAC = generatePaymentMAC(
            qr43,
            params.transactionDatetime,
            params.transactionAmount,
            transactionRecord.qr80,
            transactionRecord.qr8A,
            config.privateKey
        );

        // 4. 封裝 Request JSON
        const requestData = {
            record: transactionRecord,
            sign: paymentMAC
        };
        const postData = JSON.stringify(requestData);

        // 5. 設定 HTTPS 請求
        const options = {
            hostname: config.apiHost,
            port: config.port,
            path: config.apiPath,
            method: 'POST',
            headers: {
                'X-iCP-EncKeyID': config.encKeyID,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false // 針對 stage 環境通常需忽略自簽憑證檢查
        };

        console.log('--- 準備發送交易 ---');
        console.log('RecordId:', params.recordId);
        console.log('orgQrcode:', orgQrcode);

        // 6. 發送請求
        const response = await new Promise((resolve, reject) => {
            const lib = useLocalMock ? http : https;
            const req = lib.request(options, (res) => {
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error("伺服器回應格式非 JSON")); }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        // 7. 處理伺服器響應
        console.log('伺服器響應:', JSON.stringify(response, null, 2));

        const rc = response.RtnCode !== undefined ? response.RtnCode : response.rc;
        const rm = response.RtnMsg || response.rm;

        if (rc === 0 || rc === '00000' || rc === '0000') {
            console.log('✅ 支付成功！');
            if (response.transactionInfo) console.log('交易序號:', response.transactionInfo.transactionNo);
        } else {
            console.log(`❌ 支付失敗: ${rm} (代碼: ${rc})`);
            if (rc === '-170407') console.error('建議檢查: Private Key 與簽章 signData 組成是否正確');
        }

    } catch (error) {
        console.error('[執行異常]:', error.message);
    }
}

// --- 程式進入點 ---
const inputQr = process.argv[2];
const inputTid = process.argv[3] || config.terminalId;

if (inputQr) {
    processPayment(inputQr, inputTid);
} else {
    console.log("用法: node processRidePayment.js <Base64_QR_Data> [TerminalId]");
    console.log("範例: node processRidePayment.js WlhsS05ERXpPVEU1T0RreU1UQXdNREU9IDExMjIyMzMz");
}