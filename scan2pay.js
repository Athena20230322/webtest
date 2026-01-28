const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables from .env file
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  console.warn('Warning: .env file not found or invalid. Using default configuration.');
  console.error('Dotenv error:', dotenvResult.error.message);
}

// Configure logging
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ${level.toUpperCase()} - ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

// Configuration (loaded from environment variables)
const CONFIG = {
  apiUrl: process.env.API_URL || 'https://api.scan2pay.example.com/v1/payment', // REPLACE with actual URL from Intella
  merchantId: process.env.MCH_ID || 'Account0001', // REPLACE with actual MchId from Intella
  tradeKey: process.env.TRADE_KEY || '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', // REPLACE with actual TradeKey from Intella
  timeout: parseInt(process.env.TIMEOUT) || 10000, // Request timeout in milliseconds
  currency: process.env.CURRENCY || 'TWD', // Default currency
  method: process.env.METHOD || '00000' // Default payment method
};

// Log configuration to verify .env loading
logger.info('Configuration loaded:');
logger.info(`API_URL: ${CONFIG.apiUrl}`);
logger.info(`MCH_ID: ${CONFIG.merchantId}`);
logger.info(`TRADE_KEY: ${CONFIG.tradeKey}`);

function generateStoreOrderNo() {
  // Generate a unique StoreOrderNo (alphanumeric, max 20 characters)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const randomStr = crypto.createHash('md5').update(timestamp).digest('hex').slice(0, 10);
  const orderNo = `ORD${randomStr}`;
  if (!/^[a-zA-Z0-9]{1,20}$/.test(orderNo)) {
    throw new Error('Invalid StoreOrderNo generated');
  }
  return orderNo;
}

function createPaymentRequest() {
  // Create payment request payload for Merchant-Presented QR Code
  try {
    const payload = {
      Method: CONFIG.method,
      ServiceType: 'Scan2Pay', // Required for merchant scan
      MchId: CONFIG.merchantId,
      StoreOrderNo: generateStoreOrderNo(),
      Amount: 100, // Positive integer (e.g., 100 for 1 TWD)
      Currency: CONFIG.currency,
      TradeKey: CONFIG.tradeKey,
      TimeStamp: Math.floor(Date.now() / 1000)
    };
    return payload;
  } catch (error) {
    logger.error(`Error creating payload: ${error.message}`);
    return null;
  }
}

async function sendPaymentRequest(payload) {
  // Send payment request to Scan2Pay API
  try {
    logger.debug(`Sending request to ${CONFIG.apiUrl}: ${JSON.stringify(payload, null, 2)}`);
    const response = await axios.post(CONFIG.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: CONFIG.timeout,
      // Ensure TLS 1.2+ (axios uses Node.js https module, which supports TLS 1.2+ by default)
    });
    logger.info('Request successful');
    return response.data;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      logger.error(`Cannot resolve hostname: ${new URL(CONFIG.apiUrl).hostname}`);
    } else if (error.code === 'ETIMEDOUT') {
      logger.error('Request timed out');
    } else if (error.response) {
      logger.error(`HTTP error: ${error.response.status} - ${error.response.data.message || 'No message'}`);
    } else if (error.request) {
      logger.error(`Connection error: ${error.message}`);
    } else {
      logger.error(`Error: ${error.message}`);
    }
    return null;
  }
}

async function main() {
  logger.info('Testing Scan2Pay Merchant-Presented QR Code Payment...');

  // Check server connectivity (basic DNS resolution)
  try {
    const { hostname } = new URL(CONFIG.apiUrl);
    await new Promise((resolve, reject) => {
      require('dns').lookup(hostname, (err) => {
        if (err) {
          logger.error(`Cannot resolve hostname: ${hostname}`);
          reject(err);
        } else {
          logger.info(`Successfully resolved ${hostname}`);
          resolve();
        }
      });
    });
  } catch (error) {
    logger.error('Aborting: Cannot connect to API server');
    return;
  }

  // Create and send payment request
  const payload = createPaymentRequest();
  if (!payload) {
    logger.error('Failed to create payment request');
    return;
  }

  logger.info('Request Payload:');
  logger.info(JSON.stringify(payload, null, 2));

  const response = await sendPaymentRequest(payload);
  if (response) {
    logger.info('Response:');
    logger.info(JSON.stringify(response, null, 2));
    const status = response.status;
    if (status === 'success') {
      logger.info('Payment processed successfully!');
    } else {
      logger.error(`Payment failed: ${response.message || 'Unknown error'}`);
    }
  } else {
    logger.error('Failed to process payment request');
  }
}

// Run the program
main().catch(error => logger.error(`Main error: ${error.message}`));