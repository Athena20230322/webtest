// 引入 Node.js 內建的 http 模組
const http = require('http');

// 設定伺服器監聽的連接埠
const port = 3010;

/**
 * 創建一個 HTTP 伺服器。
 * 每次收到請求時，都會執行這個回呼函數。
 *
 * @param {http.IncomingMessage} req - 請求物件，包含客戶端請求的詳細資訊。
 * @param {http.ServerResponse} res - 回應物件，用於向客戶端發送回應。
 */
const server = http.createServer((req, res) => {
  // 設定回應的 HTTP 狀態碼為 200 (OK)
  res.statusCode = 200;
  // 設定回應頭，Content-Type 為純文字，字元集為 UTF-8
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // 發送回應內容
  res.end('Hello World!\n'); // 發送 "Hello World!" 並結束回應
});

/**
 * 啟動伺服器，讓它開始監聽指定的連接埠。
 * 一旦伺服器成功啟動，回呼函數會被執行。
 */
server.listen(port, () => {
  // 當伺服器開始監聽時，在控制台打印一條訊息
  console.log(`伺服器運行在 http://localhost:${port}`);
  console.log('您可以在瀏覽器中打開此連結以查看訊息。');
});
