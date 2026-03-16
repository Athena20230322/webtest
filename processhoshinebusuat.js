const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 靜態設定區 (更新為 Preprod 環境資訊) ---
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

// --- Part 1: 解析與解碼 ---
function base64Decode(encodedData) {
    try {
        encodedData = encodedData.trim();
        while (encodedData.length % 4 !== 0) { encodedData += '='; }
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
            length: length,
            value: value,
            value_str: value.toString('utf8')
        });
        pos += length;
    }
    return result;
}

function extractDataFromTLV(tlvData) {
    const tag54Item = tlvData.find(item => item.tag === '54');
    if (!tag54Item) return { orgQrcode: null, qr43: null };

    const nestedTlvData = parseTLV(tag54Item.value);
    // V2 交通 API 通常將 QR 交易序號放在 Tag 46
    const orgQrcode = nestedTlvData.find(item => item.tag === '46')?.value_str ||
                      nestedTlvData.find(item => item.tag === '01')?.value_str;
    const qr43 = nestedTlvData.find(item => item.tag === '43')?.value_str;

    return { orgQrcode, qr43 };
}

// --- Part 2: 交易建構與簽章 ---

function buildTransactionRecord(orgQrcode) {
    const now = new Date();
    const ts = now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');

    // 產生 20 位的 RecordId (MerchantId + 隨機數)
    const recordId = `${config.merchantId}${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`;

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: recordId,
            merchantId: config.merchantId,
            consumptionType: "1",
            transactionType: "110", // 交通扣款標準代碼
            terminalId: config.terminalId,
            terminalMfId: config.terminalId,
            merchantType: "3",
            currency: "TWD",
            originalAmount: 30,
            discountAmount: 0,
            transactionAmount: 30,
            discountInfo: null,
            transactionDatetime: ts,
            stationNo: "BL23",
            stationName: "台北101/世貿",
            entryStationNo: "BL12",
            entryStationName: "台北車站",
            entryDatetime: ts,
            exitStationNo: "BL23",
            exitStationName: "台北101/世貿",
            exitDatetime: ts,
            txnPersonalProfile: "1",
            penalty: "0",
            advanceAmt: 0,
            personalUsePoints: "0",
            personalCounter: "0",
            shiftStart: ts,
            extendParameters: {
                issueId: 3,
                parameters: [
                    { name: "entryExitFlag", value: "1" }
                ]
            }
        },
        qr80: null,
        qr8A: null
    };
}

function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    try {
        const safeQr80 = qr80 || "";
        const safeQr8A = qr8A || "";
        const amountStr = amount.toString().padStart(8, '0');
        const signData = `${qr43}${transDate}${amountStr}${safeQr80}${safeQr8A}`;

        const md = forge.md.sha256.create();
        md.update(signData, 'utf8');
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const signature = privateKey.sign(md);

        // 交通 API 簽章長度通常取 Base64 前 20 位
        return forge.util.encode64(signature).slice(0, 20);
    } catch (error) {
        throw new Error('生成支付MAC失敗: ' + error.message);
    }
}

// --- Part 3: 主流程 ---

async function processPayment(qrDataString) {
    try {
        console.log(`--- [Preprod] 開始處理支付交易 ---`);

        const decodedData = base64Decode(qrDataString);
        if (!decodedData) throw new Error("Base64 解碼失敗");

        const tlvData = parseTLV(decodedData);
        const { orgQrcode, qr43 } = extractDataFromTLV(tlvData);

        if (!orgQrcode) throw new Error("提取 orgQrcode (Tag 46) 失敗");

        const transactionRecord = buildTransactionRecord(orgQrcode);
        const params = transactionRecord.terminalPosParam;

        // 若 QR 資料內沒有 Tag 43，嘗試用設定檔的 TerminalId (依照實際測試調整)
        const finalQr43 = qr43 || config.terminalId;

        const paymentMAC = generatePaymentMAC(
            finalQr43,
            params.transactionDatetime,
            params.transactionAmount,
            transactionRecord.qr80,
            transactionRecord.qr8A,
            config.privateKey
        );

        const requestData = {
            record: transactionRecord,
            sign: paymentMAC,
            Timestamp: Math.floor(Date.now() / 1000),
            PlatformID: "",
            MerchantID: config.merchantId,
            DeviceID: config.terminalId
        };

        console.log(`交易 RecordId: ${params.recordId}`);
        console.log(`簽章 MAC: ${paymentMAC}`);

        const response = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestData);
            const options = {
                hostname: config.apiHost,
                port: 443,
                path: config.apiPath,
                method: 'POST',
                headers: {
                    'X-iCP-EncKeyID': config.encKeyID,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                rejectUnauthorized: false // 跳過測試環境可能的憑證問題
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error("伺服器返回非 JSON: " + data)); }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('\nAPI 回應內容:', JSON.stringify(response, null, 2));

        const code = response.RtnCode !== undefined ? response.RtnCode : response.rc;
        if (code == '0000' || code == '00000' || code == 0) {
            console.log('\n✅ 支付成功');
        } else {
            console.log(`\n❌ 支付失敗: ${response.RtnMsg || response.rm} (代碼: ${code})`);
        }

    } catch (error) {
        console.error('\n[執行錯誤]:', error.message);
    }
}

// 執行
const qrDataFromScanner = process.argv[2];
if (!qrDataFromScanner) {
    console.error("用法: node script.js <Base64_QR_Data>");
} else {
    processPayment(qrDataFromScanner);
}