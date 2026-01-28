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
const processRidePaymentScriptPath = 'C:\\webtest\\processRidePayment.js';
const processRidePaymentMrtAdultScriptPath = 'C:\\webtest\\processRidePaymentmrtadult.js';
const iyugoSlackScriptPath = 'C:\\webtest\\iyugoslack.js';
const marketTopUpUatScriptPath = 'C:\\webtest\\markettopupuat.js';

// 點擊日誌檔案的路徑
const clickLogPath = path.join('C:\\webtest', 'click_log.txt');

/**
 * @route GET /
 * @description 伺服器根路徑，提供包含條碼掃描功能的 HTML 頁面。
 */
app.get('/', (req, res) => {
    // 【***排版再次優化***】: 調整為多欄式網格佈局，讓所有功能區塊盡可能顯示在同一畫面
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>網頁測試工具</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f1f5f9;
                }
                .section-card {
                    background-color: #ffffff;
                    border-radius: 0.75rem;
                    padding: 1.25rem; /* 稍微減少 padding */
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    display: flex; /* 使用 flexbox 讓卡片等高 */
                    flex-direction: column;
                }
                .section-title {
                    font-size: 1.125rem; /* 18px */
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.75rem;
                }
                #output {
                    background-color: #0f172a;
                    color: #93c5fd;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-family: 'Courier New', Courier, monospace;
                    min-height: 150px;
                    overflow-x: auto;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                }
            </style>
        </head>
        <body class="p-4 sm:p-6">
            <div class="max-w-7xl mx-auto"> <h1 class="text-3xl font-bold text-center text-slate-800 mb-6">網頁測試工具</h1>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

                    <div class="section-card">
                        <h2 class="section-title">一般掃碼付款</h2>
                        <div class="space-y-3 mt-auto">
                            <input type="text" id="barcode" placeholder="輸入或貼上付款條碼" class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                            <div class="grid grid-cols-1 gap-2">
                                <button onclick="executeScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">康是美扣款</button>
                                <button onclick="executeWebScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">康是美Web</button>
                                <button onclick="executeBooksWebScript()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">博客來Web</button>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <h2 class="section-title">乘車碼扣款</h2>
                        <div class="space-y-4 mt-auto">
                            <div>
                                <label for="rideCodeArgument" class="block text-sm font-medium leading-6 text-gray-900">市公車乘車碼:</label>
                                <input type="text" id="rideCodeArgument" placeholder="貼上乘車碼參數" class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <button onclick="executeProcessRidePayment()" class="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行市公車扣款</button>
                            </div>
                            <div>
                                <label for="mrtRideCodeArgument" class="block text-sm font-medium leading-6 text-gray-900">北捷乘車碼 (一般票):</label>
                                <input type="text" id="mrtRideCodeArgument" placeholder="貼上北捷乘車碼參數" class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <button onclick="executeProcessRidePaymentMrtAdult()" class="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行北捷一般票扣款</button>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <h2 class="section-title">超商交易</h2>
                        <div class="space-y-3 mt-auto">
                            <div>
                                <label for="buyerID" class="block text-sm font-medium leading-6 text-gray-900">超商反掃付款:</label>
                                <input type="text" id="buyerID" placeholder="輸入付款條碼" class="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <button onclick="executeMarketPayment()" class="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行反掃付款</button>
                            </div>
                             <div>
                                <label class="block text-sm font-medium leading-6 text-gray-900">超商現金儲值:</label>
                                <div class="mt-1 space-y-2">
                                    <input type="text" id="topUpAmt" placeholder="輸入儲值金額" class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                    <input type="text" id="topUpBuyerID" placeholder="輸入現金儲值條碼" class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                    <div class="grid grid-cols-2 gap-2">
                                        <button onclick="executeMarketTopUp()" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行 (Stage)</button>
                                        <button onclick="executeMarketTopUpUat()" class="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500">執行 (UAT)</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label for="refundBuyerID" class="block text-sm font-medium leading-6 text-gray-900">取消現金儲值退款:</label>
                                <input type="text" id="refundBuyerID" placeholder="輸入退款儲值條碼" class="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <button onclick="executeMarketRefund()" class="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行儲值退款</button>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <h2 class="section-title">綁定扣款設定 (QRcode → Slack)</h2>
                        <div class="grid grid-cols-2 gap-2 mt-auto">
                            <button onclick="executeBindingDay()" class="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">天扣-定額-不可改</button>
                            <button onclick="executeBindingMonth()" class="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">月扣-不定額-可改</button>
                            <button onclick="executeBindingSeason()" class="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">季扣-不定額-不可改</button>
                            <button onclick="executeBindingYear()" class="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">年扣-定額-可改</button>
                            <button onclick="executeBinding711()" class="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 col-span-2">7-11會員 (UAT)</button>
                            <button onclick="executeBinding711memformal()" class="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 col-span-2">7-11會員 (正式)</button>
                        </div>
                    </div>

                    <div class="section-card">
                        <h2 class="section-title">其他服務 (URL/QRcode → Slack)</h2>
                        <div class="grid grid-cols-1 gap-2 mt-auto">
                            <button onclick="executeIyugoSlack()" class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">i預購隨時取</button>
                            <button onclick="executekfcjumpScript()" class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">富利餐飲(KFC)跳轉</button>
                        </div>
                    </div>

                    <div class="section-card">
                        <h2 class="section-title">韓國跨境扣款 (財經測試)</h2>
                        <div class="space-y-3 mt-auto">
                            <label for="fiscKorBuyerID" class="block text-sm font-medium leading-6 text-gray-900">BuyerID:</label>
                            <input type="text" id="fiscKorBuyerID" placeholder="輸入BuyerID" class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                            <button onclick="executeFiscKor()" class="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">執行韓國跨境扣款</button>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <h2 class="section-title">執行結果</h2>
                    <pre id="output">等待執行...</pre>
                </div>
            </div>

            <script>
                // JavaScript 邏輯部分保持不變
                // ... (您所有的 <script> 內容都複製到這裡)
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

                function executeProcessRidePaymentMrtAdult() {
                    logClick('北捷乘車碼一般人扣款');
                    const mrtRideArgument = document.getElementById('mrtRideCodeArgument').value;
                    if (!mrtRideArgument) {
                        document.getElementById('output').innerText = '請貼上北捷乘車碼參數';
                        return;
                    }
                    fetch('/execute-process-ride-payment-mrt-adult', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mrtRideArgument: mrtRideArgument })
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

