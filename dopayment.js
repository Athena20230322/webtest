const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const { Buffer } = require('buffer');

// 檔案路徑
const QR_CODE_PATH = path.join('C:', 'webtest', 'qrcode.png');

async function readQRCode(filePath) {
    console.log("\n1. 讀取QR code...");
    try {
        // 讀取圖片
        const image = await loadImage(filePath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        
        // 解碼 QR 碼
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const decoded = jsQR(imageData.data, image.width, image.height);
        
        if (!decoded) {
            throw new Error("未檢測到 QR 碼");
        }
        
        const qrData = decoded.data;
        console.log(`讀取成功 (前50字): ${qrData.substring(0, 50)}...`);
        return qrData;
    } catch (e) {
        console.log(`讀取錯誤: ${e.message}`);
        return null;
    }
}

function base64Decode(encodedData) {
    console.log("\n2. Base64解碼...");
    try {
        encodedData = encodedData.trim();
        while (encodedData.length % 4 !== 0) {
            encodedData += '=';
        }
        const decodedData = Buffer.from(encodedData, 'base64');
        console.log(`解碼成功 (長度: ${decodedData.length} 字節)`);
        console.log(`Hex表示 (前64字節): ${decodedData.toString('hex').substring(0, 128)}...`);
        return decodedData;
    } catch (e) {
        console.log(`解碼錯誤: ${e.message}`);
        return null;
    }
}

function parseTLV(data, start = 0, maxLength = null) {
    /** 簡單的TLV解析器，假設Tag和Length為1字節 */
    if (maxLength === null) {
        maxLength = data.length;
    }

    const result = [];
    let pos = start;

    while (pos < maxLength) {
        if (pos + 2 > maxLength) {
            console.log("TLV解析結束: 剩餘數據不足");
            break;
        }
        const tag = data[pos];
        const length = data[pos + 1];
        pos += 2;

        if (pos + length > maxLength) {
            console.log(`TLV解析錯誤: 長度超出數據範圍 (Tag: ${tag.toString(16).padStart(2, '0')}, Length: ${length})`);
            break;
        }

        const value = data.slice(pos, pos + length);
        result.push({
            tag: tag.toString(16).padStart(2, '0'),
            length: length,
            value: value,
            value_hex: value.toString('hex'),
            value_str: value.toString('utf8', 0, Math.min(value.length, 100)) // 限制字符串長度避免過長輸出
        });
        pos += length;
    }

    return result;
}

function parseDataContent(content) {
    console.log("\n3. 解析數據內容...");
    try {
        // 顯示完整Hex數據
        const hexData = content.toString('hex');
        console.log("\n完整Hex數據:");
        console.log(hexData);

        // TLV解析
        console.log("\nTLV解析結果:");
        const tlvData = parseTLV(content);
        for (const item of tlvData) {
            console.log(
                `Tag: ${item.tag}, Length: ${item.length}, Value: ${item.value_str} (Hex: ${item.value_hex})`);
        }

        // 提取已知字段
        const result = {
            data_type: "TLV",
            length: content.length,
            hex_sample: hexData.substring(0, 128) + "...",
            tlv_fields: tlvData
        };

        // 檢查特定字段
        if (content.includes(Buffer.from("20250514110039"))) {
            result.timestamp = "2025-05-14 11:00:39";
        }
        if (content.includes(Buffer.from("168211100009624"))) {
            result.account = "168211100009624";
        }
        if (content.includes(Buffer.from("000545"))) {
            result.amount = "NT$545";
        }

        return result;
    } catch (e) {
        console.log(`解析錯誤: ${e.message}`);
        return null;
    }
}

async function processQRData() {
    console.log(`\n=== 開始處理 QR code ===`);
    console.log(`檔案路徑: ${QR_CODE_PATH}`);

    // 1. 讀取 QR 碼
    const qrData = await readQRCode(QR_CODE_PATH);
    if (!qrData) {
        console.log("\n[錯誤] QR 碼讀取失敗");
        return false;
    }

    // 2. Base64 解碼
    const decodedData = base64Decode(qrData);
    if (!decodedData) {
        console.log("\n[錯誤] Base64 解碼失敗");
        return false;
    }

    // 3. 解析數據（跳過哈希驗證）
    const parsedData = parseDataContent(decodedData);
    if (!parsedData) {
        console.log("\n[錯誤] 數據解析失敗");
        return false;
    }

    // 顯示最終結果
    console.log("\n=== 解析結果 ===");
    for (const [key, value] of Object.entries(parsedData)) {
        if (key === "tlv_fields") {
            console.log("tlv_fields:");
            for (const item of value) {
                console.log(
                    `  Tag: ${item.tag}, Length: ${item.length}, Value: ${item.value_str} (Hex: ${item.value_hex})`);
            }
        } else {
            console.log(`${key}: ${value}`);
        }
    }

    return true;
}

// 執行主程序
processQRData().then(success => {
    console.log("\n處理結果:", success ? "成功" : "失敗");
}).catch(err => {
    console.error("處理過程中發生錯誤:", err);
});