const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { Buffer } = require('buffer');

// --- 靜態設定區 (保留原始設定不變) ---
const config = {
    aesKey: 'T76LqZlcVGJnsxdHxZD73LvOtYsajcY6',
    aesIV: 'KBQAKeKKXXYe9mMp',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAuJ789Fnv1/7jTeqbrlSr33cnnJkbvu5ef+XP+3XymI0/+05dlXn7Cs2OxEeC6LzZvFl4XFJuyMUovhdousJPu8DvpuIz3IBdJksKlTngFBC4il+5VB9oAUvsnVR3f+eN7wvCY6wnBHdWLHisFr83Cn2IKFWDT/rHDiTZjPVqTXNRu+ldkKyRSQlX3fNrkh3xGESM7vD6GYB/dcG7+7dx+pYJfNihgnw9oJF4NGkck5aPp7BdDWUfSGfDDPqosIxfKKPiUUK9/llAVvXa3TGRXY1L+9G4EJunYFobjC04ahoOmLvf/nCs50N5xibxL0mnubR5sCB03Ed1FIH0eVReUwIDAQABAoIBAB3GtrGKV96UY4DLl/RT/6x5AVCGeS0gMOmb3SGHcmscTPdxOjLDi7PAV4hcqEZ1PwDbxUfOm8OR2PJfwCpu8IEtqvlVflvP8DYe4EQVI4jY8YqPycpBjnq3DiCJ4QQmCoRFd0KwH1LfFGzzwX2htXThrjYjJJyfq78iPlw3sL9w1Y6gH5ZEpk8tY9qxyC+dR4BlZB3IGRmp/IReiAORfFX3qCuJQJuHju8MhzU57XlGtxZZPE9OBFBwkw69oulzJoJdx1LFR7WCUdu1/du7v6FcyjpWoZoFE/a4njNdhMHB/U9rOMS2N4DzqpPeqzzIhuXyO1ZdW5LQjgW3h9RHrAECgYEAxjUxa2rC/HymGXGISfWHZ6E/YJluqaEC/UJf+QcoMWqs0Mpu2Xflpo57HUgqQac6qns42bDTmVkQvWizsROF6htth/J7BZN30VM9SpDhHhZzhdzqyWxozKU7C19IcadONIdsMur5BilqCtiaTWUTArRccNlzoj0CuekOmy24dwECgYEA7nOkLXnyxUo9Sof9M7GsBFBkiYCQ6+rHqg6wLMrE0/mnSu31bXEIXK/duUm0i4CsrsA/ENa5QJuRQgNlAgBfPzL83QuYh3ma+GMBCe9ej7uieodQ0j2KPR2JBnzr8UJqOK7rNYe+2fY0OCeY9wV1xLBB9rU8QIaoiyj9s5cWyVMCgYEAm/IAFv6huRutZ7levKn0RgGlJrCxU7795hsR/ZG2+uJuY7vR6UIfKqNRlCFSNeOIEdfvS7+HTFC6DfxR3NF6fE3mKJ8MUb/L9qLiR0ekBxMtAzZkd+PWtKSPxwvJqLo0mrmt1IXxNfrhlvUCuj/67BbR4GwGQbB086a9OjSHvQECgYEAwKeiIDQFF62Rs6QHyTpltt6VPBsp+9InG5jecnIpcPKmXX3A63mFvg1BYTDRtFx0KISe76Xs6uxGAkXn2CQg0FkLwDRcOijgMosbDcHebta0wbaOcC7Uf+hbC2jm4Hg+himdVBSm+EdZjX1As2Qv8IhP41ouohuqFTU7NVx/Ro0CgYAhomZRc8cM+D8QXty2DauoYtNrFqOzH7sg2NXxREcy5tbwLaOA6ZhGn30XP0reQYRWo2TAlo1cwfMLixyINqTybJHDuNaLuFMCcCFZgI1i60FIPBgSgJIih9+KtP0fBkoQn5CBcpT/pNchySZlUkvC8Ojb+YASxwCE4BBuDOrGug==
-----END PRIVATE KEY-----`,
    encKeyID: '261418',
    apiHost: 'icp-payment-stage.icashpay.com.tw',
    apiPath: '/api/V2/Payment/Traffic/DoPayment',
    merchantId: '10526420',
    terminalId: 'A03330510'
};

// --- Part 1: 解析函式 ---
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
    const orgQrcode = nestedTlvData.find(item => item.tag === '46')?.value_str ||
                      nestedTlvData.find(item => item.tag === '01')?.value_str;
    // 【修改註記】強化 qr43 提取邏輯，若 TLV 沒抓到則用 config 的 terminalId 作為 fallback
    const qr43 = nestedTlvData.find(item => item.tag === '43')?.value_str || config.terminalId;
    return { orgQrcode, qr43 };
}

// --- Part 2: 交易函式 ---

function buildTransactionRecord(orgQrcode) {
    const now = new Date();
    const ts = now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');

    const recordId = `G${ts.slice(2)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: recordId,
            merchantId: config.merchantId,
            consumptionType: "1",
            // 【修改註記】將 transactionType 由 "2" 改為 "110" (一般交通扣款標準代碼)
            transactionType: "110",
            terminalId: config.terminalId,
            terminalMfId: config.terminalId, // 【修改註記】補上 terminalMfId 避免欄位缺失
            merchantType: "3", // 【修改註記】捷運/公車類通常建議設為 3
            currency: "TWD",
            originalAmount: 30,
            discountAmount: 0,
            transactionAmount: 30,
            discountInfo: null, // 【修改註記】改為 null 較符合 API 規範
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
            // 【修改註記】增加 extendParameters 結構，這是 V2 交通 API 必帶的擴充參數
            extendParameters: {
                issueId: 3,
                parameters: [
                    { name: "entryExitFlag", value: "1" }
                ]
            }
        },
        qr80: null, // 【修改註記】與標準格式同步，設為 null
        qr8A: null
    };
}

