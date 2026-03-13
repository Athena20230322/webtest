from selenium import webdriver
from selenium.webdriver.common.by import By
import time

mid = "10523669"
target_url = f"https://icp-admin-preprod.icashpay.com.tw/Admin/CustomerManager/Edit/{mid}?IsSettle=False"

driver = webdriver.Chrome()


def find_and_click_by_logic():
    """
    透過邏輯特徵尋找按鈕，不依賴脆弱的 XPath 序號
    """
    # 搜尋所有連結
    links = driver.find_elements(By.TAG_NAME, "a")
    for link in links:
        try:
            title = link.get_attribute("title")
            href = link.get_attribute("href")

            # 特徵：標題是「解鎖」且網址包含 UnlockSMS 或 MID
            if title == "解鎖" or (href and "UnlockSMS" in href):
                print(f"🎯 成功鎖定按鈕！Href: {href}")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", link)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", link)
                return True
        except:
            continue
    return False


try:
    driver.get(target_url)
    print(f"\n[手動作業] 請登入並確認畫面出現...")
    input(">> 確認看到『解鎖』按鈕後，按 [Enter] 執行: ")

    # 1. 執行第一層點擊
    # 先嘗試在主頁面找，找不到就進入 iframe 找
    if not find_and_click_by_logic():
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        for i in range(len(iframes)):
            driver.switch_to.default_content()
            driver.switch_to.frame(i)
            if find_and_click_by_logic():
                print(f"✅ 在第 {i + 1} 個 iframe 中成功點擊！")
                break
    else:
        print("✅ 在主頁面成功點擊！")

    # 2. 處理彈窗確定
    time.sleep(2)
    print("正在尋找『確定解鎖』確認鈕...")
    # 彈窗確定鈕通常具有 link-submit 這個 class
    confirm_script = """
    var btn = document.querySelector("a.link-submit, a[title='確定解鎖']");
    if (btn) { btn.click(); return true; }
    return false;
    """
    if not driver.execute_script(confirm_script):
        # 如果當前 frame 找不到，回主頁面再找一次
        driver.switch_to.default_content()
        driver.execute_script(confirm_script)

    print("🚀 流程執行完畢！")
    time.sleep(5)

except Exception as e:
    print(f"❌ 錯誤: {e}")
finally:
    driver.quit()