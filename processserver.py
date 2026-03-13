from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

app = FastAPI(title="icash Pay 交通扣款 - 專業模擬伺服器")

# 模擬資料庫：紀錄已處理 ID 與 卡片狀態
processed_ids = set()
card_balances = {}  # { "卡號": 餘額 }


# --- 定義符合 Node.js 送出的資料結構 ---
class DiscountInfo(BaseModel):
    typeId: str
    amount: float


class TerminalPosParam(BaseModel):
    recordId: str
    merchantId: str
    consumptionType: str
    transactionType: str
    terminalId: str
    terminalMfId: Optional[str]
    transactionAmount: float
    originalAmount: float
    discountAmount: float
    discountInfo: List[DiscountInfo]
    transactionDatetime: str
    stationName: str
    txnPersonalProfile: str

    # 允許其他擴充欄位（避免 pydantic 報錯）
    class Config:
        extra = "allow"


class TransactionRecord(BaseModel):
    version: str
    orgQrcode: str
    terminalPosParam: TerminalPosParam
    qr80: str
    qr8A: str


class PaymentRequest(BaseModel):
    record: TransactionRecord
    sign: str


# --- API 路由 ---

@app.post("/api/V2/Payment/Traffic/DoPayment")
async def do_payment(payload: PaymentRequest):
    record = payload.record
    params = record.terminalPosParam

    print(f"\n[收到扣款請求] 時間: {datetime.now().strftime('%H:%M:%S')}")
    print(f"   - 交易 ID: {params.recordId}")
    print(f"   - 終端機: {params.terminalId}")
    print(f"   - 卡號 (QR): {record.orgQrcode}")
    print(f"   - 金額: {params.transactionAmount} (原價: {params.originalAmount})")

    # 1. 模擬重複交易檢查
    if params.recordId in processed_ids:
        print(f"   ❌ 拒絕：重複交易 ID")
        return {"rc": 1001, "rm": "交易重複 (Duplicate)", "transactionInfo": None}

    # 2. 模擬邏輯：如果金額小於等於 0 則報錯
    if params.transactionAmount <= 0:
        return {"rc": -17031, "rm": "交易金額錯誤", "transactionInfo": None}

    # 成功處理
    processed_ids.add(params.recordId)

    # 模擬回傳格式（與真實 icash Pay 回傳結構一致）
    return {
        "RequestId": "MOCK-" + params.recordId[-10:],
        "RtnCode": 0,  # 0 代表成功
        "RtnMsg": "Success",
        "transactionInfo": {
            "transactionId": "ICP" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "authCode": "888888",
            "transactionDatetime": params.transactionDatetime
        }
    }


if __name__ == "__main__":
    print("🚀 模擬伺服器已啟動，監聽 Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)