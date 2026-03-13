import subprocess

# 定義要測試的交通業相關代碼
types_to_scan = ["1", "11", "110", "111", "120", "121", "210"]
JS_FILE = "processRidePayment.js"
TERMINAL_ID = "A01630528"  # 宏碁測試 ID
# 你的卡片 Base64
QR_DATA = "UQZUV1RWMDFSSmEBMWIMMTIzNDU2Nzg5QUJaYwEyZA4yMDI2MDMyNTA4NTI1NmUUNzc1OTM2OTc5Njg3RjI0REU4NzBnDjAwMDAwMDAwMDAwMDAwVElBATNCEDE2ODIzMTEwMDAwMDU4NjhDEDIwNjYyNzg5NTYxMDAwMDBEATFGFDAwMDAwMDAwMDAwMDAwNjEyNDQzSAcrMDAwMDA0VWlxBTAxLjAwgBMAAAAAAAAAAAAAAAAAAAAAAAAAhTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKEAAAAAAAAAAAAAAAAAAAAAA"

print(f"=== 開始掃描交易代碼 (Target ID: {TERMINAL_ID}) ===")

for t_type in types_to_scan:
    # 執行 node 指令
    cmd = ["node", JS_FILE, QR_DATA, TERMINAL_ID, t_type]
    result = subprocess.run(cmd, capture_output=True, text=True)

    # 輸出結果
    print(result.stdout.strip())

print("=== 掃描結束 ===")