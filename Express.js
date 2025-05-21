const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

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
const binding711ScriptPath = 'C:\\webtes20250123\\binding711paid.js';
const binding711memformalScriptPath = 'C:\\webtes20250123\\binding711memformal.js';
const booksWebScriptPath = 'C:\\webtest\\booksweb.js';
const kfcjumpScriptPath = 'C:\\webtes20250123\\kfcjump.js';
const fiscKorScriptPath = 'C:\\webtest\\fisckor.js';
const rideScriptPath = 'C:\\webtest\\ridecode.js';

const paymentUrl = 'https://icp-payment-stage.icashpay.com.tw/Payment/ONLMerchant/SendTradeInfo?EncData=iikipS2y%2BkWFlOKhPs4Q%2BauZT1SMxc%2BSVS3CGqvnpxtY43xl%2B4bVN3syvs3b5meE9LbzihaEASk3xPp82ZOHQLJpluBjc1ocXlYyrojcNZTciLUYh0MJOLBQg1Y2UmD9UYHWQf0Y9CGcMwYVRXavJy4rFXGYYOY%2FuKrl12wE2A6VGZwjyqVR%2BYqM3i9i4AbvzpAerTcgSiN4Fi3N2sHjHxEmvuiEKSqwwT7vyOQvzQQ9UCG6tINqH1JMCb2X7A%2FaJGgRYuML1XRzYVbN4TskdP%2F8Ym7o3Ae6net60tE%2By%2BQThobDVKiGr0zxmJOHJdQA';

const clickLogPath = path.join('C:\\webtest', 'click_log.txt');

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <script>
                function logClick(buttonName) {
                    fetch('/log-click', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ buttonName })
                    })
                    .then(response => response.text())
                    .then(result => {
                        console.log(result);
                    })
                    .catch(error => {
                        console.error('點擊記錄錯誤: ' + error);
                    });
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
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
                
                function executeWebScript() {
                    logClick('康事美掃描Web付款');
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

                function executerideScriptPath() {
                    logClick('乘車碼扣款');
                    fetch('/execute-ride-script', {
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
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
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
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    });
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
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    });
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
                    .then(result => {
                        document.getElementById('output').innerText = result;
                    })
                    .catch(error => {
                        document.getElementById('output').innerText = '發生錯誤: ' + error;
                    });
                }
                
                function executeBindingDay() {
                    logClick('綁定扣款天扣定額不可改');
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
                    logClick('綁定扣款月扣不定額可改');
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
                    logClick('綁定扣款季扣不定額不可改');
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
                    logClick('綁定扣款年扣定額可改');
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

                function executeBinding711() {
                    logClick('UAT綁定統一超商付費會員');
                    fetch('/execute-binding-711', {
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

                function executeBinding711memformal() {
                    logClick('正式綁定統一超商付費會員');
                    fetch('/execute-binding-711memformal', {
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

                function executeBooksWebScript() {
                    logClick('博客來掃描Web付款');
                    fetch('/execute-books-web-script', {
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

                function executekfcjumpScript() {
                    logClick('富利餐飲KFC跳轉URL');
                    fetch('/execute-kfc-jump-script', {
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
            <button onclick="executeBooksWebScript()">執行博客來掃描Web付款</button>
            <h2>韓國跨境扣款:財經測試時間平日九點至下午五點</h2>
            <input type="text" id="fiscKorBuyerID" placeholder="輸入BuyerID">
            <button onclick="executeFiscKor()">執行韓國跨境扣款財經測試環境</button>
            <h2>輸入超商反掃付款:</h2>
            <input type="text" id="buyerID" placeholder="輸入付款條碼">
            <button onclick="executeMarketPayment()">執行超商反掃付款</button>
            <h2>輸入超商現金儲值交易:</h2>
            <input type="text" id="topUpAmt" placeholder="輸入儲值金額">
            <input type="text" id="topUpBuyerID" placeholder="輸入現金儲值條碼">
            <button onclick="executeMarketTopUp()">執行超商現金儲值交易</button>
            <h2>超商執行取消現金儲值退款:</h2>
            <input type="text" id="refundBuyerID" placeholder="輸入退款儲值條碼">
            <button onclick="executeMarketRefund()">執行超商取消現金儲值退款</button>
            <h2>綁定扣款設定_QRcode傳送至Slack github_webtest:</h2>
            <button onclick="executeBindingDay()">綁定扣款天扣定額不可改</button>
            <button onclick="executeBindingMonth()">綁定扣款月扣不定額可改</button>
            <button onclick="executeBindingSeason()">綁定扣款季扣不定額不可改</button>
            <button onclick="executeBindingYear()">綁定扣款年扣定額可改</button>
            <button onclick="executeBinding711()">UAT綁定統一超商付費會員</button>
            <button onclick="executeBinding711memformal()">勿任意使用此為正式綁定統一超商付費會員</button>
            <h2>付款頁跳轉URL_傳送至Slack github_webtest:</h2>
            <button onclick="executekfcjumpScript()">執行富利餐飲KFC跳轉URL</button>
            <button onclick="executerideScriptPath()">執行乘車碼扣款需使用固定帳號登入tester184</button>
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

app.post('/execute-fisc-kor', (req, res) => {
    const buyerID = req.body.buyerID;
    if (!buyerID) {
        return res.send('請輸入BuyerID');
    }
    const process = spawn('node', [fiscKorScriptPath]);
    process.stdin.write(buyerID + "\n");
    process.stdin.end();
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-ride-script', (req, res) => {
    const process = spawn('node', [rideScriptPath]);
    
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

app.post('/execute-binding-711', (req, res) => {
    const process = spawn('node', [binding711ScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-binding-711memformal', (req, res) => {
    const process = spawn('node', [binding711memformalScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-books-web-script', (req, res) => {
    const process = spawn('node', [booksWebScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/execute-kfc-jump-script', (req, res) => {
    const process = spawn('node', [kfcjumpScriptPath]);
    
    let output = '';
    process.stdout.on('data', (data) => { output += data.toString(); });
    process.stderr.on('data', (data) => { output += '錯誤輸出: ' + data.toString(); });
    process.on('close', () => { res.send(`執行結果:\n${output}`); });
});

app.post('/log-click', async (req, res) => {
    const { buttonName } = req.body;
    if (!buttonName) {
        return res.send('錯誤: 未提供按鈕名稱');
    }
    // Get client IP address
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

app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
});