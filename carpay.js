const fs = require("fs");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");

async function decodeQRCode() {
  try {
    const buffer = fs.readFileSync("qrcode.png");
    const image = await Jimp.read(buffer); // <-- async 函數
    const qr = new QrCode();

    qr.callback = (err, value) => {
      if (err) {
        console.error("解碼失敗:", err);
      } else {
        console.log("QR Code 內容:", value.result);
      }
    };

    qr.decode(image.bitmap);
  } catch (err) {
    console.error("發生錯誤:", err);
  }
}

decodeQRCode();
