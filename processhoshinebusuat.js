const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 靜態設定區 ---
const config = {
    aesKey: '56KlahuGDxTQqpMzVZJs3wVwXTA1Ct3x',
    aesIV: '674sxL3VMsCwUQIW',
    privateKey: `-----BEGIN PRIVATE KEY-----
    MIIEpQIBAAKCAQEAsD6lfChr6UTPxf1LSwqJ8U6RsIdxwpMhL9SBKWE8DNIGH+FODfYywtR8X+8MTLWrdQajk7Kuhky5s2NYX/nIP0vl01BxO+2zNUT6Lnjeyo6XcollQplk9HMNxXzQV5y4Oh7UY81zylxNZO5jIQBrviCbHBCeROXZIf6jvEcMCcSxNE7tStAE3G93z2ZBI6dFYGefZpgG6QIzt8EbLxhQDuy5vtQw4OyaozBYyoWZOzYIDJL+6A5kRPHrqxQbc09LbJzYmsInwsvXbh+9l9msESS4zPXTXVOMwk+ZKBGJyzZVNq5Qk47q6bpwBkqCZRHFqEb7if49ZMwhvNbZqU0pwwIDAQABAoIBAAHX7egyDgrnFttFzntO9WlqPnjfuc9ktZSn/t/dbgDeU4US2LuppxdFnLVuLS1COzRiqORbGps6Azk+oUaDuNX8p79BmKWdU2ILwigpSH9K5Yejq0T6kMVDzNGTgCRidcTZ3LPciskDlSWonq3SMM5Qzf6Jp/Ylh1NlM/Y8sgIKIbLrb/5Bn+00U8eHBT82bviJkaZNEun8VSr31S1Yo+6rW4JXr2GnWgBQpkYyWrKeXAszfdXyZzsJWcfanTkpGH+0ownt63aX9QY/LDuS15WBDTdmVyPKWpobG+mcbwmmCQYwlsmupgYrl229HLDzgZIXuYh5yzZECBNOMf71WWkCgYEA4QT+OcwFMeEKq3Xs1KK7HEHdSNAP/8PST5FrR+SdFVf/lH/DqZr6qFRK/uTgQJHt9VeHrZi9hCjQSrSn8/PyYfEqNAIoTnAVjvdVCU+1buY6aY4YKBZbEUqmwbESdTpNzKNd5QOtSfOn3YHcccnbG27Sul061Z85vHO7u+AbvhkCgYEAyIKLLbpQQ6QZLj9oVFQ6VHNMdmE7NB+uD1uNOnuof9+1/rTQxYNKZXSO3Tjgk9z7pFR+g2AILFDxtW0IOkEQe2N/D/Aww0jYaODHKgNmGBEYuMNrYOlseox+crzjk4IhO79WxvS8lISv8c96ajXvU+uqi2qiSPCdSPbYh5oCajsCgYEAyWhStSDsNW0cw8PVq63MlMpPavDwoRmBkT60K7Fw+L2/Qgfp9lGFsk1goy3xm1oDB+rEwplIaJaveW6iNjVP6mKWR972fN7OLR0svBzgZNclyX0qGheIg72x7QS1ZMA/Cr/fNzFHVj4FLrshuafXuoJDlBQGqVbPsuJUUyGRM2ECgYEAhFtP/j53jz76dEHc35W971MwzQ//4bdr0a1we4N3RfnpjBnVmhvBd1lKmRNbg5+i6OXxoU059+7yrv0rKjEa7ShPjrjRp4cle42tSrl1ojte40/0SMOtHPQy4BB59Tw4LdVvNeQFu9AeyHNZ7lRuCCqPqHoaaCWU3b48Tr7GC1MCgYEA4It5chdaaI70l+aKq8djoJVzgUAn8D6PEl3WierPLGGP8JklgbwpGQpNxTfZVt4zDHqllRqhqN40CoIDtECwD8XhIDiCSCXAUrsp3he7fVS1y4EQlK4zPbqCoE9j3mlvi8O8+Faeqgh2BNm9MitXE4sQAKbuKXgJSRSICKkmo3s=
-----END PRIVATE KEY-----`,
    encKeyID: '214718',
    apiHost: 'icp-payment-preprod.icashpay.com.tw',
    apiPath: '/api/V2/Payment/Traffic/DoPayment',
    merchantId: '10554405',
    terminalId: 'TAIPEI_MRT_TERMINAL_001'
};

// --- Part 1: 解析函式 ---
function base64Decode(encodedData) {
    console.log("\n1. Base64解碼...");
    try {
        encodedData = encodedData.trim();
        while (encodedData.length % 4 !== 0) { encodedData += '='; }
        return Buffer.from(encodedData, 'base64');
    } catch (e) {
        console.log(`解碼錯誤: ${e.message}`);
        return null;
    }
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
            length: length,
            value: value,
            value_str: value.toString('utf8')
        });
        pos += length;
    }
    return result;
}

