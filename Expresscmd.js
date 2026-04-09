const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- 腳本路徑設定 ---
const scriptPath = 'C:\\webtest\\cosmed.js';
const webScriptPath = 'C:\\webtest\\cosmedweb.js';
const foodomoScriptPath = 'C:\\webtest\\foodomo.js';
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
const processRidePaymentScriptPath = 'C:\\webtest\\processRidePayment.js';
const processRidePaymentMrtAdultScriptPath = 'C:\\webtest\\processRidePaymentmrtadult.js';
const iyugoSlackScriptPath = 'C:\\webtest\\iyugoslack.js';
const marketTopUpUatScriptPath = 'C:\\webtest\\markettopupuat.js';

const clickLogPath = path.join('C:\\webtest', 'click_log.txt');

// --- WebSocket 終端機邏輯 ---
io.on('connection', (socket) => {
    // 根據作業系統選擇 shell (Windows 預設使用 powershell)
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 25,
        cwd: 'C:\\webtest',
        env: process.env
    });

    // 將 PTY 輸出傳送到前端
    ptyProcess.onData((data) => {
        socket.emit('terminal-output', data);
    });

    // 接收前端輸入
    socket.on('terminal-input', (data) => {
        ptyProcess.write(data);
    });

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>網頁測試工具 + 終端機系統</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.css" />
            <script src="https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js"></script>
            <script src="/socket.io/socket.io.js"></script>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
                .section-card { background-color: #ffffff; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; }
                .section-title { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; }
                #output { background-color: #0f172a; color: #93c5fd; border-radius: 0.5rem; padding: 1rem; white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; min-height: 150px; }
                #terminal-container { background-color: #000; padding: 10px; border-radius: 0.5rem; }
            </style>
        </head>
        <body class="p-4 sm:p-6 text-slate-700">
            <div class="max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-center text-slate-800 mb-6">網頁測試工具系統</h1>

                <div class="mb-8">
                    <button onclick="toggleStatus()" class="w-full flex justify-between items-center bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                        <div class="flex items-center">
                            <span id="statusIndicator" class="w-3 h-3 rounded-full mr-4 shadow-sm"></span>
                            <span class="font-bold text-lg text-slate-800">當前測試功能狀態</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <span id="statusSummary" class="text-sm font-medium"></span>
                            <svg id="statusArrow" class="w-6 h-6 transform transition-transform duration-300 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </button>
                    <div id="statusSection" class="hidden mt-2 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 border-b border-slate-100">
                                <tr class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                                    <th class="px-6 py-3">測試管道</th><th class="px-6 py-3">功能名稱</th><th class="px-6 py-3">狀態</th><th class="px-6 py-3">備註</th>
                                </tr>
                            </thead>
                            <tbody id="test-status-body" class="divide-y divide-slate-50"></tbody>
                        </table>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="section-card">
                        <h2 class="section-title text-indigo-700">一般掃碼付款</h2>
                        <div class="space-y-3 mt-auto">
                            <input type="text" id="barcode" placeholder="輸入付款條碼" class="block w-full rounded-md border-slate-200 py-2 px-3 ring-1 ring-slate-200 sm:text-sm">
                            <div class="grid grid-cols-1 gap-2">
                                <button onclick="executeScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">康是美扣款</button>
                                <button onclick="executeWebScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">康是美Web</button>
                                <button onclick="executeBooksWebScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500">博客來Web</button>
                            </div>
                        </div>
                    </div>
                    <div class="section-card">
                        <h2 class="section-title text-indigo-700">乘車碼扣款</h2>
                        <div class="space-y-4 mt-auto text-sm">
                            <div><label class="font-medium">市公車參數:</label><input type="text" id="rideCodeArgument" class="mt-1 w-full rounded-md border-slate-200 ring-1 ring-slate-200 py-2 px-3"><button onclick="executeProcessRidePayment()" class="mt-2 w-full rounded-md bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500 text-xs">執行市公車扣款</button></div>
                            <div><label class="font-medium">北捷參數:</label><input type="text" id="mrtRideCodeArgument" class="mt-1 w-full rounded-md border-slate-200 ring-1 ring-slate-200 py-2 px-3"><button onclick="executeProcessRidePaymentMrtAdult()" class="mt-2 w-full rounded-md bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500 text-xs">執行北捷一般票扣款</button></div>
                        </div>
                    </div>
                    <div class="section-card">
                        <h2 class="section-title text-indigo-700 text-xs">超商交易/儲值</h2>
                        <div class="space-y-3 mt-auto text-sm">
                            <input type="text" id="buyerID" placeholder="反掃條碼" class="w-full ring-1 ring-slate-200 py-2 px-3 rounded-md text-xs">
                            <button onclick="executeMarketPayment()" class="w-full rounded-md bg-indigo-600 py-1.5 text-white hover:bg-indigo-500 text-xs">執行反掃付款</button>
                            <input type="text" id="topUpAmt" placeholder="儲值金額" class="w-full ring-1 ring-slate-200 py-1 px-3 rounded-md text-xs mt-2">
                            <input type="text" id="topUpBuyerID" placeholder="儲值條碼" class="w-full ring-1 ring-slate-200 py-1 px-3 rounded-md text-xs">
                            <div class="grid grid-cols-2 gap-2 mt-1">
                                <button onclick="executeMarketTopUp()" class="bg-indigo-600 py-1.5 text-white rounded hover:bg-indigo-500 text-xs text-center">Stage</button>
                                <button onclick="executeMarketTopUpUat()" class="bg-slate-600 py-1.5 text-white rounded hover:bg-slate-500 text-xs text-center">UAT</button>
                            </div>
                        </div>
                    </div>
                    <div class="section-card">
                        <h2 class="section-title text-sky-700">綁定扣款 (Slack)</h2>
                        <div class="grid grid-cols-2 gap-2 mt-auto text-[10px] font-bold">
                            <button onclick="executeBindingDay()" class="bg-sky-600 py-2 text-white rounded hover:bg-sky-500">天扣-定額</button>
                            <button onclick="executeBindingMonth()" class="bg-sky-600 py-2 text-white rounded hover:bg-sky-500">月扣-不定額</button>
                            <button onclick="executeBindingSeason()" class="bg-sky-600 py-2 text-white rounded hover:bg-sky-500">季扣-不定額</button>
                            <button onclick="executeBindingYear()" class="bg-sky-600 py-2 text-white rounded hover:bg-sky-500">年扣-定額</button>
                            <button onclick="executeBinding711()" class="bg-slate-600 py-2 text-white rounded hover:bg-slate-500 col-span-2">7-11 會員 (UAT)</button>
                        </div>
                    </div>
                    <div class="section-card">
                        <h2 class="section-title text-emerald-700">其他服務</h2>
                        <div class="grid grid-cols-1 gap-2 mt-auto">
                            <button onclick="executeFoodomoScript()" class="bg-emerald-600 py-2 text-sm font-semibold text-white rounded hover:bg-emerald-500">foodomo</button>
                            <button onclick="executeIyugoSlack()" class="bg-emerald-600 py-2 text-sm font-semibold text-white rounded hover:bg-emerald-500">i預購隨時取</button>
                            <button onclick="executekfcjumpScript()" class="bg-emerald-600 py-2 text-xs font-semibold text-white rounded hover:bg-emerald-500">KFC 跳轉</button>
                        </div>
                    </div>
                    <div class="section-card">
                        <h2 class="section-title text-indigo-700 text-xs">韓國跨境支付</h2>
                        <div class="space-y-3 mt-auto">
                            <input type="text" id="fiscKorBuyerID" placeholder="BuyerID" class="w-full ring-1 ring-slate-200 py-2 px-3 rounded-md text-xs">
                            <button onclick="executeFiscKor()" class="w-full bg-indigo-600 py-2 text-xs font-semibold text-white rounded hover:bg-indigo-500">執行跨境扣款</button>
                        </div>
                    </div>
                </div>

                <div class="section-card mb-8">
                    <h2 class="section-title text-slate-800">即時本機命令字元 (Terminal)</h2>
                    <div id="terminal-container"></div>
                </div>

                <div class="section-card">
                    <h2 class="section-title text-slate-800">按鈕指令執行輸出</h2>
                    <pre id="output" class="text-xs">等待指令執行...</pre>
                </div>
            </div>

            <script>
                // --- 1. 終端機 (xterm.js) 與 Socket.io 設定 ---
                const term = new Terminal({
                    cursorBlink: true,
                    fontSize: 14,
                    theme: { background: '#000000', foreground: '#ffffff' }
                });
                const socket = io();
                term.open(document.getElementById('terminal-container'));

                // 接收後端 PTY 輸出
                socket.on('terminal-output', (data) => {
                    term.write(data);
                });

                // 傳送前端輸入到後端 PTY
                term.onData((data) => {
                    socket.emit('terminal-input', data);
                });

                // --- 2. 原有的 UI 狀態設定 ---
                const testData = [
                    { cat: "手機測試工具/網頁", func: "現金儲值", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "超商反掃付款", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "超商反掃退款", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "康事美實體店家扣款", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "康事美跳轉付款", status: "正常", note: "" },
                    { cat: "網頁", func: "康事美WEB付款", status: "正常", note: "" },
                    { cat: "網頁", func: "授權綁定/解綁/天扣", status: "正常", note: "" },
                    { cat: "網頁", func: "授權綁定/解綁/月扣", status: "正常", note: "" },
                    { cat: "網頁", func: "授權綁定/解綁/季扣", status: "正常", note: "" },
                    { cat: "網頁", func: "授權綁定/解綁/年扣", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "北捷乘車碼扣款", status: "正常", note: "" },
                    { cat: "手機測試工具", func: "美廉社3DS驗證", status: "正常", note: "" },
                    { cat: "手機測試工具/網頁", func: "韓國跨境支付", status: "正常", note: "" }
                ];

                function initStatus() {
                    const tbody = document.getElementById('test-status-body');
                    const indicator = document.getElementById('statusIndicator');
                    const summary = document.getElementById('statusSummary');
                    let errorCount = 0;
                    tbody.innerHTML = testData.map(item => {
                        const isFail = item.status.includes("失敗");
                        if (isFail) errorCount++;
                        return \`
                            <tr class="\${isFail ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'} transition-colors">
                                <td class="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase">\${item.cat}</td>
                                <td class="px-6 py-3 text-sm font-medium text-slate-700">\${item.func}</td>
                                <td class="px-6 py-3 text-sm"><span class="\${isFail ? 'text-red-600 font-bold animate-pulse' : 'text-green-600 font-semibold'}">\${isFail ? '❌ ' + item.status : '● ' + item.status}</span></td>
                                <td class="px-6 py-3 text-[10px] text-slate-400 font-medium">\${item.note || '-'}</td>
                            </tr>\`;
                    }).join('');

                    if (errorCount > 0) {
                        indicator.className = "w-3 h-3 bg-red-500 rounded-full mr-4 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse";
                        summary.innerText = errorCount + " 項功能異常"; summary.className = "text-sm text-red-600 font-bold";
                    } else {
                        indicator.className = "w-3 h-3 bg-green-500 rounded-full mr-4 shadow-[0_0_8px_rgba(34,197,94,0.7)]";
                        summary.innerText = "所有功能正常"; summary.className = "text-sm text-green-600 font-medium";
                    }
                }

                function toggleStatus() {
                    document.getElementById('statusSection').classList.toggle('hidden');
                    document.getElementById('statusArrow').classList.toggle('rotate-180');
                }
                window.onload = initStatus;

                // --- 3. 原有的腳本執行函式 ---
                function logClick(buttonName) { fetch('/log-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buttonName }) }); }
                function executeScript() { logClick('康事美扣款'); const barcode = document.getElementById('barcode').value; fetch('/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barcode }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeWebScript() { fetch('/execute-web-script', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeProcessRidePayment() { const rideArgument = document.getElementById('rideCodeArgument').value; fetch('/execute-process-ride-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rideArgument }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeProcessRidePaymentMrtAdult() { const mrtRideArgument = document.getElementById('mrtRideCodeArgument').value; fetch('/execute-process-ride-payment-mrt-adult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mrtRideArgument }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeMarketPayment() { const buyerID = document.getElementById('buyerID').value; fetch('/execute-market-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyerID }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeMarketTopUp() { const topUpAmt = document.getElementById('topUpAmt').value; const buyerID = document.getElementById('topUpBuyerID').value; fetch('/execute-market-topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topUpAmt, buyerID }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeMarketTopUpUat() { const topUpAmt = document.getElementById('topUpAmt').value; const buyerID = document.getElementById('topUpBuyerID').value; fetch('/execute-market-topup-uat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topUpAmt, buyerID }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeMarketRefund() { const refundBuyerID = document.getElementById('refundBuyerID').value; fetch('/execute-market-refund', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refundBuyerID }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBindingDay() { fetch('/execute-binding-day', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBindingMonth() { fetch('/execute-binding-month', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBindingSeason() { fetch('/execute-binding-season', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBindingYear() { fetch('/execute-binding-year', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBinding711() { fetch('/execute-binding-711', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeBooksWebScript() { fetch('/execute-books-web-script', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeFoodomoScript() { fetch('/execute-foodomo', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executekfcjumpScript() { fetch('/execute-kfc-jump-script', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeIyugoSlack() { fetch('/execute-iyugo-slack', { method: 'POST' }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
                function executeFiscKor() { const buyerID = document.getElementById('fiscKorBuyerID').value; fetch('/execute-fisc-kor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyerID }) }).then(res => res.text()).then(t => document.getElementById('output').innerText = t); }
            </script>
        </body>
        </html>
    `);
});

// --- 後端執行 Node 腳本邏輯 ---
const executeNodeScript = (scriptFullPath, reqBody, res) => {
    let inputData = '';
    if (scriptFullPath === scriptPath && reqBody.barcode) inputData = reqBody.barcode + "\n";
    else if (scriptFullPath === fiscKorScriptPath && reqBody.buyerID) inputData = reqBody.buyerID + "\n";
    else if (scriptFullPath === marketPaymentScriptPath && reqBody.buyerID) inputData = reqBody.buyerID + "\n";
    else if (scriptFullPath === marketTopUpScriptPath && reqBody.topUpAmt && reqBody.buyerID) inputData = reqBody.topUpAmt + "\n" + reqBody.buyerID + "\n";
    else if (scriptFullPath === marketTopUpUatScriptPath && reqBody.topUpAmt && reqBody.buyerID) inputData = reqBody.topUpAmt + "\n" + reqBody.buyerID + "\n";
    else if (scriptFullPath === marketTopRefundScriptPath && reqBody.refundBuyerID) inputData = reqBody.refundBuyerID + "\n";

    const proc = spawn('node', [scriptFullPath]);
    if (inputData) { proc.stdin.write(inputData); proc.stdin.end(); }
    let output = '';
    proc.stdout.on('data', (d) => output += d.toString());
    proc.stderr.on('data', (d) => output += 'Error: ' + d.toString());
    proc.on('close', (code) => res.send(`執行 ${path.basename(scriptFullPath)} 結果:\n${output}`));
};

// --- API 路由設定 ---
app.post('/execute', (req, res) => executeNodeScript(scriptPath, req.body, res));
app.post('/execute-fisc-kor', (req, res) => executeNodeScript(fiscKorScriptPath, req.body, res));
app.post('/execute-process-ride-payment', (req, res) => {
    const { rideArgument } = req.body;
    const proc = spawn('node', [processRidePaymentScriptPath, rideArgument]);
    let output = ''; proc.stdout.on('data', (d) => output += d.toString());
    proc.on('close', () => res.send(output));
});
app.post('/execute-process-ride-payment-mrt-adult', (req, res) => {
    const { mrtRideArgument } = req.body;
    const proc = spawn('node', [processRidePaymentMrtAdultScriptPath, mrtRideArgument]);
    let output = ''; proc.stdout.on('data', (d) => output += d.toString());
    proc.on('close', () => res.send(output));
});
app.post('/execute-web-script', (req, res) => executeNodeScript(webScriptPath, req.body, res));
app.post('/execute-market-payment', (req, res) => executeNodeScript(marketPaymentScriptPath, req.body, res));
app.post('/execute-market-topup', (req, res) => executeNodeScript(marketTopUpScriptPath, req.body, res));
app.post('/execute-market-topup-uat', (req, res) => executeNodeScript(marketTopUpUatScriptPath, req.body, res));
app.post('/execute-market-refund', (req, res) => executeNodeScript(marketTopRefundScriptPath, req.body, res));
app.post('/execute-binding-day', (req, res) => executeNodeScript(bindingDayScriptPath, req.body, res));
app.post('/execute-binding-month', (req, res) => executeNodeScript(bindingMonthScriptPath, req.body, res));
app.post('/execute-binding-season', (req, res) => executeNodeScript(bindingSeasonScriptPath, req.body, res));
app.post('/execute-binding-year', (req, res) => executeNodeScript(bindingYearScriptPath, req.body, res));
app.post('/execute-binding-711', (req, res) => executeNodeScript(binding711ScriptPath, req.body, res));
app.post('/execute-books-web-script', (req, res) => executeNodeScript(booksWebScriptPath, req.body, res));
app.post('/execute-foodomo', (req, res) => executeNodeScript(foodomoScriptPath, req.body, res));
app.post('/execute-kfc-jump-script', (req, res) => executeNodeScript(kfcjumpScriptPath, req.body, res));
app.post('/execute-iyugo-slack', (req, res) => executeNodeScript(iyugoSlackScriptPath, req.body, res));

app.post('/log-click', async (req, res) => {
    const entry = `Button: ${req.body.buttonName} | Time: ${new Date().toLocaleString()}\n`;
    await fs.appendFile(clickLogPath, entry);
    res.send('ok');
});

app.use(express.static('C:\\webtest'));

// 使用 server.listen 而非 app.listen 以支援 Socket.io
server.listen(port, () => {
    console.log(`[Node.js] 伺服器啟動於 http://localhost:${port}`);
    // 啟動背景 Python 腳本
    spawn('python', ['C:\\icppython\\download_files.py'], { stdio: 'inherit' });
});