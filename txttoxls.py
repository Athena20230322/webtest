import pandas as pd
from collections import Counter
from datetime import datetime

# 讀取日誌檔案
with open('click_log.txt', 'r', encoding='utf-8') as file:
    lines = file.readlines()

# 解析日誌數據
buttons = []
for line in lines:
    if line.startswith('Button:'):
        # 提取按鈕名稱和時間
        parts = line.split('|')
        button_name = parts[0].replace('Button:', '').strip()
        buttons.append(button_name)

# 統計每個按鈕的點擊次數
button_counts = Counter(buttons)

# 轉換為 DataFrame
df = pd.DataFrame.from_dict(button_counts, orient='index', columns=['點擊次數'])
df.index.name = '按鈕名稱'

# 將結果保存到 Excel
output_file = 'button_click_stats.xlsx'
df.to_excel(output_file, sheet_name='按鈕點擊統計')

print(f"已生成 Excel 檔案: {output_file}")