function extractDataFromTLV(tlvData) {
    console.log("\n2. 解析 QR 資料 (TLV)...");
    const tag54Item = tlvData.find(item => item.tag === '54');
    if (!tag54Item) return { orgQrcode: null, qr43: null };

    const nestedTlvData = parseTLV(tag54Item.value);

    // 【規格修正】：根據規格 V1.0.1，orgQrcode 欄位內容應填入 Qr46 交易序號
    const qr46_serial = nestedTlvData.find(item => item.tag === '46')?.value_str;
    const qr43_vcard = nestedTlvData.find(item => item.tag === '43')?.value_str;

    return { orgQrcode: qr46_serial, qr43: qr43_vcard };
}

// --- Part 2: 交易函式 ---

function buildTransactionRecord(qr46Serial) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

    // 【規格修正】：離線交易唯一序號 recordId (AN 20) [cite: 94, 109]
    const serial = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    const recordId = `${config.merchantId}${serial}`;

    return {
        version: "01.00",
        orgQrcode: qr46Serial, // 【規格修正】：填入 Tag 46 交易序號
        terminalPosParam: {
            recordId: recordId,
            merchantId: config.merchantId,
            consumptionType: "1", // 扣款 [cite: 122]
            transactionType: "2", // 電子票值支付 [cite: 122]
            terminalId: config.terminalId,
            merchantType: "2", // 捷運通路 [cite: 95]
            currency: "TWD",
            originalAmount: 30,
            discountAmount: 0,
            transactionAmount: 30, // 實際扣款金額 [cite: 95]
            discountInfo: [],
            transactionDatetime: timestamp, // yyyyMMddHHmmss [cite: 95]
            stationNo: "BL23",
            stationName: "台北101/世貿",
            stationName2: "Taipei 101/World Trade Center",
            entryStationNo: "BL12",
            entryStationName: "台北車站",
            entryStationName2: "Taipei Main Station",
            entryDatetime: timestamp,
            exitStationNo: "BL23",
            exitStationName: "台北101/世貿",
            exitStationName2: "Taipei 101/World Trade Center",
            exitDatetime: timestamp,
            txnPersonalProfile: "0", // 交易身分別 (M)
            penalty: 0, // (M)
            advanceAmt: 0, // (M)
            personalUsePoints: 0, // (M)
            personalCounter: 0, // (M)
            shiftStart: timestamp // (M)
        },
        qr80: "", // BIN 19 [cite: 65, 89]
        qr8A: ""  // BIN 16 [cite: 65, 89]
    };
}

function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    try {
        // 【規格修正】：簽章原始字串拼接順序
        // Qr43 + transDate + amount(8位補零) + Qr80 + Qr8A
        const signData = `${qr43}${transDate}${amount.toString().padStart(8, '0')}${qr80}${qr8A}`;
        console.log(`[Debug] 簽章原始串: ${signData}`);

        const md = forge.md.sha256.create();
        md.update(signData, 'utf8');
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const signature = privateKey.sign(md);

        // 【規格修正】：ICP 交易驗證資訊(MAC) 長度必須固定為 20 Byte
        const mac = forge.util.encode64(signature).slice(0, 20);
        console.log(`[Debug] 最終簽章(MAC): ${mac}`);
        return mac;
    } catch (error) {
        console.error('生成支付MAC失敗:', error);
        throw error;
    }
}

// --- Part 3: 主執行函式 ---

async function processPayment(qrBase64) {
    try {
        const decodedBuffer = base64Decode(qrBase64);
        if (!decodedBuffer) throw new Error("Base64 解碼失敗");

        const tlvData = parseTLV(decodedBuffer);

        // 提取 Tag 46 (用於 orgQrcode) 與 Tag 43 (用於簽章)
        const { orgQrcode, qr43 } = extractDataFromTLV(tlvData);
        if (!orgQrcode || !qr43) throw new Error(`提取資料失敗: qr46=${orgQrcode}, qr43=${qr43}`);

        const transactionRecord = buildTransactionRecord(orgQrcode);

        // 計算簽章
        const transDate = transactionRecord.terminalPosParam.transactionDatetime;
        const amount = transactionRecord.terminalPosParam.transactionAmount;
        const qr80 = transactionRecord.qr80;
        const qr8A = transactionRecord.qr8A;

        const paymentMAC = generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, config.privateKey);

        const requestData = {
            record: transactionRecord,
            sign: paymentMAC // 此對應電文中的 sign 欄位 [cite: 81]
        };

        console.log("\n3. 發送 DoPayment API 請求...");
        const response = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestData);
            const options = {
                hostname: config.apiHost,
                path: config.apiPath,
                method: 'POST',
                headers: {
                    'X-iCP-EncKeyID': config.encKeyID,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error("API 回應解析失敗")); }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('\n4. 伺服器回應:', response);
        const code = response.RtnCode || response.rc;
        const msg = response.RtnMsg || response.rm;

        // 規格定義 00000 為成功 [cite: 85, 113]
        if (code == '00000' || code == '0000' || code == 0) {
            console.log('\n====================\n✅ 支付成功\n====================');
        } else {
            console.error(`\n====================\n❌ 支付失敗: ${msg}\n錯誤代碼: ${code}\n====================`);
        }

    } catch (error) {
        console.error('\n[主流程錯誤]:', error.message);
    }
}

// 進入點
const qrData = process.argv[2];
if (!qrData) {
    console.error("用法: node script.js <QR_BASE64_STRING>");
} else {
    processPayment(qrData);
}