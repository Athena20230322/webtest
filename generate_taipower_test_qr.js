const QRCode = require('qrcode');

// 定義台電測試 QR Code URL
const url = "https://ebilltest.fisc.com.tw/payQR.aspx?fee_name=TaiPower&ElectricNo=9876543210&" +
            encodeURIComponent("TWQR://台電繳費測試/159/01/V1?D1=10000&D3=TestSignature123+&D5=9876543210&D11=00,987654321098765432109876543210987654");

// 生成 QR Code 並保存為圖片
QRCode.toFile('taipower_test_qr.png', url, {
  errorCorrectionLevel: 'H', // 錯誤校正級別
  width: 300,               // QR Code 寬度
  margin: 2,                // 邊距
}, (err) => {
  if (err) throw err;
  console.log('QR Code has been generated as taipower_test_qr.png');
});