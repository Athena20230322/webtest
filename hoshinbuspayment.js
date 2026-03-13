const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 靜態設定區 ---
// 所有來自 dopayment2.js 的固定設定都集中在此
const config = {
    aesKey: '56KlahuGDxTQqpMzVZJs3wVwXTA1Ct3x',
    aesIV: '674sxL3VMsCwUQIW',
    privateKey: `-----BEGIN PRIVATE KEY-----
    MIIEpQIBAAKCAQEAsD6lfChr6UTPxf1LSwqJ8U6RsIdxwpMhL9SBKWE8DNIGH+FODfYywtR8X+8MTLWrdQajk7Kuhky5s2NYX/nIP0vl01BxO+2zNUT6Lnjeyo6XcollQplk9HMNxXzQV5y4Oh7UY81zylxNZO5jIQBrviCbHBCeROXZIf6jvEcMCcSxNE7tStAE3G93z2ZBI6dFYGefZpgG6QIzt8EbLxhQDuy5vtQw4OyaozBYyoWZOzYIDJL+6A5kRPHrqxQbc09LbJzYmsInwsvXbh+9l9msESS4zPXTXVOMwk+ZKBGJyzZVNq5Qk47q6bpwBkqCZRHFqEb7if49ZMwhvNbZqU0pwwIDAQABAoIBAAHX7egyDgrnFttFzntO9WlqPnjfuc9ktZSn/t/dbgDeU4US2LuppxdFnLVuLS1COzRiqORbGps6Azk+oUaDuNX8p79BmKWdU2ILwigpSH9K5Yejq0T6kMVDzNGTgCRidcTZ3LPciskDlSWonq3SMM5Qzf6Jp/Ylh1NlM/Y8sgIKIbLrb/5Bn+00U8eHBT82bviJkaZNEun8VSr31S1Yo+6rW4JXr2GnWgBQpkYyWrKeXAszfdXyZzsJWcfanTkpGH+0ownt63aX9QY/LDuS15WBDTdmVyPKWpobG+mcbwmmCQYwlsmupgYrl229HLDzgZIXuYh5yzZECBNOMf71WWkCgYEA4QT+OcwFMeEKq3Xs1KK7HEHdSNAP/8PST5FrR+SdFVf/lH/DqZr6qFRK/uTgQJHt9VeHrZi9hCjQSrSn8/PyYfEqNAIoTnAVjvdVCU+1buY6aY4YKBZbEUqmwbESdTpNzKNd5QOtSfOn3YHcccnbG27Sul061Z85vHO7u+AbvhkCgYEAyIKLLbpQQ6QZLj9oVFQ6VHNMdmE7NB+uD1uNOnuof9+1/rTQxYNKZXSO3Tjgk9z7pFR+g2AILFDxtW0IOkEQe2N/D/Aww0jYaODHKgNmGBEYuMNrYOlseox+crzjk4IhO79WxvS8lISv8c96ajXvU+uqi2qiSPCdSPbYh5oCajsCgYEAyWhStSDsNW0cw8PVq63MlMpPavDwoRmBkT60K7Fw+L2/Qgfp9lGFsk1goy3xm1oDB+rEwplIaJaveW6iNjVP6mKWR972fN7OLR0svBzgZNclyX0qGheIg72x7QS1ZMA/Cr/fNzFHVj4FLrshuafXuoJDlBQGqVbPsuJUUyGRM2ECgYEAhFtP/j53jz76dEHc35W971MwzQ//4bdr0a1we4N3RfnpjBnVmhvBd1lKmRNbg5+i6OXxoU059+7yrv0rKjEa7ShPjrjRp4cle42tSrl1ojte40/0SMOtHPQy4BB59Tw4LdVvNeQFu9AeyHNZ7lRuCCqPqHoaaCWU3b48Tr7GC1MCgYEA4It5chdaaI70l+aKq8djoJVzgUAn8D6PEl3WierPLGGP8JklgbwpGQpNxTfZVt4zDHqllRqhqN40CoIDtECwD8XhIDiCSCXAUrsp3he7fVS1y4EQlK4zPbqCoE9j3mlvi8O8+Faeqgh2BNm9MitXE4sQAKbuKXgJSRSICKkmo3s=
-----END PRIVATE KEY-----`,
    encKeyID: '214718',
    apiHost: 'icp-payment-preprod.icashpay.com.tw',
    apiPath: '/api/V2/Payment/Traffic/DoPayment',
    merchantId: '10524012', // 替換為實際業者代碼
    terminalId: 'YOUR_TERMINAL_ID' // 替換為實際終端編號
};

