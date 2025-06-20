const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');

// Configuration parameters (update merchantId and terminalId for Taipei MRT)
const config = {
  aesKey: 'T76LqZlcVGJnsxdHxZD73LvOtYsajcY6',
  aesIV: 'KBQAKeKKXXYe9mMp',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAuJ789Fnv1/7jTeqbrlSr33cnnJkbvu5ef+XP+3XymI0/+05dlXn7Cs2OxEeC6LzZvFl4XFJuyMUovhdousJPu8DvpuIz3IBdJksKlTngFBC4il+5VB9oAUvsnVR3f+eN7wvCY6wnBHdWLHisFr83Cn2IKFWDT/rHDiTZjPVqTXNRu+ldkKyRSQlX3fNrkh3xGESM7vD6GYB/dcG7+7dx+pYJfNihgnw9oJF4NGkck5aPp7BdDWUfSGfDDPqosIxfKKPiUUK9/llAVvXa3TGRXY1L+9G4EJunYFobjC04ahoOmLvf/nCs50N5xibxL0mnubR5sCB03Ed1FIH0eVReUwIDAQABAoIBAB3GtrGKV96UY4DLl/RT/6x5AVCGeS0gMOmb3SGHcmscTPdxOjLDi7PAV4hcqEZ1PwDbxUfOm8OR2PJfwCpu8IEtqvlVflvP8DYe4EQVI4jY8YqPycpBjnq3DiCJ4QQmCoRFd0KwH1LfFGzzwX2htXThrjYjJJyfq78iPlw3sL9w1Y6gH5ZEpk8tY9qxyC+dR4BlZB3IGRmp/IReiAORfFX3qCuJQJuHju8MhzU57XlGtxZZPE9OBFBwkw69oulzJoJdx1LFR7WCUdu1/du7v6FcyjpWoZoFE/a4njNdhMHB/U9rOMS2N4DzqpPeqzzIhuXyO1ZdW5LQjgW3h9RHrAECgYEAxjUxa2rC/HymGXGISfWHZ6E/YJluqaEC/UJf+QcoMWqs0Mpu2Xflpo57HUgqQac6qns42bDTmVkQvWizsROF6htth/J7BZN30VM9SpDhHhZzhdzqyWxozKU7C19IcadONIdsMur5BilqCtiaTWUTArRccNlzoj0CuekOmy24dwECgYEA7nOkLXnyxUo9Sof9M7GsBFBkiYCQ6+rHqg6wLMrE0/mnSu31bXEIXK/duUm0i4CsrsA/ENa5QJuRQgNlAgBfPzL83QuYh3ma+GMBCe9ej7uieodQ0j2KPR2JBnzr8UJqOK7rNYe+2fY0OCeY9wV1xLBB9rU8QIaoiyj9s5cWyVMCgYEAm/IAFv6huRutZ7levKn0RgGlJrCxU7795hsR/ZG2+uJuY7vR6UIfKqNRlCFSNeOIEdfvS7+HTFC6DfxR3NF6fE3mKJ8MUb/L9qLiR0ekBxMtAzZkd+PWtKSPxwvJqLo0mrmt1IXxNfrhlvUCuj/67BbR4GwGQbB086a9OjSHvQECgYEAwKeiIDQFF62Rs6QHyTpltt6VPBsp+9InG5jecnIpcPKmXX3A63mFvg1BYTDRtFx0KISe76Xs6uxGAkXn2CQg0FkLwDRcOijgMosbDcHebta0wbaOcC7Uf+hbC2jm4Hg+himdVBSm+EdZjX1As2Qv8IhP41ouohuqFTU7NVx/Ro0CgYAhomZRc8cM+D8QXty2DauoYtNrFqOzH7sg2NXxREcy5tbwLaOA6ZhGn30XP0reQYRWo2TAlo1cwfMLixyINqTybJHDuNaLuFMCcCFZgI1i60FIPBgSgJIih9+KtP0fBkoQn5CBcpT/pNchySZlUkvC8Ojb+YASxwCE4BBuDOrGug==
-----END PRIVATE KEY-----`,
  encKeyID: '261418',
  apiHost: 'icp-payment-stage.icashpay.com.tw',
  apiPath: '/api/V2/Payment/Traffic/DoPayment',
  merchantId: '10526420', // Replace with actual Taipei MRT merchant ID
  terminalId: 'TAIPEI_MRT_TERMINAL_001' // Replace with actual Taipei MRT terminal ID
};
// Build transaction record for Taipei MRT (based on specification Pages 7–9, 14)
function buildTransactionRecord() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const entryTimestamp = timestamp; // Entry time
  const exitTimestamp = new Date(now.getTime() + 30 * 60 * 1000) // Assume 30 minutes later for exit
    .toISOString().replace(/[-:T]/g, '').slice(0, 14);

  return {
    version: "01.00",
    orgQrcode: "00000000000000406027", // 00000000000000406020(樂天)
    terminalPosParam: {
      recordId: `TR${timestamp}${Math.floor(Math.random() * 10000)}`.padEnd(20, '0'),
      merchantId: config.merchantId,
      consumptionType: "1", // 扣款 (deduction), Page 16
      transactionType: "2", // 電子票證單程票 (single-journey ticket), Page 16
      terminalId: config.terminalId,
      merchantType: "2", // 臺北捷運 (0x01), Page 14
      currency: "TWD",
      originalAmount: 30, // 原始金額=交易金額+總優惠金額+補助款使用點數
      discountAmount: 5, // 總優惠金額
      transactionAmount: 25, // 交易金額/實際扣款金額
      discountInfo: [
        { typeId: "301", amount: 5 } // 新北學生半價優惠, Page 19
      ],
      transactionDatetime: exitTimestamp, // Use exit time for transaction
      stationNo: "BL23", // Added: Transaction station number (e.g., exit station), required per Page 8
      stationName: "台北101/世貿",
      stationName2: "Taipei 101/World Trade Center",
      entryStationNo: "BL12", // Taipei Main Station (Blue Line)
      entryStationName: "台北車站",
      entryStationName2: "Taipei Main Station",
      entryDatetime: entryTimestamp,
      exitStationNo: "BL23", // Taipei 101/World Trade Center
      exitStationName: "台北101/世貿",
      exitStationName2: "Taipei 101/World Trade Center",
      exitDatetime: exitTimestamp,
      txnPersonalProfile: "1", // Example: 1 for student identity, Page 9
      penalty: 0,
      advanceAmt: 0,
      personalUsePoints: 0,
      personalCounter: 0,
      shiftStart: timestamp,
      // Omit lbsInfoX and lbsInfoY as they are optional and less relevant for MRT
    },
    qr80: "", // Optional, include if required by Taipei MRT
    qr8A: ""  // Optional, include if required by Taipei MRT
  };
}


 
 
 
 
 


 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

// AES-256-CBC encryption (consistent with original, no specific change in spec)
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

// Generate payment MAC signature (Page 5, ICP_Gen_PaymentMAC)
function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
  try {
    const signData = `${qr43}${transDate}${amount.toString().padStart(8, '0')}${qr80}${qr8A}`;
    const md = forge.md.sha256.create();
    md.update(signData, 'utf8');
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature).slice(0, 20); // 20-byte output as per spec
  } catch (error) {
    console.error('生成支付MAC失敗:', error);
    throw error;
  }
}

// Main payment processing function
async function processPayment() {
  try {
    // 1. Build transaction record
    const transactionRecord = buildTransactionRecord();
    console.log('交易記錄:', JSON.stringify(transactionRecord, null, 2));

    // 2. Encrypt transaction data
    const encryptedData = encryptAES(
      JSON.stringify(transactionRecord),
      config.aesKey,
      config.aesIV
    );
    console.log('加密數據:', encryptedData);

    // 3. Generate payment MAC signature
    const qr43 = "1234567890123456"; // Replace with actual 16-byte virtual card number
    const transDate = transactionRecord.terminalPosParam.transactionDatetime;
    const amount = transactionRecord.terminalPosParam.transactionAmount;
    const qr80 = transactionRecord.qr80 || "010203040506070809"; // 19-byte BIN
    const qr8A = transactionRecord.qr8A || "0102030405060708"; // 16-byte BIN
    
    const paymentMAC = generatePaymentMAC(
      qr43,
      transDate,
      amount,
      qr80,
      qr8A,
      config.privateKey
    );
    console.log('支付MAC:', paymentMAC);

    // 4. Prepare request data (Page 7, Request format)
    const requestData = {
      record: transactionRecord,
      sign: paymentMAC
    };

    // 5. Send request
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
            reject(new Error(`響應解析失敗: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log('服務器響應:', response);

    // 6. Process response (Pages 10–12)
    if (response.rc === '00000') {
      console.log('支付成功');
      console.log('交易信息:', response.transactionInfo);
    } else {
      console.error('支付失敗:', response.rm);
      console.error('錯誤代碼:', response.rc);
      if (response.rc === '-170407') {
        console.error('簽名驗證失敗，請檢查簽名生成過程');
      } else if (response.rc === '-170301') {
        console.error('JSON格式錯誤，請檢查請求數據結構');
      } else if (response.rc === '-140004') {
        console.error('餘額不足:', response.rm);
      }
    }

    return response;
  } catch (error) {
    console.error('支付處理異常:', error);
    throw error;
  }
}

// Execute payment
processPayment().catch(console.error);