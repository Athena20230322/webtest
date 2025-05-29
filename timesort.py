import pandas as pd
from collections import Counter
from datetime import datetime

# 讀取日誌檔案
try:
    with open('click_log.txt', 'r', encoding='utf-8') as file:
        lines = file.readlines()
except FileNotFoundError:
    print("錯誤：找不到 click_log.txt 檔案，請確認檔案是否存在於當前目錄！")
    exit(1)

# 解析按鈕和時間
buttons = []
button_by_date = {}
for line in lines:
    if line.startswith('Button:'):
        parts = line.split('|')
        if len(parts) < 2:
            print(f"警告：格式不正確的行，已跳過：{line.strip()}")
            continue

        button_name = parts[0].replace('Button:', '').strip()

        # 尋找包含 Time: 的部分
        time_str = None
        for part in parts:
            if 'Time:' in part:
                time_str = part.split('Time:')[1].strip()
                break

        if not time_str:
            print(f"警告：找不到時間資訊，已跳過：{line.strip()}")
            continue

        # 將中文 AM/PM 轉換為英文
        time_str = time_str.replace('上午', 'AM').replace('下午', 'PM')

        try:
            # 解析時間
            date = datetime.strptime(time_str, '%Y/%m/%d %p%I:%M:%S').date()
            buttons.append(button_name)
            if date not in button_by_date:
                button_by_date[date] = Counter()
            button_by_date[date][button_name] += 1
        except ValueError as e:
            print(f"時間解析錯誤：{time_str} - {e}，已跳過")
            continue

# 檢查是否有有效數據
if not buttons:
    print("錯誤：未解析到任何有效按鈕數據！")
    exit(1)

# 按按鈕名稱統計
button_counts = Counter(buttons)
df_buttons = pd.DataFrame.from_dict(button_counts, orient='index', columns=['點擊次數'])
df_buttons.index.name = '按鈕名稱'

# 按日期統計
df_by_date = pd.DataFrame(button_by_date).fillna(0).T
df_by_date.index.name = '日期'

# 儲存到 Excel
output_file = 'button_click_stats.xlsx'
try:
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        df_buttons.to_excel(writer, sheet_name='按鈕點擊統計')
        df_by_date.to_excel(writer, sheet_name='按日期統計')
    print(f"已生成 Excel 檔案: {output_file}")
except PermissionError:
    print(f"錯誤：無法寫入 {output_file}，請關閉檔案或確認寫入權限！")
    exit(1)
except Exception as e:
    print(f"寫入 Excel 時發生錯誤：{e}")
    exit(1)

# 提示如何製作圖表
print("\nExcel 檔案已生成，請按照以下步驟製作圖表：")
print("1. 開啟 button_click_stats.xlsx")
print("2. 在『按鈕點擊統計』工作表中，選取『按鈕名稱』和『點擊次數』")
print("3. 點擊 Excel 的『插入』>『圖表』> 選擇『長條圖』或『圓環圖』")
print("4. 在『按日期統計』工作表中，選取日期和按鈕資料，製作折線圖以顯示趨勢")