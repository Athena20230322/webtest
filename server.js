const express = require('express');
const app = express();
const port = 8082;

const mockBills = {
  '9999999999': {
    billNumber: '9999999999',
    status: 'unpaid',
    SN: 'FAKE202504228888888',
    Q2: 'FAKEHASHQ2',
    Q3: 'FAKEHASHQ3',
    S1: 'FAKES1',
    S2: 'FAKES2',
  },
};

// ✅ 查詢 API 模擬
app.get('/icpplus-cht/ICP.html', (req, res) => {
  const q1 = req.query.Q1;
  const bill = mockBills[q1];

  if (!bill) {
    return res.send({ RtnCode: 0, RtnMsg: '查無帳單' });
  }

  const result = {
    RtnCode: 1,
    RtnMsg: "成功",
    EncData: {
      CodeType: 1,
      RtnValue: JSON.stringify({
        CommonID: "",
        ItemID: "TPP00007",
        OriItemID: "0109",
        Category1: "003",
        BillData: {
          BillNumber: bill.billNumber,
          QueryType: "1",
          Query1: bill.billNumber,
          Query2: "P122680069",
          Query3: "",
          EBillSN: bill.SN
        }
      }),
      CodeAction: "0109"
    }
  };

  res.send(result);
});

// ✅ 假繳費畫面
app.get('/mock-cht-pay', (req, res) => {
  const query1 = req.query.Q1 || '';
  const bill = mockBills[query1];

  if (!bill) return res.status(404).send('查無帳單');
  if (bill.status === 'paid') return res.send('此帳單已繳費');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>中華電信費 - 假繳費畫面</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .box { border: 1px solid #ccc; padding: 16px; border-radius: 8px; margin-top: 16px; }
        .button {
          background: orange; color: white; padding: 12px 24px;
          border: none; border-radius: 6px; font-size: 18px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h2>中華電信費</h2>
      <p><strong>設備號碼：</strong> ${bill.billNumber}</p>

      <div class="box">
        <p>列帳年月：114年04月</p>
        <p>繳費期限：2025/04/25</p>
        <p>機構代號：295</p>
        <p>帳單識別：G8</p>
        <p>手續費：0 元</p>
        <h3 style="color: green;">金額：519 元</h3>
      </div>

      <form method="GET" action="/go-pay">
        <input type="hidden" name="Q1" value="${bill.billNumber}" />
        <button type="submit" class="button">開始繳費</button>
      </form>
    </body>
    </html>
  `;

  res.send(html);
});

// ✅ 模擬付款跳轉至 icashpay
app.get('/go-pay', (req, res) => {
  const query1 = req.query.Q1;
  const bill = mockBills[query1];

  if (!bill || bill.status === 'paid') {
    return res.send('無法付款：帳單無效或已繳費');
  }

  const redirectUrl = `https://biz.icashpay.com.tw/icpplus-cht/ICP.html?H2=9697993302&H3=0109&H5=20250422091743&Q1=1&Q2=${bill.Q2}&Q3=${bill.Q3}&ENC=Y&SN=${bill.SN}&S1=${bill.S1}&S2=${bill.S2}`;

  // 記得要 mark 成已繳
  bill.status = 'paid';

  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`✅ 伺服器已啟動：http://localhost:${port}`);
});