// --- 後端路由和伺服器啟動邏輯 (此部分保持不變) ---

/**
 * @function executeNodeScript
 * @description 輔助函數：用於生成子進程並執行 Node.js 腳本，處理其輸出。
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
    } else if (scriptFullPath === marketTopUpUatScriptPath && reqBody.topUpAmt && reqBody.buyerID) {
        inputData = reqBody.topUpAmt + "\n" + reqBody.buyerID + "\n";
    } else if (scriptFullPath === marketTopRefundScriptPath && reqBody.refundBuyerID) {
        inputData = reqBody.refundBuyerID + "\n";
    }

    const process = spawn('node', [scriptFullPath]);

    if (inputData) {
        process.stdin.write(inputData);
        process.stdin.end();
    }

    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });

    process.on('close', (code) => {
        if (code !== 0) {
            res.send(`執行 ${path.basename(scriptFullPath)} 失敗，退出碼: ${code}\n${output}`);
        } else {
            res.send(`執行 ${path.basename(scriptFullPath)} 結果:\n${output}`);
        }
    });
    process.on('error', (err) => {
        res.send(`啟動 ${path.basename(scriptFullPath)} 錯誤: ${err.message}`);
    });
};

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

app.post('/execute-process-ride-payment', (req, res) => {
    const { rideArgument } = req.body;
    if (!rideArgument) { return res.send('錯誤: 未提供乘車碼參數'); }
    const process = spawn('node', [processRidePaymentScriptPath, rideArgument]);
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', (code) => { res.send(code === 0 ? `執行結果:\n${output}` : `執行失敗，退出碼: ${code}\n${output}`); });
    process.on('error', (err) => { res.send(`啟動錯誤: ${err.message}`); });
});

app.post('/execute-process-ride-payment-mrt-adult', (req, res) => {
    const { mrtRideArgument } = req.body;
    if (!mrtRideArgument) { return res.send('錯誤: 未提供北捷乘車碼參數'); }
    const process = spawn('node', [processRidePaymentMrtAdultScriptPath, mrtRideArgument]);
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', (code) => { res.send(code === 0 ? `執行結果:\n${output}` : `執行失敗，退出碼: ${code}\n${output}`); });
    process.on('error', (err) => { res.send(`啟動錯誤: ${err.message}`); });
});

app.post('/execute-web-script', (req, res) => { executeNodeScript(webScriptPath, req.body, res); });
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
app.post('/execute-binding-day', (req, res) => { executeNodeScript(bindingDayScriptPath, req.body, res); });
app.post('/execute-binding-month', (req, res) => { executeNodeScript(bindingMonthScriptPath, req.body, res); });
app.post('/execute-binding-season', (req, res) => { executeNodeScript(bindingSeasonScriptPath, req.body, res); });
app.post('/execute-binding-year', (req, res) => { executeNodeScript(bindingYearScriptPath, req.body, res); });
app.post('/execute-binding-711', (req, res) => { executeNodeScript(binding711ScriptPath, req.body, res); });
app.post('/execute-binding-711memformal', (req, res) => { executeNodeScript(binding711memformalScriptPath, req.body, res); });
app.post('/execute-books-web-script', (req, res) => { executeNodeScript(booksWebScriptPath, req.body, res); });
app.post('/execute-kfc-jump-script', (req, res) => { executeNodeScript(kfcjumpScriptPath, req.body, res); });
app.post('/execute-iyugo-slack', (req, res) => { executeNodeScript(iyugoSlackScriptPath, req.body, res); });

app.post('/log-click', async (req, res) => {
    const { buttonName } = req.body;
    if (!buttonName) { return res.send('錯誤: 未提供按鈕名稱'); }
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

app.use(express.static('C:\\webtest'));

function startPythonMonitor() {
    const pythonScriptPath = 'C:\\icppython\\download_files.py';
    console.log(`\n[系統] 準備啟動 Python APK 監控腳本: ${pythonScriptPath}\n`);
    const pythonProcess = spawn('python', [pythonScriptPath], { stdio: 'inherit' });
    pythonProcess.on('close', (code) => { console.log(`\n[系統] Python 監控腳本已結束，退出碼: ${code}。`); });
    pythonProcess.on('error', (err) => { console.error(`\n[系統] 無法啟動 Python 監控腳本: ${err.message}\n`); });
}

app.listen(port, () => {
    console.log(`[Node.js] 網頁伺服器運行在 http://localhost:${port}`);
    startPythonMonitor();
});