// --- Part 1: 從 dopayment.js 移植的解析函式 ---

function base64Decode(encodedData) {
    console.log("\n1. Base64解碼...");
    try {
        encodedData = encodedData.trim();
        while (encodedData.length % 4 !== 0) {
            encodedData += '=';
        }
        const decodedData = Buffer.from(encodedData, 'base64');
        console.log(`解碼成功 (長度: ${decodedData.length} 字節)`);
        return decodedData;
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
            value: value, // 保留 Buffer 以便進行巢狀解析
            value_str: value.toString('utf8')
        });
        pos += length;
    }
    return result;
}

function extractOrgQrcodeFromTLV(tlvData) {
    console.log("\n2. 從TLV中提取orgQrcode...");
    const tag54Item = tlvData.find(item => item.tag === '54');
    if (!tag54Item) {
        console.log("錯誤: 在主結構中未找到 Tag 54 的數據");
        return null;
    }

    console.log("--- 正在對 Tag 54 進行巢狀解析 (Debug Info) ---");
    const nestedTlvData = parseTLV(tag54Item.value);
    nestedTlvData.forEach(item => {
        console.log(`  [巢狀] Tag: ${item.tag}, Length: ${item.length}, Value: ${item.value_str}`);
    });
    console.log("------------------------------------------");

    const orgQrcodeItem46 = nestedTlvData.find(item => item.tag === '46');
    if (orgQrcodeItem46) {
        const extractedValue = orgQrcodeItem46.value_str;
        console.log(`成功: 從巢狀 Tag '46' 中提取的 orgQrcode: ${extractedValue}`);
        return extractedValue;
    }

    const orgQrcodeItem01 = nestedTlvData.find(item => item.tag === '01');
    if (orgQrcodeItem01) {
        const extractedValue = orgQrcodeItem01.value_str;
        console.log(`成功: 從巢狀 Tag '01' 中提取的 orgQrcode: ${extractedValue}`);
        return extractedValue;
    }

    console.log("警告: 未能在 Tag 54 的巢狀結構中找到 Tag '46' 或 '01'。");
    console.log("嘗試使用舊的 'F...H+' 格式進行解析...");
    const tag54Value = tag54Item.value_str;
    const startIndex = tag54Value.indexOf('F');
    const endIndex = tag54Value.indexOf('H+');
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const extractedValue = tag54Value.substring(startIndex + 1, endIndex);
        console.log(`成功: 從舊格式中提取的 orgQrcode: ${extractedValue}`);
        return extractedValue;
    }

    console.log("錯誤: 無法從任何已知格式中提取 orgQrcode。");
    return null;
}

// --- Part 2: 從 dopayment2.js 移植的交易函式 ---

function buildTransactionRecord(orgQrcode) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: `TR${timestamp}${Math.floor(Math.random() * 10000)}`.padEnd(20, '0'),
            merchantId: config.merchantId,
            consumptionType: "1",
            transactionType: "1",
            terminalId: config.terminalId,
            merchantType: "3",
            originalAmount: 50,           //原始金額
            discountAmount: 30,           //折扣金額
            transactionAmount: 20,      //實際交易金額
            discountInfo: [{ typeId: "23", amount: 20 }],  //折扣資訊也應對應
            transactionDatetime: timestamp,
            stationNo: "ST001",
            stationName: "台北車站",
            stationName2: "Taipei Main Station",
            lbsInfoX: "121.517055",
            lbsInfoY: "25.047743",
            txnPersonalProfile: "0",
            penalty: 0,
            advanceAmt: 0,
            personalUsePoints: 1,
            personalCounter: 0,
            shiftStart: timestamp,
        },
        qr80: "",
        qr8A: ""
    };
}

