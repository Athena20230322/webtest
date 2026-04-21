import pandas as pd

# 檔案定義
file_jialun = 'ICP_APP_中心端UAT黑箱測試_Testcase_20260413家倫.xlsx'
file_shengqian = 'ICP_APP_中心端UAT黑箱測試_Testcase_20260413盛謙.xlsx'


def get_clean_data(file, sheet, start_row, end_row):
    # 計算要讀取的行數 (例如 9 到 425 是 417 行)
    nrows = end_row - start_row + 1
    # skiprows=8 代表從第 9 列開始讀
    df = pd.read_excel(file, sheet_name=sheet, skiprows=start_row - 1, nrows=nrows, usecols="B:C", header=None)
    df.columns = ['功能項目', '測試手順']
    # 清洗資料：轉字串、去空格、處理空值
    df = df.astype(str).apply(lambda x: x.str.strip())
    df.replace('nan', '', inplace=True)
    return df


try:
    # 1. 讀取資料 (家倫: 9-425, 盛謙: 9-393)
    df_jl = get_clean_data(file_jialun, 'iOS_Testcase_家倫', 9, 425)
    df_sq = get_clean_data(file_shengqian, '安卓_Testcase_盛謙', 9, 393)

    print(f"📊 載入完成：")
    print(f"   - 家倫版 (標準): {len(df_jl)} 筆")
    print(f"   - 盛謙版 (待測): {len(df_sq)} 筆")

    # 2. 建立比對 Key (將功能項目與測試手順合併，方便精確比對)
    df_jl['Full_Case'] = df_jl['功能項目'] + " | " + df_jl['測試手順']
    df_sq['Full_Case'] = df_sq['功能項目'] + " | " + df_sq['測試手順']

    # 3. 找出「盛謙缺少」的項目 (在家倫裡有，但在盛謙裡找不到的)
    missing_in_sq = df_jl[~df_jl['Full_Case'].isin(df_sq['Full_Case'])].copy()

    # 4. 找出「序號相同但內容不同」的項目 (針對前 385 筆進行 1:1 比對)
    mismatch_rows = []
    min_len = min(len(df_jl), len(df_sq))

    for i in range(min_len):
        if df_jl.iloc[i]['Full_Case'] != df_sq.iloc[i]['Full_Case']:
            mismatch_rows.append({
                "Excel列號": i + 9,
                "家倫版_功能項目": df_jl.iloc[i]['功能項目'],
                "盛謙版_功能項目": df_sq.iloc[i]['功能項目'],
                "家倫版_測試手順": df_jl.iloc[i]['測試手順'],
                "盛謙版_測試手順": df_sq.iloc[i]['測試手順']
            })

    # 5. 輸出報告
    with pd.ExcelWriter('UAT_缺失與差異比對報告.xlsx') as writer:
        if not missing_in_sq.empty:
            # 移除輔助用的 Full_Case 欄位再存檔
            missing_export = missing_in_sq.drop(columns=['Full_Case'])
            missing_export.to_excel(writer, sheet_name='盛謙缺少的項目', index=False)

        if mismatch_rows:
            pd.DataFrame(mismatch_rows).to_excel(writer, sheet_name='同列號內容差異', index=False)

    print(f"\n✅ 比對成功！")
    print(f"📍 盛謙版共缺少：{len(missing_in_sq)} 個功能項目/手順組合")
    print(f"📍 前 {min_len} 筆中，有 {len(mismatch_rows)} 筆內容不一致")
    print(f"📝 報告已儲存：C:\\webtest\\UAT_缺失與差異比對報告.xlsx")

except Exception as e:
    print(f"💥 發生錯誤：{e}")