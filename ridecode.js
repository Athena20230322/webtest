const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');

// 配置参数（根據實際需要修改）
const config = {
  aesKey: 'XGYX4IpxRqA06fyNRairC84bEWaeiuTS',
  aesIV: 'HDm8VtQAbJopj6m0',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAyG2eMFbTT3F72l2hPeNcApoIbVcxUSPayarOcx1+aeEqFmy9zP5709WxO59tjb9ibX39sg6GPSWtJmtmZwF79/DbOdhaVKbCmbrxzyqo3xheQ90mIvtXLrOmomty8ItA70lYs0LFijKNBG5pZ4K3kjy2GntnlAuB8X3NmHtyH3O9/jrSswgUXV3oy38tVonOmizRV0A7sDeI0qOKTFpJpQ+exAbQJOLyR9R9712clP8fuDeKcRtvkBG8iWE9I1bDjelfjn+XVPwumizxb7PktAvFwAEKxvjgbIoGOGdfOiIKXOO3qtixLv/ZDpiqg8FfNDrx+YLTzUH0mtNdaDoC3wIDAQABAoIBAAIYbJ91FkIjMxgeLiSJ/yPDKCm7JXeuMsg0ohzqUYXaMJ5Ju8BBZtpY8RXo/Z8OQawDCwcfXMBAkmtaPcNU7M6zn28e4m7hIXFfAXkuKSl6mpMGDwiC7S8+pJQtIGdVurOQZj4q3rV/qswW5WuLc8+Hv/WjQFAiwKndgVaXRSMBW4hSgmp4jyrN3Nqyef8T/vlFsHy5Vk5pQBQlMsov8TRujBkpN+a1ijMiCOZsaLirfgtWgGMkay957LH9IGmwcxM0u+nX4yqet/2yQOXOlWRS4KVGNEAxx+jLFKA5430Z1aEVHCYvzqEOGMChvOWT2xifu6QBuST/MZDEXYwXSM0CgYEA3DwGAXxSI995vdtkMzQuSCuSGdUGkzKn+WiEndDehvIS3tFD9uNxuj3KqLAXCf8V+O65XcGZSfUTfeRsGxFldbwoCGaYa331OeD0mRZju0eR8bmeRelYuJzxzdXTXtXQaoyJJyqkFfnX+cqanmBhO4ay5YHG7+d46VNbNTHIX00CgYEA6PosUk+RBdb9w7sc5cA4QoSGgY0gTVsqX0FKmcQBf63pT0hkLArKHXJhf+NPHKzfG6Q8tHJuCP/lFcOZgWo7vqkJ17fzP5PQ/KnvM+WuXgQR2HOqvvzf0ijFlZ27JxEQpqHvHv4ivaIcDNNYlIU8JL54kZPuhejFyFn9bRoMbNsCgYAJ1E/8Tv0nhrjbRWhydJjANdmed4iEl1Ux531Lwd+8rB81fKeI5FvWER3za3CLzKvBYX46dgKOb3bAPqqohp09pPkwbsvMuGFyhNzF3F71I9uaq0sqGaERFEgihLGbYPWdW8pfSiLqrCz8hBNkkC6mxntDjQhA+tbFqye99wvXXQKBgQCOFQQyrpOjHBpm5BYbh77H0kq1d3vbsV2F+iuk2wSO+WDwGRX+RhY9HySW+emlc0gdc2wSIDc7BdSQEVnssvz8qdp21JhkjaFGddyLqedNLu4zM1dOYqmdYYAeXrNkf+PHu7o5DIPjYpn4uGutKBQl1INzROSShgMYzMjhYKFzQQKBgQCycC1LMsAMc6Sa8Cy552lOY8xadq6j3SWR/ntl8flqv7n8HzVGMG7T+gSMfYDqHHupuOoQKpsDd/RCnr+07VbIG2oBHw0pUqSc5A25YcmLnA2UozKzZTUxE/we1VbDQSP1m4tp97xcjUG1+h4NnTTJviQ/xrqRBBuRCAYbChppIQ=
-----END PRIVATE KEY-----`,
  encKeyID: '234076',
  apiHost: 'icp-payment-stage.icashpay.com.tw',
  apiPath: '/api/V2/Payment/Traffic/DoPayment',
  merchantId: '10524012', // 替換為實際者代碼
  terminalId: 'YOUR_TERMINAL_ID' // 替换為實際終端編號
};

// 建建完整的交易記录(根據規格書第7-9页)
function buildTransactionRecord() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  
  return {
    version: "01.00",
    orgQrcode: "00000000000000373195", // 應替换為實際QR46交易序号
    terminalPosParam: {
      recordId: `TR${timestamp}${Math.floor(Math.random() * 10000)}`.padEnd(20, '0'),
      merchantId: config.merchantId,
      consumptionType: "1", // 1:扣款 (規格書第16页)
      transactionType: "1", // 1:段次扣款 (規格書第16页)
      terminalId: config.terminalId,
      merchantType: "3", // 3:市區公車 (規格書第8页)
      originalAmount: 30,
      discountAmount: 20,
      transactionAmount: 10, // 實際扣款金额
      discountInfo: [
        { typeId: "23", amount: 20 } // 23:轉乘優惠 (規格書第18页)
      ],
      transactionDatetime: timestamp,
      stationNo: "ST001",
      stationName: "台北車站",
      stationName2: "Taipei Main Station",
      lbsInfoX: "121.517055",
      lbsInfoY: "25.047743",
      txnPersonalProfile: "0", // 0:一般身份
      penalty: 0,
      advanceAmt: 0,
      personalUsePoints: 0,
      personalCounter: 0,
      shiftStart: timestamp,
      // 其他可选字段根据实际情况添加
    },
    // 其他可选字段
    qr80: "", // 根據規格書第7页可選
    qr8A: ""  // 根據規格書第7页可選
  };
}

// AES-256-CBC加密 (规格書未明確加密方式，保持原實現)
function encryptAES(data, key, iv) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', 
      Buffer.from(key, 'utf8'), 
      Buffer.from(iv, 'utf8'));
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (error) {
    console.error('AES加密失败:', error);
    throw error;
  }
}

// 生成支付MAC签名 (规格书第5页ICP_Gen_PaymentMAC函数);
function generatePaymentMAC(qr43, transDate, amount, qr80, qr8A, privateKeyPem) {
  try {
    // 1. 准备签名数据 (规格书第5页)
    const signData = `${qr43}${transDate}${amount.toString().padStart(8, '0')}${qr80}${qr8A}`;
    
    // 2. 使用SHA256withRSA签名
    const md = forge.md.sha256.create();
    md.update(signData, 'utf8');
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const signature = privateKey.sign(md);
    
    // 3. 返回Base64编码的20字节MAC (规格书第5页要求20字节输出)
    return forge.util.encode64(signature).slice(0, 20);
  } catch (error) {
    console.error('生成支付MAC失败:', error);
    throw error;
  }
}

// 主执行函数
async function processPayment() {
  try {
    // 1. 构建交易记录 (规格书第7页Record STRUCT)
    const transactionRecord = buildTransactionRecord();
    console.log('交易记录:', JSON.stringify(transactionRecord, null, 2));

    // 2. 加密交易数据
    const encryptedData = encryptAES(
      JSON.stringify(transactionRecord),
      config.aesKey,
      config.aesIV
    );
    console.log('加密数据:', encryptedData);

    // 3. 生成支付MAC签名 (规格书第5页)
    // 注意：这里需要根据实际QR43、QR80、QR8A的值进行替换
    const qr43 = "1234567890123456"; // 16字节虚拟卡号 (规格书第5页)
    const transDate = transactionRecord.terminalPosParam.transactionDatetime;
    const amount = transactionRecord.terminalPosParam.transactionAmount;
    const qr80 = "010203040506070809"; // 19字节BIN数据 (示例)
    const qr8A = "0102030405060708"; // 16字节BIN数据 (示例)
    
    const paymentMAC = generatePaymentMAC(
      qr43,
      transDate,
      amount,
      qr80,
      qr8A,
      config.privateKey
    );
    console.log('支付MAC:', paymentMAC);

    // 4. 准备请求数据 (规格书第7页Request格式)
    const requestData = {
      record: transactionRecord,
      sign: paymentMAC // ICP_Gen_PaymentMAC的回传值 (规格书第7页)
    };

    // 5. 发送请求
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
            reject(new Error(`响应解析失败: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log('服务器响应:', response);

    // 6. 处理响应 (规格书第10-12页)
    if (response.rc === '00000') {
      console.log('支付成功');
      console.log('交易信息:', response.transactionInfo);
    } else {
      console.error('支付失敗:', response.rm);
      console.error('錯誤代碼:', response.rc);
      
      // 根据规格书第12页错误代码表处理特定错误
      if (response.rc === '-170407') {
        console.error('签名验证失败，请检查签名生成过程');
      } else if (response.rc === '-170301') {
        console.error('JSON格式错误，请检查请求数据结构');
      }
    }

    return response;
  } catch (error) {
    console.error('支付处理异常:', error);
    throw error;
  }
}

// 执行支付
processPayment().catch(console.error);