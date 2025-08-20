const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000; // 伺服器監聽的連接埠

// 使用 body-parser 中介軟體來解析 URL 編碼和 JSON 格式的請求體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- 您的 JavaScript 腳本的絕對路徑設定 ---
// 重要的注意事項：這些路徑是針對 Windows 環境 (例如 C:\webtest)。
// 如果您在不同的作業系統或伺服器上運行此應用程式，請務必修改這些路徑。
const scriptPath = 'C:\\webtest\\cosmed.js';
const webScriptPath = 'C:\\webtest\\cosmedweb.js';
const marketPaymentScriptPath = 'C:\\webtest\\marketpayment.js';
const marketTopUpScriptPath = 'C:\\webtest\\markettopup.js';
const marketTopRefundScriptPath = 'C:\\webtest\\markettoprefund.js';
const bindingDayScriptPath = 'C:\\webtes20250123\\bindingday.js';
const bindingMonthScriptPath = 'C:\\webtes20250123\\bindingmonth.js';
const bindingSeasonScriptPath = 'C:\\webtes20250123\\bindingseason.js';
const bindingYearScriptPath = 'C:\\webtes20250123\\bindingyear.js';
const binding711ScriptPath = 'C:\\webtes20250123\\binding711paid.js';
const binding711memformalScriptPath = 'C:\\webtes20250123\\binding711memformal.js';
const booksWebScriptPath = 'C:\\webtest\\booksweb.js';
const kfcjumpScriptPath = 'C:\\webtes20250123\\kfcjump.js';
const fiscKorScriptPath = 'C:\\webtest\\fisckor.js';
// **已移除** rideScriptPath
// const rideScriptPath = 'C:\\webtest\\ridecode.js';

// **已新增** 新的乘車碼扣款腳本路徑
const processRidePaymentScriptPath = 'C:\\webtest\\processRidePayment.js';

// i預購腳本的路徑
const iyugoSlackScriptPath = 'C:\\webtest\\iyugoslack.js';

// **新增** UAT 環境超商現金儲值交易腳本的路徑
const marketTopUpUatScriptPath = 'C:\\webtest\\markettopupuat.js';


// 點擊日誌檔案的路徑
const clickLogPath = path.join('C:\\webtest', 'click_log.txt');

/**
 * @route GET /
 * @description 伺服器根路徑，提供包含條碼掃描功能的 HTML 頁面。
 * 頁面包含輸入欄位、執行按鈕和條碼掃描功能（使用 QuaggaJS）。
 */
