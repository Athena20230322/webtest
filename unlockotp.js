const { chromium } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runUnlock(mid) {
    // 啟動瀏覽器，不使用 headless 模式
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log(`\n[系統] 正在開啟 MID: ${mid} 的編輯頁面...`);

        // 使用您提供的 Edit 網址
        await page.goto(`https://icp-admin-preprod.icashpay.com.tw/Admin/CustomerManager/Edit/${mid}?IsSettle=False`);

        console.log('----------------------------------------------------');
        console.log('請在開啟的瀏覽器中完成登入。');
        console.log('當您看到包含「解鎖」按鈕的畫面出現時，');
        console.log('請回到此命令提示字元視窗，按 [Enter] 鍵繼續點擊動作...');
        console.log('----------------------------------------------------');

        // 關鍵暫停：等待使用者在終端機按 Enter
        await new Promise(resolve => rl.once('line', resolve));

        // 您指定的 XPath
        const xpathSelector = 'xpath=/html/body/div[1]/div[1]/div/table/tbody/tr[3]/td[1]/div/div/a';

        console.log('正在嘗試點擊 XPath 元素...');

        // 等待元素出現 (增加到 15 秒)
        await page.waitForSelector(xpathSelector, { state: 'visible', timeout: 15000 });

        // 執行點擊
        await page.click(xpathSelector);

        console.log(`✅ 成功點擊解鎖按鈕 (MID: ${mid})`);

    } catch (error) {
        console.error(`❌ 執行失敗: ${error.message}`);
    } finally {
        console.log('\n處理結束。請確認結果，或直接關閉瀏覽器。');
        console.log('本視窗 10 秒後將詢問下一筆...');

        setTimeout(async () => {
            // 檢查瀏覽器是否還開著才關閉，避免報錯
            if (browser.isConnected()) await browser.close();
            promptInput();
        }, 10000);
    }
}

function promptInput() {
    rl.question('\n請輸入下一個欲解鎖的 MID (輸入 exit 結束): ', (answer) => {
        if (answer.toLowerCase() === 'exit') {
            rl.close();
            process.exit();
        }
        runUnlock(answer.trim());
    });
}

console.log('--- icash Pay 自動解鎖工具 (XPath 版) ---');
promptInput();