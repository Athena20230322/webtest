const readline = require('readline');
const { getCurrentTime, sendEncryptedRequest, writeKeyValueFile } = require('./lib/icpCommon');

// 啟動 readline 等待使用者輸入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('請輸入付款條碼 (BarCode): ', async (inputBarCode) => {
    // 取得當前時間
    const { tradeNo, tradeDate } = getCurrentTime();

    // 模擬店家數據
    const data = {
        PlatformID: "10525512",
        MerchantID: "10525512",
        MerchantTradeNo: tradeNo, // 動態 MerchantTradeNo
        StoreID: "TM01",
        StoreName: "",
        MerchantTradeDate: tradeDate, // 動態 MerchantTradeDate
        TotalAmount: "10000",
        ItemAmt: "10000",
        UtilityAmt: "0",
        CommAmt: "0",
        ItemNonRedeemAmt: "0",
        UtilityNonRedeemAmt: "0",
        CommNonRedeemAmt: "0",
        NonPointAmt: "0",
        Item: [
            { ItemNo: "001", ItemName: "測試商品1", Quantity: "1" },
            { ItemNo: "002", ItemName: "測試商品2", Quantity: "1" },
        ],
        BarCode: inputBarCode.trim(), // 使用者輸入的條碼
    };

    // AES 密鑰與 IV
    const AES_Key = "ebFzMlZp9PPK4yUDMWrER97JZUv28joQ";
    const AES_IV = "XT14YYkZnL1gb8vj";

    // 客戶端私鑰
    const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
    MIIEpAIBAAKCAQEAkaBN9p/Ivu/FRg4OngM9biqHp1DrM5EaXJk2nBPOGjBNmcqM6N1rfLf4kKkg9t0FNkeFCqMySnWih9x36wDBGmOsVE3S90P35PPu9E4O4EFCZG1AcJGcoR5zUW3ZxRp+NTzVLzQ3IIhzNTMqBz+cOSdUM4TKKAUEU8Oa00yIA4ySUfmzs5bv0KJaxFDKSMLjVMbsfsbcXOgcTuo6aBuGGVF243HnXeNfXPu7yQDVLCzhI2nrKSvham2bAihLN2t//SV6IjfTha76fhLZ6BluavNsrmpec6umHYD7Jsg8IrEDXIvVbO0TG/vE0eDm7zMPPNFJOS2ZPX1x8sjZN24L2wIDAQABAoIBAA9aI/30+FfQtS5eewIDe21qxGRKLpGAIZRTfqNTny25m+Szqsk91oAOcQDnI5eC03LWdVsau0mIPzstbeLzcGgUy+0TS0NQAgk8Ahv1QrI3jwVBU0LKxwVhTWzvNL8HvPhl0l+olIs0d1jLbQnYleKcl87al+lCJiOigmb2MXyWI2/7r0LcFn1pNv0nUaTljarqEp01FDFKbvwh5ZE+NySguR6wYfWdPULxISVbyueRcPCSKvdmLHBCQmpccJa5BiQcFQtGiVu+Y3O9r+HXc+CW/pzOE8S400VcaAbpANWtkt4n5127hBBPk762nFiyPo3ZUrZMtaYVPeHysBJIUkECgYEAt7C8GPtRS6fK99x1UWnafdxrSVadcuN0rmwqdCb9/h4HftPD9lSGgKuN1U+3rW3YJMwzCPOLy5//7VqgI4ZxLhCucQCtnHsH4or5owM8yXtPXN+D2enqEhYdd5T57A/P/eJydLfd1FbYJoh7Z7V/zqonT5hadCMTAD2Xr7t7ICECgYEAyvOt50Ba7w/9Wdnge1hlzN46ArTdJFHRYr+zhV6Bq+RSKsWN+kzKxig+gY9fJ7Fsd8q99ZqzeEyIetTj5oJEp1OAXgsjZ/p4ScgAJLfnb+lYuarJAI/1hue4Y2VN0nA82xkju7kjx7mOCGVlPEJPytoIZxjce/agZRDNovuCHHsCgYBENcyjOi+l+FjWUXb/FF+d/QuZ4B/3WZ8qZeAd4ZzPkDcYUWqjPh/0B8BTRZbfP7rTb0BEQqvWoUNX0B9HEdVVVbxxGd9eDBGRfinU7o7UAoYl5pn/gWz56lxm21sy3WxOypfV37Dv+I+rP2MTz8H17BlM5TYxihS0MirxhpziAQKBgQCkGM+d0Z00+trA0bf+Q4VcVrrVAWRlP3pru9Dtn3J9h8kgKEgaAAlcm6GepEwuDflECrv5YDKIrGkV2BjFgsL8ADok0CC6q/yiu4HSLpiFFknVJdAMElpVz/p486ou4u1xwivwV0wk61V6WHG4fW2C+TQeGC3+VXVvAl0i0PVtDQKBgQCLEQ9lGN9FaO5AFVBfFZMssnsdF55F3udJrz3SNlW3YZvaK0ZSWMtfi7CWSD7EoW7+yEU784l8mm229pquqpA9Qj/JI11eHktgFCcKyQgqiNgT0Dz4OK6ayxkJ+24HmZNLZscv4Y29tbELKt3RJ7OSeOMcnu6zwWZR4HVUGIZhrQ==
    -----END PRIVATE KEY-----`;
    
    try {
        const result = await sendEncryptedRequest({
            payload: data,
            aesKey: AES_Key,
            aesIv: AES_IV,
            privateKey: Client_Private_Key,
            encKeyId: '247476',
            path: '/api/V2/Payment/Pos/DeductICPOF',
        });

        console.log("Encrypted Data (EncData):", result.encData);
        console.log("X-iCP-Signature:", result.signature);

        if (result.dryRun) {
            console.log("DRY_RUN=1 enabled; request was not sent.");
            return;
        }

        console.log('Response:', result.responseData);
        console.log("Decrypted Response:", result.parsedResponse);

        const { TransactionID, MerchantTradeNo } = result.parsedResponse;
        writeKeyValueFile('TransactionDetails.txt', { TransactionID, MerchantTradeNo });
        console.log("Transaction details have been saved to TransactionDetails.txt");
    } catch (error) {
        console.error("Error sending, decrypting, or parsing response:", error);
    } finally {
        rl.close();
    }
});
