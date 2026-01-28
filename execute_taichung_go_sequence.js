const axios = require('axios');

async function executeTaichungGoSequence() {
    const subscriptionKey = "69004218a2174000b25bdf286fe5118f";
    const sitBaseUrl = "https://icash-apim.icashsys.com.tw/traffic-sit/v1";
    const bridgeUrl = "https://icpbridge-test.icashsys.com.tw/ICP";

    try {
        // Step 1: CHK201 - 身份驗證請求
        console.log("Executing CHK201 - 身份驗證...");
        const chk201Response = await axios.post(
            `${sitBaseUrl}/ICPAuthBinding`,
            {
                ID: "L132733252",
                Channel: "icash"
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { Token, RtnCode, RtnMsg } = chk201Response.data;
        console.log(`CHK201 Response - RtnCode: ${RtnCode}, RtnMsg: ${RtnMsg}, Token: ${Token}`);
        if (RtnCode !== 1) throw new Error(`CHK201 failed: ${RtnMsg}`);

        // Step 2: CHK202 - 身份驗證及綁定授權確認
        console.log("Executing CHK202 - 身份驗證及綁定授權確認...");
        const chk202Response = await axios.post(
            `${sitBaseUrl}/ICPAuthBindingConfirm`,
            {
                Token: Token,
                AuthCode: "1234"
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { BindingToken, RtnCode: chk202RtnCode, RtnMsg: chk202RtnMsg } = chk202Response.data;
        console.log(`CHK202 Response - RtnCode: ${chk202RtnCode}, RtnMsg: ${chk202RtnMsg}, BindingToken: ${BindingToken}`);
        if (chk202RtnCode !== 1) throw new Error(`CHK202 failed: ${chk202RtnMsg}`);

        // Step 3: CHK203 - 喚起乘車碼頁面
        console.log("Executing CHK203 - 喚起乘車碼頁面...");
        const dctType = 8; // 台中市民
        const idType = 1;
        const value = BindingToken; // 使用 CHK202 返回的 BindingToken
        const chk203Url = `${bridgeUrl}?Actions=Mainaction&Event=CHK203&DctType=${dctType}&IDType=${idType}&Value=${value}&Valuetype=1`;
        console.log(`CHK203 URL: ${chk203Url}`);
        // 這裡僅生成 URL，實際開啟需依應用程式邏輯處理

        // Step 4: CHK204 - 取消綁定
        console.log("Executing CHK204 - 取消綁定...");
        const unbindingDate = new Date().toISOString().split('T')[0].replace(/-/g, '/') + " " + new Date().toTimeString().split(' ')[0];
        const chk204Response = await axios.post(
            `${sitBaseUrl}/ICPAuthCancel`,
            {
                BindingToken: "1501fcb7583f4557ba02e66b3f3c09da", // 測試用，應動態使用上一步 BindingToken
                UnBindingDate: unbindingDate
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { RtnCode: chk204RtnCode, RtnMsg: chk204RtnMsg } = chk204Response.data;
        console.log(`CHK204 Response - RtnCode: ${chk204RtnCode}, RtnMsg: ${chk204RtnMsg}`);
        if (chk204RtnCode !== 1) throw new Error(`CHK204 failed: ${chk204RtnMsg}`);

        return {
            chk203Url,
            token: Token,
            bindingToken: BindingToken
        };

    } catch (error) {
        console.error("Error during sequence execution:", error.message);
        throw error;
    }
}

// Example usage
executeTaichungGoSequence()
    .then(result => console.log("Sequence completed:", result))
    .catch(error => console.error("Sequence failed:", error));