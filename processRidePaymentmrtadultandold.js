const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 靜態設定區 ---
// 注意: 此處的 config 來自北捷的設定，若要用於市公車，需替換為市公車的設定
const config = {
    aesKey: 'T76LqZlcVGJnsxdHxZD73LvOtYsajcY6',
    aesIV: 'KBQAKeKKXXYe9mMp',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAuJ789Fnv1/7jTeqbrlSr33cnnJkbvu5ef+XP+3XymI0/+05dlXn7Cs2OxEeC6LzZvFl4XFJuyMUovhdousJPu8DvpuIz3IBdJksKlTngFBC4il+5VB9oAUvsnVR3f+eN7wvCY6wnBHdWLHisFr83Cn2IKFWDT/rHDiTZjPVqTXNRu+ldkKyRSQlX3fNrkh3xGESM7vD6GYB/dcG7+7dx+pYJfNihgnw9oJF4NGkck5aPp7BdDWUfSGfDDPqosIxfKKPiUUK9/llAVvXa3TGRXY1L+9G4EJunYFobjC04ahoOmLvf/nCs50N5xibxL0mnubR5sCB03Ed1FIH0eVReUwIDAQABAoIBAB3GtrGKV96UY4DLl/RT/6x5AVCGeS0gMOmb3SGHcmscTPdxOjLDi7PAV4hcqEZ1PwDbxUfOm8OR2PJfwCpu8IEtqvlVflvP8DYe4EQVI4jY8YqPycpBjnq3DiCJ4QQmCoRFd0KwH1LfFGzzwX2htXThrjYjJJyfq78iPlw3sL9w1Y6gH5ZEpk8tY9qxyC+dR4BlZB3IGRmp/IReiAORfFX3qCuJQJuHju8MhzU57XlGtxZZPE9OBFBwkw69oulzJoJdx1LFR7WCUdu1/du7v6FcyjpWoZoFE/a4njNdhMHB/U9rOMS2N4DzqpPeqzzIhuXyO1ZdW5LQjgW3h9RHrAECgYEAxjUxa2rC/HymGXGISfWHZ6E/YJluqaEC/UJf+QcoMWqs0Mpu2Xflpo57HUgqQac6qns42bDTmVkQvWizsROF6htth/J7BZN30VM9SpDhHhZzhdzqyWxozKU7C19IcadONIdsMur5BilqCtiaTWUTArRccNlzoj0CuekOmy24dwECgYEA7nOkLXnyxUo9Sof9M7GsBFBkiYCQ6+rHqg6wLMrE0/mnSu31bXEIXK/duUm0i4CsrsA/ENa5QJuRQgNlAgBfPzL83QuYh3ma+GMBCe9ej7uieodQ0j2KPR2JBnzr8UJqOK7rNYe+2fY0OCeY9wV1xLBB9rU8QIaoiyj9s5cWyVMCgYEAm/IAFv6huRutZ7levKn0RgGlJrCxU7795hsR/ZG2+uJuY7vR6UIfKqNRlCFSNeOIEdfvS7+HTFC6DfxR3NF6fE3mKJ8MUb/L9qLiR0ekBxMtAzZkd+PWtKSPxwvJqLo0mrmt1IXxNfrhlvUCuj/67BbR4GwGQbB086a9OjSHvQECgYEAwKeiIDQFF62Rs6QHyTpltt6VPBsp+9InG5jecnIpcPKmXX3A63mFvg1BYTDRtFx0KISe76Xs6uxGAkXn2CQg0FkLwDRcOijgMosbDcHebta0wbaOcC7Uf+hbC2jm4Hg+himdVBSm+EdZjX1As2Qv8IhP41ouohuqFTU7NVx/Ro0CgYAhomZRc8cM+D8QXty2DauoYtNrFqOzH7sg2NXxREcy5tbwLaOA6ZhGn30XP0reQYRWo2TAlo1cwfMLixyINqTybJHDuNaLuFMCcCFZgI1i60FIPBgSgJIih9+KtP0fBkoQn5CBcpT/pNchySZlUkvC8Ojb+YASxwCE4BBuDOrGug==
-----END PRIVATE KEY-----`,
    encKeyID: '261418',
    apiHost: 'icp-payment-stage.icashpay.com.tw',
    apiPath: '/api/V2/Payment/Traffic/DoPayment',
    merchantId: '10526420', // Taipei MRT merchant ID
    terminalId: 'TAIPEI_MRT_TERMINAL_001' // Taipei MRT terminal ID
};


// --- Part 1: 解析函式 (無變動) ---

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
            value: value,
            value_str: value.toString('utf8')
        });
        pos += length;
    }
    return result;
}

// --- 【修改】: 此函式現在會同時提取 orgQrcode 和身份識別 Tag ('44') ---
function extractDataFromTLV(tlvData) {
    console.log("\n2. 從TLV中提取交易資料...");
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

    const orgQrcodeItem = nestedTlvData.find(item => item.tag === '46');
    const personalProfileItem = nestedTlvData.find(item => item.tag === '44');

    if (!orgQrcodeItem) {
        console.log("錯誤: 未能在 Tag 54 的巢狀結構中找到 Tag '46' (orgQrcode)。");
        return null;
    }
     if (!personalProfileItem) {
        console.log("警告: 未能在 Tag 54 的巢狀結構中找到 Tag '44' (身份別)。將預設為一般票。");
    }

    const result = {
        orgQrcode: orgQrcodeItem.value_str,
        personalProfile: personalProfileItem ? personalProfileItem.value_str : '1' // 若找不到則預設為 '1'
    };

    console.log(`成功提取 orgQrcode: ${result.orgQrcode}`);
    console.log(`成功提取 Personal Profile (Tag 44): ${result.personalProfile}`);

    return result;
}


// --- Part 2: 交易紀錄建立函式 ---

// 建立【一般成人】票的交易紀錄
function buildTransactionRecordForAdult(orgQrcode) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const entryTimestamp = timestamp;
    const exitTimestamp = new Date(now.getTime() + 15 * 60 * 1000) // 假設 15 分鐘後出場
        .toISOString().replace(/[-:T]/g, '').slice(0, 14);

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: `TR${timestamp}${Math.floor(Math.random() * 10000)}`.padEnd(20, '0'),
            merchantId: config.merchantId,
            consumptionType: "1",
            transactionType: "2",
            terminalId: config.terminalId,
            merchantType: "2",
            currency: "TWD",
            originalAmount: 30,
            discountAmount: 0,       // 無優惠
            transactionAmount: 30,   // 全額扣款
            discountInfo: [],        // 無優惠資訊
            transactionDatetime: exitTimestamp,
            stationNo: "BL23",
            stationName: "台北101/世貿",
            stationName2: "Taipei 101/World Trade Center",
            entryStationNo: "BL12",
            entryStationName: "台北車站",
            entryStationName2: "Taipei Main Station",
            entryDatetime: entryTimestamp,
            exitStationNo: "BL23",
            exitStationName: "台北101/世貿",
            exitStationName2: "Taipei 101/World Trade Center",
            exitDatetime: exitTimestamp,
            txnPersonalProfile: "0", // "0" 代表一般成人
            penalty: 0,
            advanceAmt: 0,
            personalUsePoints: 0,
            personalCounter: 0,
            shiftStart: timestamp,
        },
        qr80: "",
        qr8A: ""
    };
}

// 建立【敬老票】的交易紀錄
function buildTransactionRecordForSenior(orgQrcode) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const entryTimestamp = timestamp;
    const exitTimestamp = new Date(now.getTime() + 15 * 60 * 1000) // 假設 15 分鐘後出場
        .toISOString().replace(/[-:T]/g, '').slice(0, 14);

    // 假設原始票價 30 元，敬老票折扣 15 元
    const originalAmount = 30;
    const discountAmount = 15;
    const transactionAmount = originalAmount - discountAmount;

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: `TR${timestamp}${Math.floor(Math.random() * 10000)}`.padEnd(20, '0'),
            merchantId: config.merchantId,
            consumptionType: "1",
            transactionType: "2",
            terminalId: config.terminalId,
            merchantType: "2",
            currency: "TWD",
            originalAmount: originalAmount,
            discountAmount: discountAmount,
            transactionAmount: transactionAmount,
            discountInfo: [{ typeId: "302", amount: discountAmount }], // 假設 302 為敬老優惠
            transactionDatetime: exitTimestamp,
            stationNo: "BL23",
            stationName: "台北101/世貿",
            stationName2: "Taipei 101/World Trade Center",
            entryStationNo: "BL12",
            entryStationName: "台北車站",
            entryStationName2: "Taipei Main Station",
            entryDatetime: entryTimestamp,
            exitStationNo: "BL23",
            exitStationName: "台北101/世貿",
            exitStationName2: "Taipei 101/World Trade Center",
            exitDatetime: exitTimestamp,
            txnPersonalProfile: "2", // "2" 代表敬老
            penalty: 0,
            advanceAmt: 0,
            personalUsePoints: 0,
            personalCounter: 0,
            shiftStart: timestamp,
        },
        qr80: "",
        qr8A: ""
    };
}


// --- 加密與簽章函式 (無變動) ---

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
        const extractedData = extractDataFromTLV(tlvData);
        if (!extractedData) throw new Error("無法從 QR Code 提取必要資料");

        let transactionRecord;

        // --- 【核心邏輯】: 根據 personalProfile 決定要建立哪種交易紀錄 ---
        if (extractedData.personalProfile === '4') {
            console.log("\n身份別判斷: 敬老票 (Tag '44' value: 4)。建立敬老票優惠交易。");
            transactionRecord = buildTransactionRecordForSenior(extractedData.orgQrcode);
        } else {
            console.log(`\n身份別判斷: 一般票 (Tag '44' value: ${extractedData.personalProfile})。建立一般票交易。`);
            transactionRecord = buildTransactionRecordForAdult(extractedData.orgQrcode);
        }
        // -----------------------------------------------------------

        console.log('\n3. 建立交易紀錄:', JSON.stringify(transactionRecord, null, 2));

        // 注意：根據 API 文件，request body 中的 record 物件應為未加密的 JSON 物件。
        // encryptedData 僅為過程驗證，實際並未發送。
        const encryptedData = encryptAES(JSON.stringify(transactionRecord), config.aesKey, config.aesIV);
        console.log('\n4. 加密後的交易資料 (此步驟資料僅供參考，未發送到API):', encryptedData.substring(0, 100) + '...');

        const qr43 = "1234567890123456"; // 應替換為實際的虛擬卡號
        const transDate = transactionRecord.terminalPosParam.transactionDatetime;
        const amount = transactionRecord.terminalPosParam.transactionAmount;
        const qr80 = transactionRecord.qr80 || "010203040506070809";
        const qr8A = transactionRecord.qr8A || "0102030405060708";
        const paymentMAC = generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, config.privateKey);
        console.log('\n5. 生成的支付 MAC:', paymentMAC);

        const requestData = {
            record: transactionRecord, // 發送未加密的 record
            sign: paymentMAC
        };

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
        if (error.message.includes('請求超時')) {
            console.log('\n====================');
            console.log('⏳ 請求已送出，等待伺服器最終確認...');
            console.log('伺服器未在30秒內回傳確認訊息。交易可能已成功，請稍後於系統後台查詢交易狀態。');
            console.log('====================');
        } else {
            console.error('\n[主流程錯誤] 支付處理異常:', error.message);
        }
    }
}

// --- 程式進入點 ---
const qrDataFromScanner = process.argv[2];

if (!qrDataFromScanner) {
    console.error("錯誤: 請提供掃描的 Base64 字串作為參數。");
    console.log("用法: node processRidePayment.js <掃描的Base64字串>");
} else {
    processPayment(qrDataFromScanner);
}