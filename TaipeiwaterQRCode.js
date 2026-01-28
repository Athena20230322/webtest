const QRCode = require('qrcode');

// 定義要生成 QR 碼的 URL
const url = "https://ebilltest.fisc.com.tw/payQR.aspx?fee_name=TpeWater&WaterNo=9112430446&" + 
           encodeURIComponent("TWQRP://測試台北自來水費/158/03/V1?D1=10000&D3=AVWYrjDqQES+&D7=9112430446&D11=00,4614611000051300010001000100513965");

// 生成 QR 碼並保存為圖片
QRCode.toFile('water_fee_qr.png', url, {
  errorCorrectionLevel: 'H', // 錯誤校正級別
  width: 300,               // QR 碼寬度
  margin: 2,                // 邊距
}, (err) => {
  if (err) throw err;
  console.log('QR Code has been generated as water_fee_qr.png');
});