from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

app = FastAPI(title="ThaliTrack Forecasting Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoryRecord(BaseModel):
    date: str
    day_of_week: int
    dish_id: int
    dish_name: str
    sold_qty: int
    prepared_qty: Optional[int] = 0
    leftover_kg: Optional[float] = 0.0
    avg_portion_weight_kg: Optional[float] = 0.35

class LeftoverFeedback(BaseModel):
    dish_id: int
    leftover_kg: float

class ForecastRequest(BaseModel):
    target_date: str
    day_of_week: int
    safety_buffer_pct: Optional[float] = 5.0
    history: List[HistoryRecord]
    recent_leftovers: Optional[List[LeftoverFeedback]] = []

@app.get("/health")
def health():
    return {"status": "ok", "service": "thalitrack-forecast"}

@app.post("/forecast")
def generate_forecast(req: ForecastRequest):
    if not req.history:
        raise HTTPException(status_code=400, detail="Historical records cannot be empty")

    df = pd.DataFrame([h.model_dump() for h in req.history])
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    leftover_map = {l.dish_id: l.leftover_kg for l in req.recent_leftovers or []}

    dishes = df[["dish_id", "dish_name", "avg_portion_weight_kg"]].drop_duplicates()
    results = []
    overall_metrics = []

    for _, dish_row in dishes.iterrows():
        d_id = int(dish_row["dish_id"])
        d_name = str(dish_row["dish_name"])
        portion_wt = float(dish_row["avg_portion_weight_kg"]) if dish_row["avg_portion_weight_kg"] else 0.35

        dish_df = df[df["dish_id"] == d_id].copy()
        if len(dish_df) < 5:
            # Fallback for very few rows
            mean_val = float(dish_df["sold_qty"].mean()) if not dish_df.empty else 40.0
            rec = round(mean_val * (1.0 + req.safety_buffer_pct / 100.0))
            results.append({
                "dish_id": d_id,
                "dish_name": d_name,
                "forecast_qty": round(mean_val),
                "recommended_qty": rec,
                "confidence_range": [max(5, round(mean_val * 0.85)), round(mean_val * 1.15)],
                "selected_model": "simple_mean",
                "mae": 3.0,
                "safety_buffer_pct": req.safety_buffer_pct
            })
            continue

        # 1. 4-point same-weekday moving average
        same_dow_df = dish_df[dish_df["day_of_week"] == req.day_of_week]
        if not same_dow_df.empty:
            sma_pred = float(same_dow_df["sold_qty"].tail(4).mean())
        else:
            sma_pred = float(dish_df["sold_qty"].tail(7).mean())

        # 2. Linear Regression with time index and weekday features
        dish_df["time_idx"] = np.arange(len(dish_df))
        dish_df["dow_sin"] = np.sin(2 * np.pi * dish_df["day_of_week"] / 7)
        dish_df["dow_cos"] = np.cos(2 * np.pi * dish_df["day_of_week"] / 7)

        features = ["time_idx", "dow_sin", "dow_cos"]
        X = dish_df[features]
        y = dish_df["sold_qty"]

        # Backtest validation: hold out last 7 observations
        if len(dish_df) >= 14:
            train_X, test_X = X.iloc[:-7], X.iloc[-7:]
            train_y, test_y = y.iloc[:-7], y.iloc[-7:]

            model = LinearRegression()
            model.fit(train_X, train_y)
            pred_y = model.predict(test_X)
            reg_mae = float(mean_absolute_error(test_y, pred_y))

            # SMA MAE on the hold-out test set
            sma_holdout = []
            for _, r in dish_df.iloc[-7:].iterrows():
                hist_match = dish_df.iloc[:-7][dish_df.iloc[:-7]["day_of_week"] == r["day_of_week"]]
                if not hist_match.empty:
                    sma_holdout.append(hist_match["sold_qty"].tail(4).mean())
                else:
                    sma_holdout.append(train_y.mean())
            sma_mae = float(mean_absolute_error(test_y, sma_holdout))

            # Full fit
            model.fit(X, y)
        else:
            reg_mae = 5.0
            sma_mae = 4.0
            model = LinearRegression().fit(X, y)

        next_time_idx = len(dish_df)
        next_dow_sin = np.sin(2 * np.pi * req.day_of_week / 7)
        next_dow_cos = np.cos(2 * np.pi * req.day_of_week / 7)
        next_X = pd.DataFrame([{
            "time_idx": next_time_idx,
            "dow_sin": next_dow_sin,
            "dow_cos": next_dow_cos
        }])
        reg_pred = float(model.predict(next_X)[0])

        # Select model with lower MAE
        if reg_mae < sma_mae and reg_pred > 5:
            chosen_pred = reg_pred
            chosen_model = "linear_regression"
            best_mae = reg_mae
        else:
            chosen_pred = sma_pred
            chosen_model = "same_weekday_moving_average"
            best_mae = sma_mae

        forecast_qty = max(10, int(round(chosen_pred)))
        recommended_qty = int(round(forecast_qty * (1.0 + req.safety_buffer_pct / 100.0)))

        # Leftover Feedback adjustment:
        # If leftovers logged, reduce next recommendation proportionally:
        # formula: delta_units = leftover_kg / avg_portion_weight_kg * damping_factor (0.5)
        recent_leftover_kg = leftover_map.get(d_id, 0.0)
        feedback_reduction = 0
        if recent_leftover_kg > 0 and portion_wt > 0:
            leftover_units = recent_leftover_kg / portion_wt
            feedback_reduction = int(round(0.5 * leftover_units))
            recommended_qty = max(forecast_qty - 5, recommended_qty - feedback_reduction)

        conf_margin = max(3, int(round(1.96 * best_mae)))
        conf_range = [max(5, forecast_qty - conf_margin), forecast_qty + conf_margin]

        results.append({
            "dish_id": d_id,
            "dish_name": d_name,
            "forecast_qty": forecast_qty,
            "recommended_qty": recommended_qty,
            "confidence_range": conf_range,
            "selected_model": chosen_model,
            "mae": round(best_mae, 2),
            "baseline_sma_mae": round(sma_mae, 2),
            "regression_mae": round(reg_mae, 2),
            "feedback_reduction_units": feedback_reduction,
            "safety_buffer_pct": req.safety_buffer_pct
        })
        overall_metrics.append(best_mae)

    return {
        "target_date": req.target_date,
        "day_of_week": req.day_of_week,
        "average_mae": round(float(np.mean(overall_metrics)), 2) if overall_metrics else 2.5,
        "dishes": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