app.get('/', (req, res) => {
    // 使用模板字串發送完整的 HTML 頁面
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>條碼掃描與付款執行</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f4f8;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start; /* 將內容對齊到頂部，以便滾動 */
                    padding: 2rem;
                    box-sizing: border-box;
                }
                .container {
                    background-color: #ffffff;
                    padding: 2.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 800px;
                    overflow-y: auto; /* 如果內容溢出，允許在容器內滾動 */
                }
                .input-group {
                    display: flex;
                    flex-wrap: wrap; /* 在小螢幕上允許換行 */
                    gap: 0.5rem; /* 項目之間的間距 */
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .input-group input[type="text"] {
                    flex-grow: 1;
                    min-width: 180px; /* 確保輸入欄位有最小寬度 */
                    padding: 0.75rem 1rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: all 0.2s ease-in-out;
                }
                .input-group input[type="text"]:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
                }
                .input-group button {
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .input-group button:hover {
                    background-color: #4338ca;
                    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
                }
                .input-group button.scan-button {
                    background-color: #10b981; /* 掃描按鈕的獨特顏色 */
                }
                .input-group button.scan-button:hover {
                    background-color: #059669;
                }
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                    margin-top: 1.5rem;
                }
                #output {
                    background-color: #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    white-space: pre-wrap; /* 保留空白並換行 */
                    word-wrap: break-word; /* 長單詞斷行 */
                    font-family: monospace;
                    min-height: 100px;
                    overflow-x: auto;
                    color: #334155;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
                }
                #scanner-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.9);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    color: white;
                    padding: 1rem;
                    box-sizing: border-box;
                }
                #scanner-overlay video, #scanner-overlay canvas {
                    width: 90%; /* 響應式寬度 */
                    max-width: 600px; /* 桌機最大寬度 */
                    height: auto; /* 保持長寬比 */
                    border: 2px solid #3b82f6;
                    border-radius: 0.75rem;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                    margin-bottom: 1rem;
                    object-fit: cover; /* 確保視頻填充元素同時保持長寬比 */
                }
                #scanner-overlay .drawingBuffer {
                    position: absolute; /* 將 canvas 定位在 video 上方 */
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90%; /* 與 video 寬度匹配 */
                    max-width: 600px; /* 與 video 最大寬度匹配 */
                    height: auto; /* 與 video 高度匹配 */
                    pointer-events: none; /* 允許點擊穿透到 video */
                }
                #scanner-overlay button {
                    padding: 0.8rem 2rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    background-color: #ef4444; /* 關閉按鈕的顏色 */
                    color: white;
                    border: none;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    transition: background-color 0.2s ease-in-out;
                }
                #scanner-overlay button:hover {
                    background-color: #dc2626;
                }
            </style>
        </head>
        <body class="bg-gray-100 p-4">
            <div class="container">
                <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">條碼掃描與執行工具</h1>

                <h2 class="section-title">輸入付款條碼並執行:</h2>
                <div class="input-group">
                    <input type="text" id="barcode" placeholder="輸入條碼" class="text-gray-700">
                    <button onclick="executeScript()">執行康事美扣款</button>
                    <button onclick="executeWebScript()">執行康事美掃描Web付款</button>
                    <button onclick="executeBooksWebScript()">執行博客來掃描Web付款</button>
                </div>

                <h2 class="section-title">韓國跨境扣款:財經測試時間平日九點至下午五點</h2>
                <div class="input-group">
                    <input type="text" id="fiscKorBuyerID" placeholder="輸入BuyerID" class="text-gray-700">
                    <button onclick="executeFiscKor()">執行韓國跨境扣款財經測試環境</button>
                </div>

                <h2 class="section-title">輸入超商反掃付款:</h2>
                <div class="input-group">
                    <input type="text" id="buyerID" placeholder="輸入付款條碼" class="text-gray-700">
                    <button onclick="executeMarketPayment()">執行超商反掃付款</button>
                </div>

                <h2 class="section-title">輸入超商現金儲值交易:</h2>
                <div class="input-group">
                    <input type="text" id="topUpAmt" placeholder="輸入儲值金額" class="text-gray-700">
                    <input type="text" id="topUpBuyerID" placeholder="輸入現金儲值條碼" class="text-gray-700">
                    <button onclick="executeMarketTopUp()">執行超商現金儲值交易</button>
                    <button onclick="executeMarketTopUpUat()">執行UAT超商現金儲值交易</button>
                </div>

                <h2 class="section-title">超商執行取消現金儲值退款:</h2>
                <div class="input-group">
                    <input type="text" id="refundBuyerID" placeholder="輸入退款儲值條碼" class="text-gray-700">
                    <button onclick="executeMarketRefund()">執行超商取消現金儲值退款</button>
                </div>

                <h2 class="section-title">綁定扣款設定_QRcode傳送至Slack github_webtest:</h2>
                <div class="input-group">
                    <button onclick="executeBindingDay()">綁定扣款天扣定額不可改</button>
                    <button onclick="executeBindingMonth()">綁定扣款月扣不定額可改</button>
                    <button onclick="executeBindingSeason()">綁定扣款季扣不定額不可改</button>
                    <button onclick="executeBindingYear()">綁定扣款年扣定額可改</button>
                    <button onclick="executeBinding711()">UAT綁定統一超商付費會員</button>
                    <button onclick="executeBinding711memformal()">勿任意使用此為正式綁定統一超商付費會員</button>
                </div>

                <h2 class="section-title">i預購服務_QRcode傳送至Slack:</h2>
                <div class="input-group">
                    <button onclick="executeIyugoSlack()">i預購隨時取</button>
                </div>

                <h2 class="section-title">乘車碼扣款:</h2>
                <div class="input-group">
                    <input type="text" id="rideCodeArgument" placeholder="貼上乘車碼參數" class="text-gray-700">
                    <button onclick="executeProcessRidePayment()">執行乘車碼扣款</button>
                </div>

                <h2 class="section-title">付款頁跳轉URL_傳送至Slack github_webtest:</h2>
                <div class="input-group">
                    <button onclick="executekfcjumpScript()">執行富利餐飲KFC跳轉URL</button>
                    </div>

                <h3 class="section-title">執行結果:</h3>
                <pre id="output" class="mb-4">等待執行...</pre>
            </div>

            <div id="scanner-overlay" style="display: none;">
                <h2 class="text-2xl font-bold mb-4">條碼掃描器</h2>
                <div id="interactive" class="viewport">
                    <video id="video"></video>
                    <canvas class="drawingBuffer"></canvas>
                </div>
                <button onclick="stopScanner()">關閉掃描器</button>
                <p class="mt-4 text-sm text-gray-300">請允許相機權限以進行掃描。</p>
            </div>

            <script>
                // 由於掃描按鈕已移除，相關的 JavaScript 函式雖然保留，但不會被觸發。
                // 這樣可以確保未來若要加回掃描功能，不需重寫邏輯。
                let activeInputFieldId = null;
                let QuaggaInitialized = false;

                function logClick(buttonName) {
                    fetch('/log-click', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ buttonName })
                    })
                    .then(response => response.text())
                    .then(result => { console.log(result); })
                    .catch(error => { console.error('點擊記錄錯誤: ' + error); });
                }

                function startScanFor(targetInputId) {
                    // 此函式現在不會被呼叫
                }

                function stopScanner() {
                    // 此函式現在不會被呼叫
                }

                function executeScript() {
                    logClick('康事美扣款');
                    const barcode = document.getElementById('barcode').value;
                    fetch('/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barcode })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeWebScript() {
                    logClick('康事美掃描Web付款');
                    fetch('/execute-web-script', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                // **已移除** executerideScriptPath 函數

                // **已新增** executeProcessRidePayment 函數，用於處理新的乘車碼扣款
                function executeProcessRidePayment() {
                    logClick('乘車碼扣款');
                    const rideArgument = document.getElementById('rideCodeArgument').value;
                    if (!rideArgument) {
                        document.getElementById('output').innerText = '請貼上乘車碼參數';
                        return;
                    }
                    fetch('/execute-process-ride-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rideArgument: rideArgument })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeFiscKor() {
                    const buyerID = document.getElementById('fiscKorBuyerID').value;
                    if (!buyerID) {
                        document.getElementById('output').innerText = '請輸入BuyerID';
                        return;
                    }
                    logClick('韓國跨境扣款');
                    fetch('/execute-fisc-kor', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ buyerID })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeMarketPayment() {
                    logClick('超商反掃付款');
                    const buyerID = document.getElementById('buyerID').value;
                    fetch('/execute-market-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ buyerID })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; });
                }

                function executeMarketTopUp() {
                    logClick('超商現金儲值交易');
                    const topUpAmt = document.getElementById('topUpAmt').value;
                    const buyerID = document.getElementById('topUpBuyerID').value;
                    fetch('/execute-market-topup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topUpAmt, buyerID })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; });
                }

                // **新增** 用於 UAT 環境的 JavaScript 函式
                function executeMarketTopUpUat() {
                    logClick('UAT超商現金儲值交易');
                    const topUpAmt = document.getElementById('topUpAmt').value;
                    const buyerID = document.getElementById('topUpBuyerID').value;
                    fetch('/execute-market-topup-uat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topUpAmt, buyerID })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; });
                }

                function executeMarketRefund() {
                    logClick('超商取消現金儲值退款');
                    const refundBuyerID = document.getElementById('refundBuyerID').value;
                    fetch('/execute-market-refund', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refundBuyerID })
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBindingDay() {
                    logClick('綁定扣款天扣定額不可改');
                    fetch('/execute-binding-day', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBindingMonth() {
                    logClick('綁定扣款月扣不定額可改');
                    fetch('/execute-binding-month', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBindingSeason() {
                    logClick('綁定扣款季扣不定額不可改');
                    fetch('/execute-binding-season', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBindingYear() {
                    logClick('綁定扣款年扣定額可改');
                    fetch('/execute-binding-year', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBinding711() {
                    logClick('UAT綁定統一超商付費會員');
                    fetch('/execute-binding-711', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBinding711memformal() {
                    logClick('正式綁定統一超商付費會員');
                    fetch('/execute-binding-711memformal', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeBooksWebScript() {
                    logClick('博客來掃描Web付款');
                    fetch('/execute-books-web-script', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executekfcjumpScript() {
                    logClick('富利餐飲KFC跳轉URL');
                    fetch('/execute-kfc-jump-script', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }

                function executeIyugoSlack() {
                    logClick('i預購隨時取');
                    fetch('/execute-iyugo-slack', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => response.text())
                    .then(result => { document.getElementById('output').innerText = result; })
                    .catch(error => { document.getElementById('output').innerText = '發生錯誤: ' + error; });
                }
            </script>
        </body>
        </html>
    `);
});

/**
 * @function executeNodeScript
 * @description 輔助函數：用於生成子進程並執行 Node.js 腳本，處理其輸出。
 * @param {string} scriptFullPath - 要執行的 Node.js 腳本的完整路徑。
 * @param {object} reqBody - 原始請求的 body 內容，用於傳遞給腳本的 stdin。
 * @param {object} res - Express 回應物件。
 */
const executeNodeScript = (scriptFullPath, reqBody, res) => {
    let inputData = '';
    // 根據腳本類型和預期參數決定要傳遞給子進程的輸入
    if (scriptFullPath === scriptPath && reqBody.barcode) {
        inputData = reqBody.barcode + "\n";
    } else if (scriptFullPath === fiscKorScriptPath && reqBody.buyerID) {
        inputData = reqBody.buyerID + "\n";
    } else if (scriptFullPath === marketPaymentScriptPath && reqBody.buyerID) {
        inputData = reqBody.buyerID + "\n";
    } else if (scriptFullPath === marketTopUpScriptPath && reqBody.topUpAmt && reqBody.buyerID) {
        inputData = reqBody.topUpAmt + "\n" + reqBody.buyerID + "\n";
    } else if (scriptFullPath === marketTopUpUatScriptPath && reqBody.topUpAmt && reqBody.buyerID) { // **新增** 對 UAT 腳本的處理
        inputData = reqBody.topUpAmt + "\n" + reqBody.buyerID + "\n";
    } else if (scriptFullPath === marketTopRefundScriptPath && reqBody.refundBuyerID) {
        inputData = reqBody.refundBuyerID + "\n";
    }

    // 使用 spawn 啟動一個 Node.js 子進程來執行指定的腳本
    const process = spawn('node', [scriptFullPath]);

    // 如果有輸入資料，將其寫入子進程的 stdin
    if (inputData) {
        process.stdin.write(inputData);
        process.stdin.end(); // 結束 stdin 寫入
    }

    let output = ''; // 用於收集腳本的標準輸出
    // 監聽子進程的標準輸出
    process.stdout.on('data', (data) => { output += data.toString(); });
    // 監聽子進程的標準錯誤輸出
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });

    // 監聽子進程關閉事件
    process.on('close', (code) => {
        if (code !== 0) {
            // 如果腳本以非零退出碼結束，表示執行失敗
            res.send(`執行 ${path.basename(scriptFullPath)} 失敗，退出碼: ${code}\n${output}`);
        } else {
            // 腳本成功執行
            res.send(`執行 ${path.basename(scriptFullPath)} 結果:\n${output}`);
        }
    });
    // 監聽子進程錯誤事件 (例如，腳本路徑錯誤或 Node.js 無法啟動)
    process.on('error', (err) => {
        res.send(`啟動 ${path.basename(scriptFullPath)} 錯誤: ${err.message}`);
    });
};

// --- 處理執行腳本的後端路由 ---

app.post('/execute', (req, res) => {
    const barcode = req.body.barcode;
    if (!barcode) { return res.send('請輸入付款條碼'); }
    executeNodeScript(scriptPath, req.body, res);
});

app.post('/execute-fisc-kor', (req, res) => {
    const buyerID = req.body.buyerID;
    if (!buyerID) { return res.send('請輸入BuyerID'); }
    executeNodeScript(fiscKorScriptPath, req.body, res);
});

// **已移除** 舊的 /execute-ride-script 路由

// **已新增** 用於處理新乘車碼腳本的後端路由
app.post('/execute-process-ride-payment', (req, res) => {
    const { rideArgument } = req.body;
    if (!rideArgument) {
        return res.send('錯誤: 未提供乘車碼參數');
    }

    // **重要**：將參數作為命令列參數傳遞，而不是 stdin
    const process = spawn('node', [processRidePaymentScriptPath, rideArgument]);

    let output = '';
    process.stdout.on('data', (data) => {
        output += data.toString();
    });

    process.stderr.on('data', (data) => {
        output += '錯誤輸出: ' + data.toString();
    });

    process.on('close', (code) => {
        if (code !== 0) {
            res.send(`執行 ${path.basename(processRidePaymentScriptPath)} 失敗，退出碼: ${code}\n${output}`);
        } else {
            res.send(`執行 ${path.basename(processRidePaymentScriptPath)} 結果:\n${output}`);
        }
    });

    process.on('error', (err) => {
        res.send(`啟動 ${path.basename(processRidePaymentScriptPath)} 錯誤: ${err.message}`);
    });
});


app.post('/execute-web-script', (req, res) => {
    executeNodeScript(webScriptPath, req.body, res);
});

app.post('/execute-market-payment', (req, res) => {
    const buyerID = req.body.buyerID;
    if (!buyerID) { return res.send('請輸入付款條碼'); }
    executeNodeScript(marketPaymentScriptPath, req.body, res);
});

app.post('/execute-market-topup', (req, res) => {
    const { topUpAmt, buyerID } = req.body;
    if (!topUpAmt || !buyerID) { return res.send('請輸入儲值金額和現金儲值條碼'); }
    executeNodeScript(marketTopUpScriptPath, req.body, res);
});

// **新增** 用於 UAT 環境的後端路由
app.post('/execute-market-topup-uat', (req, res) => {
    const { topUpAmt, buyerID } = req.body;
    if (!topUpAmt || !buyerID) { return res.send('請輸入儲值金額和現金儲值條碼'); }
    executeNodeScript(marketTopUpUatScriptPath, req.body, res);
});

app.post('/execute-market-refund', (req, res) => {
    const refundBuyerID = req.body.refundBuyerID;
    if (!refundBuyerID) { return res.send('請輸入退款條碼'); }
    executeNodeScript(marketTopRefundScriptPath, req.body, res);
});

app.post('/execute-binding-day', (req, res) => {
    executeNodeScript(bindingDayScriptPath, req.body, res);
});

app.post('/execute-binding-month', (req, res) => {
    executeNodeScript(bindingMonthScriptPath, req.body, res);
});

app.post('/execute-binding-season', (req, res) => {
    executeNodeScript(bindingSeasonScriptPath, req.body, res);
});

app.post('/execute-binding-year', (req, res) => {
    executeNodeScript(bindingYearScriptPath, req.body, res);
});

app.post('/execute-binding-711', (req, res) => {
    executeNodeScript(binding711ScriptPath, req.body, res);
});

app.post('/execute-binding-711memformal', (req, res) => {
    executeNodeScript(binding711memformalScriptPath, req.body, res);
});

app.post('/execute-books-web-script', (req, res) => {
    executeNodeScript(booksWebScriptPath, req.body, res);
});

app.post('/execute-kfc-jump-script', (req, res) => {
    executeNodeScript(kfcjumpScriptPath, req.body, res);
});

app.post('/execute-iyugo-slack', (req, res) => {
    executeNodeScript(iyugoSlackScriptPath, req.body, res);
});


/**
 * @route POST /log-click
 * @description 記錄前端按鈕的點擊事件，包含按鈕名稱、客戶端 IP 和時間戳。
 * 日誌會寫入到 click_log.txt 檔案中。
 * @param {object} req - 請求物件，預期 req.body.buttonName 包含按鈕名稱。
 * @param {object} res - 回應物件，用於發送文字回應。
 */
app.post('/log-click', async (req, res) => {
    const { buttonName } = req.body;
    if (!buttonName) {
        return res.send('錯誤: 未提供按鈕名稱');
    }
    const clientIp = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const logEntry = `Button: ${buttonName} | IP: ${clientIp} | Time: ${timestamp}\n`;

    try {
        await fs.appendFile(clickLogPath, logEntry);
        res.send(`已記錄點擊: ${buttonName} from IP ${clientIp}`);
    } catch (error) {
        res.send(`錯誤: 無法寫入點擊記錄 - ${error.message}`);
    }
});

// Serve static files from the C:\webtest directory.
app.use(express.static('C:\\webtest'));

/**
 * @function startPythonMonitor
 * @description 啟動背景 Python APK 監控腳本。
 * 這個函式會生成一個子進程來執行 download_files.py，
 * 並將其輸出導向到 Node.js 的主控台，方便統一查看日誌。
 */
function startPythonMonitor() {
    // Python 腳本的絕對路徑
    const pythonScriptPath = 'C:\\icppython\\download_files.py';

    console.log(`\n[系統] 準備啟動 Python APK 監控腳本: ${pythonScriptPath}\n`);

    // 使用 spawn 啟動 Python 子進程
    const pythonProcess = spawn('python', [pythonScriptPath], {
        // **主要修改**：設定 stdio 選項為 'inherit'
        // 這會讓子進程的 stdin, stdout, stderr 直接繼承父進程 (Node.js)
        stdio: 'inherit'
    });

    // 監聽子進程關閉事件
    pythonProcess.on('close', (code) => {
        // 根據退出碼顯示不同訊息
        if (code === 0) {
            console.log(`\n[系統] Python 監控腳本已正常結束。`);
        } else {
            console.log(`\n[系統] Python 監控腳本已結束，退出碼: ${code}。`);
        }
    });

    // 監聽子進程錯誤事件 (例如，'python' 命令不存在或路徑錯誤)
    pythonProcess.on('error', (err) => {
        console.error(`\n[系統] 無法啟動 Python 監控腳本: ${err.message}\n`);
    });
}


/**
 * 啟動 Express 伺服器
 * 伺服器將監聽在指定的連接埠上，並在啟動後同步執行 Python 監控腳本。
 */
app.listen(port, () => {
    console.log(`[Node.js] 網頁伺服器運行在 http://localhost:${port}`);

    // 在伺服器成功啟動後，呼叫函式來啟動 Python 監控腳本
    startPythonMonitor();
});