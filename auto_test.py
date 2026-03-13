import subprocess
import os

# --- 設定區 ---
JS_FILE = "processRidePayment.js"
ID_LIST_FILE = "ids.txt"
# 使用你之前的測試卡號 Base64
TEST_QR_DATA = "UQZUV1RWMDFSSmEBMWIMMTIzNDU2Nzg5QUJaYwEyZA4yMDI2MDMyNTA4NTI1NmUUNzc1OTM2OTc5Njg3RjI0REU4NzBnDjAwMDAwMDAwMDAwMDAwVElBATNCEDE2ODIzMTEwMDAwMDU4NjhDEDIwNjYyNzg5NTYxMDAwMDBEATFGFDAwMDAwMDAwMDAwMDAwNjEyNDQzSAcrMDAwMDA0VWlxBTAxLjAwgBMAAAAAAAAAAAAAAAAAAAAAAAAAhTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKEAAAAAAAAAAAAAAAAAAAAAA"


def run_test(terminal_id):
    print(f"Testing ID: {terminal_id:<15}", end=" | ", flush=True)

    # 執行指令: node processRidePayment.js <QR_DATA> <ID>
    cmd = ["node", JS_FILE, TEST_QR_DATA, terminal_id]

    try:
        # 設定 timeout 防止連線超時掛起
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        output = result.stdout + result.stderr

        if "✅ 支付成功" in output:
            print("🟢 SUCCESS")
            return "SUCCESS"
        elif "9999" in output:
            # 提取 RequestId 方便後續追蹤
            req_id = "N/A"
            for line in output.split('\n'):
                if "RequestId" in line:
                    req_id = line.split("'")[1] if "'" in line else line
            print(f"🔴 9999 (Req: {req_id})")
            return f"9999 ({req_id})"
        elif "必輸欄位檢核失敗" in output:
            print("🟡 FIELD MISSING (-17030)")
            return "FIELD MISSING"
        else:
            print("⚪ OTHER ERROR")
            return "OTHER"
    except Exception as e:
        print(f"❌ CRASH: {str(e)}")
        return "CRASH"


def main():
    if not os.path.exists(ID_LIST_FILE):
        print(f"Error: {ID_LIST_FILE} not found!")
        return

    with open(ID_LIST_FILE, "r") as f:
        ids = [line.strip() for line in f if line.strip()]

    print(f"=== icash Pay Terminal ID Auto-Scan Start ({len(ids)} IDs) ===")

    report = []
    for tid in ids:
        status = run_test(tid)
        report.append((tid, status))

    print("\n" + "=" * 50)
    print("📊 測試結果總結")
    print("=" * 50)
    for tid, status in report:
        print(f"[{status:^15}] ID: {tid}")
    print("=" * 50)


if __name__ == "__main__":
    main()