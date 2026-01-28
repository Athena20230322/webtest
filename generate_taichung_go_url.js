function generateTaichungGoUrl(dctType, idType, value) {
    const baseUrl = "https://icpbridge.icashsys.com.tw/ICP";
    const params = {
        Actions: "Mainaction",
        Event: "CHK203",
        DctType: dctType,
        IDType: idType,
        Value: value,
        Valuetype: 1
    };
    const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    return `${baseUrl}?${queryString}`;
}

// Example usage
const dctType = 8; // 台中市民
const idType = 1;
const value = "2c97254522e741b88d0ca430101fc9a7"; // 假設值，根據需求動態生成

const taichungGoUrl = generateTaichungGoUrl(dctType, idType, value);
console.log("Generated Taichung Go URL:", taichungGoUrl);