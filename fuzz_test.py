import subprocess
import secrets
import string
import os

# --- 設定區 ---
JS_FILE = "processRidePayment.js"
MERCHANT_ID = "10524012"
# 使用宏碁(A)或寶錄(B)作為設備代碼測試
VENDOR_CODES = ["b", "a"]
# 測試次數
TEST_COUNT = 5
# 測試卡片 Base64
QR_DATA = "UQZUV1RWMDFSSmEBMWIMMTIzNDU2Nzg5QUJaYwEyZA4yMDI2MDMyNTA4NTI1NmUUNzc1OTM2OTc5Njg3RjI0REU4NzBnDjAwMDAwMDAwMDAwMDAwVElBATNCEDE2ODIzMTEwMDAwMDU4NjhDEDIwNjYyNzg5NTYxMDAwMDBEATFGFDAwMDAwMDAwMDAwMDAwNjEyNDQzSAcrMDAwMDA0VWlxBTAxLjAwgBMAAAAAAAAAAAAAAAAAAAAAAAAAhTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKEAAAAAAAAAAAAAAAAAAAAAA"


def generate_hancheng_id(vendor):
    """生成類似 b1TESTdAC269837787E510524012 的格式"""
    random_str = ''.join(secrets.choice(string.digits + string.ascii_uppercase) for _ in range(8))
    # 組合格式: vendor + 1TESTd + random + merchantId
    raw_id = f"{vendor}1TESTd{random_str}{MERCHANT_ID}"
    return raw_id[:20]  # 根據規格截斷至 20 碼


def run_test(record_id, vendor_code):
    # 對應的 terminalId (例如 B01630526)
    tid = f"{vendor_code.upper()}01630526"
    print(f"測試 RecordId: {record_id:<20} | TID: {tid}", end=" | ", flush=True)

    # 執行 JS (需要 JS 能接收 recordId 參數，下方會提供修改)
    cmd = ["node", JS_FILE, QR_DATA, tid, "110", record_id]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        output = result.stdout + result.stderr

        if "✅ 支付成功" in output:
            print("🟢 SUCCESS")
            return True
        else:
            # 抓取錯誤代碼
            err = "Unknown"
            if "代碼:" in output:
                err = output.split("代碼:")[1].split(")")[0].strip()
            print(f"🔴 FAILED (Code: {err})")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False


def main():
    print(f"=== 漢程客運格式 RecordId 壓力測試開始 ===")
    success_count = 0

    for vendor in VENDOR_CODES:
        for _ in range(TEST_COUNT):
            h_id = generate_hancheng_id(vendor)
            if run_test(h_id, vendor):
                success_count += 1

    print(f"\n測試完成！成功: {success_count} / {len(VENDOR_CODES) * TEST_COUNT}")


if __name__ == "__main__":
    main()