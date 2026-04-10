const https = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const readline = require('readline');

// 建立輸入介面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 1. 先詢問使用者要輸入的單號
rl.question('請輸入 MerchantTradeNo: ', (inputTradeNo) => {
    if (!inputTradeNo) {
        console.error('未輸入單號，程式結束。');
        rl.close();
        process.exit(1);
    }
    rl.close();
    runTransaction(inputTradeNo);
});

function runTransaction(MerchantTradeNo) {
    const data = {
        PlatformID: "10500855",
        MerchantID: "10500855",
        MerchantTradeNo: MerchantTradeNo,
    };

    console.log(`開始處理單號: ${MerchantTradeNo}`);

    const AES_Key = "1pKBKW0V196IUXLv5R0edxvhwMTycx4j";
    const AES_IV = "cXeUoyqAkgq56aEq";

    // 重要：私鑰必須靠左，不能有縮排空白
// 客戶端私鑰
const Client_Private_Key = `-----BEGIN PRIVATE KEY-----
MIIEogIBAAKCAQEAjNkI/swQfv4EL2sIWNAsfO3G4N8XZqYjv4XYy3VefvudXRLfSA4dpnmnG4bNssP3PnZbLbdAX0TuuclEIu/Pc4niq7qA+SvYd6jYZxsvbG6ygoEqjzbeyIhlfKXgaVdmryX2y2+06LCzyQMkcH6J3vqELZwOC73CbfvK9FHOJHLxTrNh86qtmF4eUw9uGWsi366j8ev9dG8Xmp010lFIMmlRRGuPuuIkr0k0qBtD9nbRKQj72pOLnfUPIauk/pK/PcRQI6oL3en8YHF/RVWjhFhacc3KnUxFcAfUK4aoEBoFmVeWdTjTQYg4ZYxkKi/nsRnuSD/tayuF9cvF3bM0BQIDAQABAoIBAAD3iu/VyjoFVOy0sAXHKV6qG4MW7+m2v1RmWUYnxKYnZJIRNx/NlY01mrzA+5nzVlUAPmywQ5bCZY1EBX3YXa2Ui6VoOFv01/Hy6FPLQA22aGN3wICdy1fk4ALD/txw06XlOohdhB+ZS4JSe9wVN8TemnhL9roWC5WDwzowZyID9pNR9j4eobOUKI1K+2D4grUHPvQ8/bas4vVB48/it2NiX6MjAiJyXrhTWjpeXXRNAZxGma2tajuEXl3PUNKnBvkurO76xI6DOJ4RY8uRyLLyi5XZxP7B+ztnOMX3+BJ3ENmZQKXbHpCRWgc2ERs+dcJlqJ+j27+YYisCbMlVEskCgYEAujMfbkeyvNM7Fs2QG+5RXkAgLnJAFKwSs4bwyNx513cse/hOpLaMM0QTAdQW7ayDWtfl5S+WLKD5a35NbeH+wJYjaOo8ugk+gITAMtU2bu1eLKp2i90Mnl07ElibXa+jNhxQjMZCAuEKAnY6c1dhAfJZl41FK35iIlxQhbQDrR0CgYEAwaWplsDLcUBs70pHX4pTHtKO5U+zsgpepIWbV70R9CIcqTIkSibfW+z5cWFUFNcHDUIU4JYrQ3u6szjkU8+vA54XUD3GFcK+hbCGHxXbAifPf/152/rAA5j5lHF5OgR4Y86KHGktYJVM0sfxLS2FnTeqlu6jHwfNd8FwFzfmNgkCgYA2+d0v3G+DnQJ3Sx5fgM/5egmGbSlKcTvcUd1KEP7QhVlXCQt/Sn6+rDzIb2yNpD/sVI6GSrSWXLkH6fTGmtFy32F5Gp/vdcdEfu2YlKdLvT3vBi2WQh/1qiVE13CYCsGvulB2IBthajxgWbQMViJIRtv5CTcBDoG/D26e63WiaQKBgHoWnzhrrxhk/QlU9HDY/hTVvb/3oxyiCw+BKPKFQtd/1kAaW+TgYzxKyO3h5igJdem2+wCpzPcMACbUvKfWrcoDF0HA4K2BjasuIzFgDydpwBo6zmSR0BO0k84ySLL6dIjAhDTrXu+g0cGmy3inVbFMkmH8bJ24xqM1Mx2AYcU5AoGARHAwz2sHPXBt3YnQGUAhelVVfUikDyKljHDB8gSU9k0edL5MNe6p28bpLFhcV7S8I3wUPNh97xET13lMKxxPGdVD1jwmVTSnecfZDXYdNeDYCSnq93Ey0WbeOpWh189U3DcYce3vBXVI4ya5kBRHQvKPWZLWAnUxyPN3y4YwenY=
-----END PRIVATE KEY-----`;

    function encryptAES_CBC_256(data, key, iv) {
        const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }

    function decryptAES_CBC_256(encryptedData, key, iv) {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    function signData(data, privateKey) {
        const rsa = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha256.create();
        md.update(data, 'utf8');
        return rsa.sign(md);
    }

    const encdata = encryptAES_CBC_256(JSON.stringify(data), AES_Key, AES_IV);
    const signature = signData(encdata, Client_Private_Key);
    const X_iCP_Signature = forge.util.encode64(signature);

    const options = {
        hostname: 'icp-payment-preprod.icashpay.com.tw',
        path: '/api/V2/Payment/Cashier/QueryTradeICPO',
        method: 'POST',
        headers: {
            'X-iCP-EncKeyID': '217216',
            'X-iCP-Signature': X_iCP_Signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            try {
                const responseJson = JSON.parse(responseData);
                const decryptedResponseData = decryptAES_CBC_256(responseJson.EncData, AES_Key, AES_IV);
                const parsedResponse = JSON.parse(decryptedResponseData);

                const { TransactionID, MerchantTradeNo: respTradeNo } = parsedResponse;

                // 儲存格式修改
                const output = `OMerchantTradeNo: ${respTradeNo}\nTransactionID: ${TransactionID}\nMerchantTradeNo: ${respTradeNo}`;
                fs.writeFileSync('TransactionDetails.txt', output);

                console.log("處理完成，結果已存入 TransactionDetails.txt");
                console.log(output);
            } catch (err) {
                console.error("處理回傳時發生錯誤:", err.message);
            }
        });
    });

    req.on('error', (e) => { console.error('請求錯誤:', e); });
    req.write(`EncData=${encodeURIComponent(encdata)}`);
    req.end();
}