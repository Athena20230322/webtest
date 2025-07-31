const axios = require('axios');

async function executeICPSequence(subscriptionKey, id, channel) {
    const uatBaseUrl = "https://icash-apim.icashsys.com.tw/traffic-uat/v1";

    try {
        // Step 1: CHK201 - 身份驗證
        console.log("Executing CHK201 - 身份驗證...");
        const chk201Response = await axios.post(
            `${uatBaseUrl}/ICPAuthBinding`,
            {
                ID: id,
                Channel: channel
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { Token, RtnCode, RtnMsg } = chk201Response.data;
        console.log(`CHK201 Response - RtnCode: ${RtnCode}, RtnMsg: ${RtnMsg}, Token: ${Token}`);
        if (RtnCode !== 0) throw new Error(`CHK201 failed: ${RtnMsg}`);

        // Step 2: CHK202 - 身份驗證確認及預定授權
        console.log("Executing CHK202 - 身份驗證確認及預定授權...");
        const chk202Response = await axios.post(
            `${uatBaseUrl}/ICPAuthBindingConfirm`,
            {
                Token: Token,
                AuthCode: "123456" // 假設驗證碼，需根據實際情況提供
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { BindingToken, RtnCode: chk202RtnCode, RtnMsg: chk202RtnMsg } = chk202Response.data;
        console.log(`CHK202 Response - RtnCode: ${chk202RtnCode}, RtnMsg: ${chk202RtnMsg}, BindingToken: ${BindingToken}`);
        if (chk202RtnCode !== 0) throw new Error(`CHK202 failed: ${chk202RtnMsg}`);

        // Step 3: CHK203 - 產生乘車碼介面
        console.log("Executing CHK203 - 產生乘車碼介面...");
        const dctType = 8; // 台中市民
        const idType = 1;
        const value = "2c97254522e741b88d0ca430101fc9a7"; // 假設值
        const chk203Url = `https://icpbridge.icashsys.com.tw/ICP?Actions=Mainaction&Event=CHK203&DctType=${dctType}&IDType=${idType}&Value=${value}&Valuetype=1`;
        console.log(`CHK203 URL: ${chk203Url}`);
        // 這裡僅生成 URL，實際開啟需依應用程式邏輯處理

        // Step 4: CHK204 - 取消預定 (可選，根據需求執行)
        console.log("Executing CHK204 - 取消預定 (optional)...");
        // CHK204 細節未完全提供，需根據實際需求實現
        // 這裡僅列印提示
        console.log("CHK204 implementation requires additional details.");

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
const subscriptionKey = "123456"; // 替換為您的 API Key
const id = "L264677310"; // 替換為實際身份證字號或其他 ID
const channel = "icash"; // 替換為實際來源通道

executeICPSequence(subscriptionKey, id, channel)
    .then(result => console.log("Sequence completed:", result))
    .catch(error => console.error("Sequence failed:", error));