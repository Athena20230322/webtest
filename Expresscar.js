const express = require("express");

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

const mockValidCode = process.env.MOCK_VALID_CODE || "";

app.post("/scan-ticket", (req, res) => {
  const qrData = typeof req.body.qr === "string" ? req.body.qr.trim() : "";

  if (!qrData) {
    return res.status(400).json({
      success: false,
      message: "缺少 qr 欄位",
    });
  }

  if (mockValidCode && qrData !== mockValidCode) {
    return res.status(422).json({
      success: false,
      message: "無效的 QR Code",
    });
  }

  return res.json({
    success: true,
    message: "票證掃描成功，已模擬扣款",
    data: {
      qrLength: qrData.length,
      paidAmount: 1,
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Expresscar mock server listening on http://localhost:${port}`);
});