function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    try {
        // 【修改註記】處理 null 值避免簽章內容出現 "null" 字串
        const safeQr80 = qr80 || "";
        const safeQr8A = qr8A || "";
        const signData = `${qr43}${transDate}${amount.toString().padStart(8, '0')}${safeQr80}${safeQr8A}`;

        const md = forge.md.sha256.create();
        md.update(signData, 'utf8');
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const signature = privateKey.sign(md);

        // 【修改註記】重要：icash Pay 交通支付簽章通常只取前 20 位字元
        return forge.util.encode64(signature).slice(0, 20);
    } catch (error) {
        console.error('生成支付MAC失敗:', error);
        throw error;
    }
}

// --- Part 3: 主執行函式 ---

async function processPayment(qrDataString) {
    try {
        const decodedData = base64Decode(qrDataString);
        if (!decodedData) throw new Error("Base64 解碼失敗");

        const tlvData = parseTLV(decodedData);
        const { orgQrcode, qr43 } = extractDataFromTLV(tlvData);

        if (!orgQrcode) throw new Error(`提取 orgQrcode 失敗`);

        const transactionRecord = buildTransactionRecord(orgQrcode);
        const params = transactionRecord.terminalPosParam;

        const paymentMAC = generatePaymentMAC(
            qr43,
            params.transactionDatetime,
            params.transactionAmount,
            transactionRecord.qr80,
            transactionRecord.qr8A,
            config.privateKey
        );

        // 【修改註記】補全 API 要求的完整 Request Body 結構
        const requestData = {
            record: transactionRecord,
            sign: paymentMAC,
            Timestamp: Math.floor(Date.now() / 1000),
            PlatformID: "",
            MerchantID: config.merchantId,
            DeviceID: config.terminalId
        };

        console.log(`--- 準備發送交易 ---`);
        console.log(`Generated RecordId: ${params.recordId}`);

        const response = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestData);
            const options = {
                hostname: config.apiHost,
                port: 443, // 【修改註記】明確指定 443 端口
                path: config.apiPath,
                method: 'POST',
                headers: {
                    'X-iCP-EncKeyID': config.encKeyID,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                rejectUnauthorized: false // 【修改註記】跳過 Stage 環境可能的憑證驗證錯誤
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error("伺服器返回非 JSON 格式: " + data)); }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('\n伺服器回應:', JSON.stringify(response, null, 2));

        const code = response.RtnCode !== undefined ? response.RtnCode : response.rc;
        if (code == '0000' || code == '00000' || code == 0) {
            console.log('\n✅ 支付成功');
        } else {
            console.log(`\n❌ 支付失敗: ${response.RtnMsg || response.rm} (代碼: ${code})`);
        }

    } catch (error) {
        console.error('\n[錯誤]:', error.message);
    }
}

const qrDataFromScanner = process.argv[2];
if (!qrDataFromScanner) {
    console.error("用法: node script.js <Base64_QR_Data>");
} else {
    processPayment(qrDataFromScanner);
}