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
    terminalId: useLocalMock ? 'TEST_POS_01' : 'A01630526' // 使用成功範例的終端 ID
};

// --- 解析函式 ---
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
        result.push({ tag: tag.toString(16).padStart(2, '0'), length, value, value_str: value.toString('utf8') });
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

// --- 交易封裝：完全對比成功範例 ---
function buildTransactionRecord(orgQrcode) {
    const now = new Date();
    // 格式化時間：YYYYMMDDHHMMSS
    const ts = now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');

    return {
        version: "01.00",
        orgQrcode: orgQrcode,
        terminalPosParam: {
            recordId: `016305263219${ts.slice(8)}`.padEnd(20, '0'),
            merchantId: config.merchantId,
            consumptionType: "1",
            transactionType: "110", // 成功範例為 110
            terminalId: config.terminalId,
            terminalMfId: "A01630526",
            terminalSwVersion: "M3.3",
            sdkVersion: "1005",
            merchantType: "3",
            currency: "TWD",
            originalAmount: 18.0,
            discountAmount: 6.0,
            transactionAmount: 12.0,
            discountInfo: [
                { typeId: "25", amount: 6.0 },
                { typeId: "23", amount: 0.0 },
                { typeId: "38", amount: 0.0 }
            ],
            transactionDatetime: ts,
            plateNo: "EAL2900",
            driverNo: "020182",
            lineInfo: "0862",
            stationNo: "3",
            stationName: "捷運巨蛋站1",
            lbsInfoX: "120182088",
            lbsInfoY: "22399830",
            entryStationNo: "3",
            entryDeductZoneNo: "3",
            entryStationName: "捷運巨蛋站1",
            entryDatetime: ts,
            txnPersonalProfile: "1",
            penalty: "0",
            advanceAmt: 0.0,
            personalUsePoints: "0",
            personalCounter: "0",
            shiftStart: ts,
            shiftNo: "05",
            roundTripFlag: "1"
        },
        qr80: "00000000000000000000000000000000000000",
        qr8A: "00000000000000000000000000000000",
        qr67: "00000000000000"
    };
}

// --- 簽章生成修正 ---
function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
    // 金額必須 pad 到 8 碼 (例如: 00000012)
    const formattedAmount = amount.toString().split('.')[0].padStart(8, '0');
    const signData = `${qr43}${transDate}${formattedAmount}${qr80}${qr8A}`;

    console.log(">>> [Debug] MAC 原始字串:", signData);

    const md = forge.md.sha256.create();
    md.update(signData, 'utf8');
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature).slice(0, 20);
}

// --- 主執行流程 ---
async function processPayment(qrDataString) {
    try {
        const decodedData = base64Decode(qrDataString);
        const tlvData = parseTLV(decodedData);
        const orgQrcode = extractOrgQrcodeFromTLV(tlvData);
        if (!orgQrcode) throw new Error("無法提取 orgQrcode");

        const transactionRecord = buildTransactionRecord(orgQrcode);
        const params = transactionRecord.terminalPosParam;

        // 生成簽章 (交通 API 固定使用 QR43 作為簽章因子之一，此處模擬固定值)
        const paymentMAC = generatePaymentMAC(
            "1234567890123456",
            params.transactionDatetime,
            params.transactionAmount,
            transactionRecord.qr80,
            transactionRecord.qr8A,
            config.privateKey
        );

        const requestData = { record: transactionRecord, sign: paymentMAC };

        console.log(`\n>>> 目標: ${useLocalMock ? '本地' : 'Staging'}`);

        const response = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestData);
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
                rejectUnauthorized: false
            };

            const lib = useLocalMock ? http : https;
            const req = lib.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(new Error("Response 格式錯誤")); }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('\n7. 伺服器回應:', response);

        const rc = response.RtnCode !== undefined ? response.RtnCode : response.rc;
        const rm = response.RtnMsg || response.rm;

        if (rc === 0 || rc === '00000' || rc === '0000') {
            console.log('\n✅ 支付成功！');
            console.log('交易 ID:', response.transactionInfo ? response.transactionInfo.transactionId : 'N/A');
        } else {
            console.error(`\n❌ 支付失敗: ${rm} (代碼: ${rc})`);
        }

    } catch (error) {
        console.error('\n[錯誤]:', error.message);
    }
}

const input = process.argv[2];
if (input) processPayment(input);
else console.log("請輸入掃描 Base64 字串");