function encryptAES(data, key, iv) {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (error) {
        console.error('AES加密失敗:', error);
        throw error;
    }
}

function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    try {
        const signData = `${qr43}${transDate}${amount.toString().padStart(8, '0')}${qr80}${qr8A}`;
        const md = forge.md.sha256.create();
        md.update(signData, 'utf8');
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const signature = privateKey.sign(md);
        return forge.util.encode64(signature).slice(0, 20);
    } catch (error) {
        console.error('生成支付MAC失敗:', error);
        throw error;
    }
}

// --- Part 3: 整合後的主執行函式 ---

async function processPayment(qrDataString) {
    try {
        const decodedData = base64Decode(qrDataString);
        if (!decodedData) throw new Error("Base64 解碼失敗");

        const tlvData = parseTLV(decodedData);
        const orgQrcode = extractOrgQrcodeFromTLV(tlvData);
        if (!orgQrcode) throw new Error("無法從 Tag 54 提取 orgQrcode");

        const transactionRecord = buildTransactionRecord(orgQrcode);
        console.log('\n3. 建立交易紀錄:', JSON.stringify(transactionRecord, null, 2));

        const encryptedData = encryptAES(JSON.stringify(transactionRecord), config.aesKey, config.aesIV);
        console.log('\n4. 加密後的交易資料:', encryptedData);

        const qr43 = "1234567890123456";
        const transDate = transactionRecord.terminalPosParam.transactionDatetime;
        const amount = transactionRecord.terminalPosParam.transactionAmount;
        const qr80 = "010203040506070809";
        const qr8A = "0102030405060708";
        const paymentMAC = generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, config.privateKey);
        console.log('\n5. 生成的支付 MAC:', paymentMAC);

        const requestData = { record: transactionRecord, sign: paymentMAC };

        console.log("\n6. 發送 API 請求...");
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
                res.setEncoding('utf8');
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`API 回應解析失敗: ${e.message}`));
                    }
                });
            });

            req.on('error', reject);

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('請求超時: 伺服器在30秒內沒有回應。'));
            });

            req.write(postData);
            req.end();
        });

        console.log('\n7. 伺服器回應:', response);
         if (response.rc == '00000' || response.rc == 0) {
            console.log('\n====================');
            console.log('✅ 支付成功');
            console.log('交易資訊:', response.transactionInfo);
            console.log('====================');
        } else {
            console.error('\n====================');
            console.error('❌ 支付失敗:', response.rm);
            console.error('錯誤代碼:', response.rc);
            console.error('====================');
        }

    } catch (error) {
        // --- 【***程式碼修改處***】: 判斷是否為超時錯誤 ---
        if (error.message === '請求超時: 伺服器在30秒內沒有回應。') {
            // 如果是超時錯誤，顯示更友善的訊息
            console.log('\n====================');
            console.log('⏳ 請求已送出，等待伺服器最終確認...');
            console.log('伺服器未在30秒內回傳確認訊息。交易可能已成功，請稍後於系統後台查詢交易狀態。');
            console.log('====================');
        } else {
            // 對於所有其他錯誤，顯示原始的錯誤訊息
            console.error('\n[主流程錯誤] 支付處理異常:', error.message);
        }
    }
}

// --- 程式進入點 ---
const qrDataFromScanner = process.argv[2];

if (!qrDataFromScanner) {
    console.error("錯誤: 請提供掃描槍掃描的 Base64 字串作為參數。");
    console.log("用法: node processRidePayment.js <掃描的Base64字串>");
} else {
    processPayment(qrDataFromScanner);
}