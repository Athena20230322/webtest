const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { MultiFormatReader, BarcodeFormat, DecodeHintType } = require('@zxing/library');
const Jimp = require('jimp');

const app = express();

// 提供靜態檔案服務
app.use(express.static(path.join(__dirname, 'public')));

// 確保 uploads 資料夾存在
const uploadDir = path.join('C:', 'webtest', 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 設置 multer 儲存上傳的圖片
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 上傳圖片的 API，並解析條碼
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // 讀取並預處理圖片
    const image = await Jimp.read(req.file.path);
    image.contrast(0.5).grayscale();
    if (image.bitmap.width > 800) {
      image.scaleToFit(800, 800);
    }
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // 轉換圖片數據為 ZXing 格式
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const luminanceSource = new (require('@zxing/library').RGBLuminanceSource)(
      new Uint8ClampedArray(buffer),
      width,
      height
    );
    const binaryBitmap = new (require('@zxing/library').BinaryBitmap)(
      new (require('@zxing/library').HybridBinarizer)(luminanceSource)
    );

    // 使用 ZXing 解析條碼
    const reader = new MultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A
    ]);
    const result = reader.decode(binaryBitmap, hints);

    let barcodeText = 'No barcode detected';
    if (result && result.getText().startsWith('IC')) {
      barcodeText = result.getText();
      const txtFileName = path.join(uploadDir, `${req.file.filename}.txt`);
      fs.writeFileSync(txtFileName, barcodeText, 'utf8');
    } else if (result && !result.getText().startsWith('IC')) {
      barcodeText = 'Barcode detected but does not start with IC';
    }

    res.json({
      message: 'Image uploaded successfully',
      file: req.file,
      barcode: barcodeText
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
});

// 啟動伺服器
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://10.27.86.103:3001');
});