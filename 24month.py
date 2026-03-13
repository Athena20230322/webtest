import time


def activate_dream_bonus():
    print("🚀 正在啟動『年終倍增』系統...")
    time.sleep(1)

    # 核心權限檢查
    user_status = "Hardworking_QA"
    print(f"🔑 偵測到用戶身份：{user_status}")

    # 功能邏輯：直接強制覆蓋
    original_bonus = 2
    dream_bonus = 24

    print(f"⏳ 正在將年終從 {original_bonus} 個月 調整至 {dream_bonus} 個月...")
    time.sleep(2)

    # 模擬 UI 變更後的視覺反應
    success_msg = f"""
    ******************************************
    🎉  操作成功！您的年終獎金已更新為：{dream_bonus} 個月  🎉
    ******************************************
    [ 狀態 ]：已入帳 (模擬環境)
    [ 建議 ]：現在可以開始看機票或換手機了。
    ******************************************
    """
    print(success_msg)


if __name__ == "__main__":
    activate_dream_bonus()