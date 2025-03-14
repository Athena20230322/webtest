const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const scriptPath = 'C:\\webtest\\cosmed.js';
const webScriptPath = 'C:\\webtest\\cosmedweb.js';
const marketPaymentScriptPath = 'C:\\webtest\\marketpayment.js';
const marketTopUpScriptPath = 'C:\\webtest\\markettopup.js';
const marketTopRefundScriptPath = 'C:\\webtest\\markettoprefund.js';
const bindingDayScriptPath = 'C:\\webtes20250123\\bindingday.js';
const bindingMonthScriptPath = 'C:\\webtes20250123\\bindingmonth.js';
const bindingSeasonScriptPath = 'C:\\webtes20250123\\bindingseason.js';
const bindingYearScriptPath = 'C:\\webtes20250123\\bindingyear.js';
const paymentUrl = 'https://icp-payment-stage.icashpay.com.tw/Payment/ONLMerchant/SendTradeInfo?EncData=iikipS2y%2BkWFlOKhPs4Q%2BauZT1SMxc%2BSVS3CGqvnpxtY43xl%2B4bVN3syvs3b5meE9LbzihaEASk3xPp82ZOHQLJpluBjc1ocXlYyrojcNZTciLUYh0MJOLBQg1Y2UmD9UYHWQf0Y9CGcMwYVRXavJy4rFXGYYOY%2FuKrl12wE2A6VGZwjyqVR%2BYqM3i9i4AbvzpAerTcgSiN4Fi3N2sHjHxEmvuiEKSqwwT7vyOQvzQQ9UCG6tINqH1JMCb2X7A%2FaJGgRYuML1XRzYVbN4TskdP%2F8Ym7o3Ae6net60tE%2By%2BQThobDVKiGr0zxmJOHJdQA';

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <script>
                function executeScript() {
                    const barcode = document.getElementById('barcode').value;
                    fetch('/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barcode })
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
                
                function executeWebScript() {
                    fetch('/execute-web-script', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
                
                function executeMarketPayment() {
                    const buyerID = document.getElementById('buyerID').value;
                    fetch('/execute-market-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ buyerID })
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    });
                }
                
                function executeMarketTopUp() {
                    const topUpAmt = document.getElementById('topUpAmt').value;
                    const buyerID = document.getElementById('topUpBuyerID').value;
                    fetch('/execute-market-topup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topUpAmt, buyerID })
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    });
                }
                
                function executeMarketRefund() {
                    const refundBuyerID = document.getElementById('refundBuyerID').value;
                    fetch('/execute-market-refund', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refundBuyerID })
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
                
                function executeBindingDay() {
                    fetch('/execute-binding-day', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }

                function executeBindingMonth() {
                    fetch('/execute-binding-month', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }

                function executeBindingSeason() {
                    fetch('/execute-binding-season', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }

                function executeBindingYear() {
                    fetch('/execute-binding-year', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
            </script>
        </head>
        <body>
            <h2>輸入付款條碼並執行:</h2>
            <input type="text" id="barcode" placeholder="輸入條碼">
            <button onclick="executeScript()">執行康事美扣款</button>
            <button onclick="executeWebScript()">執行康事美掃描Web付款</button>
            <h2>輸入超商反掃付款:</h2>
            <input type="text" id="buyerID" placeholder="輸入付款條碼">
            <button onclick="executeMarketPayment()">執行超商反掃付款</button>
            <h2>輸入超商現金儲值交易:</h2>
            <input type="text" id="topUpAmt" placeholder="輸入儲值金額">
            <input type="text" id="topUpBuyerID" placeholder="輸入現金儲值條碼">
            <button onclick="executeMarketTopUp()">執行超商現金儲值交易</button>
            <h2>超商執行退款:</h2>
            <input type="text" id="refundBuyerID" placeholder="輸入退款條碼">
            <button onclick="executeMarketRefund()">執行超商退款</button>
            <h2>綁定扣款設定_QRcode傳送至Slack github_webtest:</h2>
            <button onclick="executeBindingDay()">綁定扣款天扣定額不可改</button>
            <button onclick="executeBindingMonth()">綁定扣款月扣不定額可改</button>
            <button onclick="executeBindingSeason()">綁定扣款季扣不定額不可改</button>
            <button onclick="executeBindingYear()">綁定扣款年扣定額可改</button>
            <h3>執行結果:</h3>
            <pre id="output">等待執行...</pre>
        </body>
        </html>
    `);
});

app.post('/execute', (req, res) => {
    const barcode = req.body.barcode;
    if (!barcode) {
        return res.send('請輸入付款條碼');
    }
    const process = spawn('node', [scriptPath]);
    process.stdin.write(barcode + "\n");
    process.stdin.end();
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-web-script', (req, res) => {
    const process = spawn('node', [webScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-market-payment', (req, res) => {
    const buyerID = req.body.buyerID;
    if (!buyerID) {
        return res.send('請輸入付款條碼');
    }
    const process = spawn('node', [marketPaymentScriptPath]);
    process.stdin.write(buyerID + "\n");
    process.stdin.end();
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-market-topup', (req, res) => {
    const { topUpAmt, buyerID } = req.body;
    if (!topUpAmt || !buyerID) {
        return res.send('請輸入儲值金額和現金儲值條碼');
    }
    const process = spawn('node', [marketTopUpScriptPath]);
    process.stdin.write(topUpAmt + "\n" + buyerID + "\n");
    process.stdin.end();
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-market-refund', (req, res) => {
    const refundBuyerID = req.body.refundBuyerID;
    if (!refundBuyerID) {
        return res.send('請輸入退款條碼');
    }
    const process = spawn('node', [marketTopRefundScriptPath]);
    process.stdin.write(refundBuyerID + "\n");
    process.stdin.end();
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-binding-day', (req, res) => {
    const process = spawn('node', [bindingDayScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-binding-month', (req, res) => {
    const process = spawn('node', [bindingMonthScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-binding-season', (req, res) => {
    const process = spawn('node', [bindingSeasonScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-binding-year', (req, res) => {
    const process = spawn('node', [bindingYearScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
});