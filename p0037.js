const { spawn } = require("child_process");

const exePath = "C:\\IcashPost\\ICPLogin\\M0005_3_P0037\\ConsoleApp1\\bin\\Debug\\ConsoleApp1.exe";

const process = spawn(exePath, [], { shell: true });

process.stdout.on("data", (data) => {
    console.log(`輸出: ${data.toString()}`);
});

process.stderr.on("data", (data) => {
    console.error(`錯誤輸出: ${data.toString()}`);
});

process.on("error", (err) => {
    console.error(`無法啟動程序: ${err.message}`);
});

process.on("close", (code) => {
    console.log(`程序結束，退出碼：${code}`);
});
