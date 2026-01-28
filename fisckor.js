const https = require('https');
const fs = require('fs');
const path = require('path');
const tls = require('tls');
const readline = require('readline'); // Added for user input

const config = {
    host: 'openapigw.fisc-test.com.tw',
    port: 443,
    certPath: 'C:/Users/p10381190/Desktop/財金自主平台/cert.pem',
    keyPath: 'C:/Users/p10381190/Desktop/財金自主平台/key.pem',
    caPath: 'C:/Users/p10381190/Desktop/財金自主平台/ca.pem', // Optional: Server's CA cert
    url: 'https://openapigw.fisc-test.com.tw/openAPI/FiscQaAPI/v1.0.0',
    bankid: '392',
    keyid: 'ff1d7a7f-4ac1-47ff-9559-6a0b881964db',
    txnnoFile: 'C:/webtest/txnno.txt', // File to store last TxnNo
    defaultTxnno: '1000277', // Start from 1000253 to align with Postman
    orgApiTxnNo: '1000052',
    orgApiTxnDate: '20241231'
};

// Function to read and increment TxnNo
function getNextTxnNo() {
    let txnno = config.defaultTxnno;
    
    // Read last TxnNo from file if it exists
    if (fs.existsSync(config.txnnoFile)) {
        try {
            txnno = fs.readFileSync(config.txnnoFile, 'utf8').trim();
        } catch (error) {
            console.error('Error reading TxnNo file:', error.message);
        }
    }
    
    // Convert to number and increment
    const nextTxnno = (parseInt(txnno) + 1).toString();
    
    // Save new TxnNo to file
    try {
        fs.writeFileSync(config.txnnoFile, nextTxnno);
    } catch (error) {
        console.error('Error writing TxnNo file:', error.message);
    }
    
    return nextTxnno;
}

// Validate certificate and key files
const requiredFiles = [config.certPath, config.keyPath];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
    }
}

// Read certificate and key files
let certData, keyData, serverCaData;
try {
    certData = fs.readFileSync(config.certPath);
    keyData = fs.readFileSync(config.keyPath);
    if (fs.existsSync(config.caPath)) {
        serverCaData = fs.readFileSync(config.caPath);
    }
} catch (error) {
    console.error('Error reading certificate/key files:', error.message);
    process.exit(1);
}

// Create secure context for client authentication
let secureContext;
try {
    const secureOptions = {
        cert: certData,
        key: keyData
    };
    secureContext = tls.createSecureContext(secureOptions);
} catch (error) {
    console.error('Error creating secure context:', error.message);
    console.error(error.stack);
    process.exit(1);
}

// Initialize readline for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt user for BuyerID
rl.question('請輸入付款條碼(BuyerID): ', (inputBuyerID) => {
    // Get next TxnNo
    const txnno = getNextTxnNo();

    // Define request body with user-provided BuyerID
    const requestBody = {
        BankID: config.bankid,
        TxnNo: txnno,
        TxnAmount: '200000900100',
        CountryCode: '410',
        BuyerID: inputBuyerID.trim() // Use user input
    };

    // Debug: Log the request body
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    // Configure HTTPS request
    const options = {
        hostname: config.host,
        port: config.port,
        path: '/openAPI/FiscQaAPI/v1.0.0/qrPurchase/IntIssMerchScanRequest',
        method: 'POST',
        secureContext: secureContext,
        // Bypass self-signed certificate for testing (REMOVE IN PRODUCTION)
        rejectUnauthorized: false,
        // If you have the server's CA certificate, uncomment and use this instead:
        // ca: serverCaData ? [serverCaData] : undefined,
        headers: {
            'Content-Type': 'application/json',
            'X-KeyId': config.keyid
        }
    };

    // Send HTTPS request
    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('Response:', JSON.stringify(response, null, 2));
            } catch (error) {
                console.error('Error parsing response:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error.message);
        console.error(error.stack);
    });

    req.write(JSON.stringify(requestBody));
    req.end();

    // Close the readline interface
    rl.close();
});