# report_generator.py (統計當前週/月版本)
import re
from collections import defaultdict
from datetime import datetime, timedelta
import os

def parse_log_file(file_path):
    """
    讀取並解析日誌檔案，此函式保持不變。
    """
    records = []
    if not os.path.exists(file_path):
        print(f"錯誤：找不到日誌檔案 '{file_path}'。")
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"讀取檔案時發生錯誤: {e}")
        return None

    content = re.sub(r'\|\s*\n\s*Time:', '| Time:', content)
    lines = content.split('\n')

    for line_num, line in enumerate(lines, 1):
        if not line.strip().startswith('Button:'):
            continue
        parts = [part.strip() for part in line.split('|')]
        button_name, time_str = '', ''
        for part in parts:
            if part.startswith('Button:'):
                button_name = part.replace('Button:', '').strip()
            elif part.startswith('Time:'):
                time_str = part.replace('Time:', '').strip()
        
        if button_name and time_str:
            time_str_en = time_str.replace('上午', 'AM').replace('下午', 'PM')
            try:
                timestamp = datetime.strptime(time_str_en, '%Y/%m/%d %p%I:%M:%S')
                records.append({'button': button_name, 'timestamp': timestamp})
            except ValueError:
                print(f"警告：第 {line_num} 行無法解析時間格式，已略過此紀錄: '{line.strip()}'")
    return records

def aggregate_filtered_stats(filtered_records):
    """
    對已過濾的紀錄列表進行單純的次數統計。
    """
    stats = defaultdict(int)
    for record in filtered_records:
        stats[record['button']] += 1
    return stats

def generate_html_report(stats_30_days, stats_7_days, date_ranges, total_records):
    """
    根據統計結果產生 HTML 報表。
    """
    # Helper function to generate a single table
    def create_table(stats_dict):
        if not stats_dict:
            return "<p>此區間內無點擊紀錄。</p>"
        
        table_html = "<table><thead><tr><th>功能按鈕名稱</th><th>點擊次數</th></tr></thead><tbody>"
        sorted_buttons = sorted(stats_dict.items(), key=lambda item: item[1], reverse=True)
        for button, count in sorted_buttons:
            table_html += f"<tr><td>{button}</td><td>{count}</td></tr>"
        table_html += "</tbody></table>"
        return table_html

    # Main HTML structure
    html = f"""
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <title>近期按鈕點擊統計報表</title>
        <style>
            body {{ font-family: 'Segoe UI', sans-serif; background-color: #f4f4f9; color: #333; margin: 0; padding: 20px; }}
            .container {{ max-width: 900px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            h1, h2 {{ text-align: center; color: #0056b3; }}
            h1 {{ margin-bottom: 5px; }}
            .report-info {{ text-align: center; color: #666; margin-bottom: 30px; }}
            h3 {{ border-bottom: 2px solid #007bff; padding-bottom: 5px; color: #333; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 40px; }}
            th, td {{ padding: 12px 15px; border: 1px solid #ddd; text-align: left; }}
            thead tr {{ background-color: #007bff; color: #ffffff; font-weight: bold; }}
            tbody tr:nth-child(even) {{ background-color: #f8f9fa; }}
            tbody tr:hover {{ background-color: #e9ecef; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 0.9em; color: #888; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>近期按鈕點擊統計報表</h1>
            <p class="report-info">報告產生時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Log 總筆數：{total_records}</p>

            <h3>過去 30 天統計 ({date_ranges['30_day_str']})</h3>
            {create_table(stats_30_days)}

            <h3>過去 7 天統計 ({date_ranges['7_day_str']})</h3>
            {create_table(stats_7_days)}
            
            <div class="footer">
                <p>此報表由 Python 程式自動產生。</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html

def main():
    """
    主執行函式
    """
    log_file = 'click_log.txt'
    output_html_file = 'click_report.html'

    print(f"1. 正在讀取並分析日誌檔案: {log_file}")
    all_records = parse_log_file(log_file)
    
    if all_records:
        print(f"2. Log 總筆數: {len(all_records)}。開始篩選近期資料...")
        
        # 定義日期範圍
        today = datetime.now()
        start_date_30_days = today - timedelta(days=30)
        start_date_7_days = today - timedelta(days=7)

        date_ranges = {
            '30_day_str': f"{start_date_30_days.strftime('%Y/%m/%d')} - {today.strftime('%Y/%m/%d')}",
            '7_day_str': f"{start_date_7_days.strftime('%Y/%m/%d')} - {today.strftime('%Y/%m/%d')}"
        }

        # 過濾出指定期間的紀錄
        records_30_days = [r for r in all_records if start_date_30_days <= r['timestamp'] <= today]
        records_7_days = [r for r in all_records if start_date_7_days <= r['timestamp'] <= today]
        
        print(f"   - 過去 30 天內有 {len(records_30_days)} 筆紀錄。")
        print(f"   - 過去 7 天內有 {len(records_7_days)} 筆紀錄。")

        # 分別統計數據
        stats_30_days = aggregate_filtered_stats(records_30_days)
        stats_7_days = aggregate_filtered_stats(records_7_days)
        
        print("3. 正在產生 HTML 報表...")
        html_content = generate_html_report(stats_30_days, stats_7_days, date_ranges, len(all_records))
        
        try:
            with open(output_html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"4. 報表成功儲存至 -> {os.path.abspath(output_html_file)}")
        except Exception as e:
            print(f"儲存 HTML 檔案時發生錯誤: {e}")
    else:
        print("未找到任何可處理的紀錄。")

if __name__ == "__main__":
    main()