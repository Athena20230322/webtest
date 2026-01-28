const axios = require('axios');

async function cancelTaichungGoBinding() {
    const subscriptionKey = "69004218a2174000b25bdf286fe5118f";
    const sitBaseUrl = "https://icash-apim.icashsys.com.tw/traffic-sit/v1";

    try {
        // Step: CHK204 - 取消綁定 解綁要拿201回傳的Token去打 204 Ocp-Apim-Subscription-Key 這個是固定給台中GO的金鑰~ 不會變

        console.log("Executing CHK204 - 取消綁定...");
        const unbindingDate = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }).replace(/\//g, '-').replace(' ', ' ');
        const chk204Response = await axios.post(
            `${sitBaseUrl}/ICPAuthCancel`,
            {
                BindingToken: "1501fcb7583f4557ba02e66b3f3c09da", // 測試用 BindingToken，應根據實際情況動態提供
                UnBindingDate: unbindingDate
            },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
        );
        const { RtnCode, RtnMsg } = chk204Response.data;
        console.log(`CHK204 Response - RtnCode: ${RtnCode}, RtnMsg: ${RtnMsg}`);
        if (RtnCode !== 1) throw new Error(`CHK204 failed: ${RtnMsg}`);

        return { RtnCode, RtnMsg };

    } catch (error) {
        console.error("Error during CHK204 execution:", error.message);
        throw error;
    }
}

// Example usage
cancelTaichungGoBinding()
    .then(result => console.log("CHK204 completed:", result))
    .catch(error => console.error("CHK204 failed:", error));