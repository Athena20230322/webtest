const axios = require('axios');
const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid'); // 如果沒安裝可以用 Math.random 代替

// --- 設定區 ---
const CONFIG = {
    API_KEY: '你的_API_KEY',
    API_SECRET: '你的_API_SECRET',
    MERCHANT_ID: '你的_MERCHANT_ID',
    BASE_URL: 'https://stg-api.paypay.ne.jp', // 測試環境
};

/**
 * PayPay 簽名與請求工具
 */
class PayPayClient {
    constructor(config) {
        this.config = config;
    }

    // 核心：計算 PayPay 專用的 HMAC 簽名
    generateAuthHeader(method, url, body = null) {
        const nonce = Math.random().toString(36).substring(2, 13);
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const contentType = "application/json;charset=UTF-8";

        let bodyHash = 'empty';
        if (body && Object.keys(body).length > 0) {
            const bodyStr = JSON.stringify(body);
            bodyHash = crypto.MD5(contentType + bodyStr).toString(crypto.enc.Base64);
        }

        // 簽名字串組合：路徑\n方法\n隨機值\n時間戳\n內容類型\nBodyHash
        const signatureRaw = `${url}\n${method}\n${nonce}\n${timestamp}\n${contentType}\n${bodyHash}`;
        const signature = crypto.HmacSHA256(signatureRaw, this.config.API_SECRET).toString(crypto.enc.Base64);

        return `hmac username="${this.config.API_KEY}", algorithm="hmac-sha256", nonce="${nonce}", timestamp="${timestamp}", signature="${signature}"`;
    }

    async request(method, path, data = null) {
        const url = `${this.config.BASE_URL}${path}`;
        const authHeader = this.generateAuthHeader(method.toUpperCase(), path, data);

        try {
            const response = await axios({
                method: method,
                url: url,
                headers: {
                    'Authorization': authHeader,
                    'X-ASSUME-MERCHANT': this.config.MERCHANT_ID,
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data
            });
            return response.data;
        } catch (error) {
            console.error(`API Error [${path}]:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

// --- 執行測試流程 ---
async function runContinuousPaymentTest() {
    const paypay = new PayPayClient(CONFIG);

    try {
        console.log("--- 步驟 1: 建立使用者授權請求 (User Authorization) ---");
        const authRequest = {
            scopes: ["continuous_payments"],
            nonce: "nonce_" + Date.now(),
            redirectUrl: "https://your-website.com/callback", // 授權完跳轉回來的網址
            redirectType: "WEB_LINK"
        };

        const authResult = await paypay.request('POST', '/v2/user/authorizations', authRequest);
        console.log("請在瀏覽器開啟此 URL 進行授權測試:");
        console.log(authResult.data.url);

        /* 注意：在實際應用中，使用者在上述 URL 授權後，
           PayPay 會跳轉回你的 redirectUrl，並帶上 userAuthorizationId。
           以下代碼假設你已經拿到該 ID。
        */

        const testAuthId = "從瀏覽器回傳取得的_userAuthorizationId";

        if (testAuthId !== "從瀏覽器回傳取得的_userAuthorizationId") {
            console.log("\n--- 步驟 2: 執行自動扣款 (Subscription Payment) ---");
            const paymentReq = {
                merchantPaymentId: "pay_" + Date.now(),
                userAuthorizationId: testAuthId,
                amount: {
                    amount: 500,
                    currency: "JPY"
                },
                requestedAt: Math.floor(Date.now() / 1000),
                orderDescription: "Node.js 測試自動扣款"
            };

            const paymentResult = await paypay.request('POST', '/v2/subscription/payments', paymentReq);
            console.log("付款結果:", paymentResult);
        }

    } catch (err) {
        // 錯誤處理
    }
}

runContinuousPaymentTest();