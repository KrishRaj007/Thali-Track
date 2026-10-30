import React from 'react';

export default function ManagerForecast({
  forecastData,
  isLoading,
  safetyBufferPct,
  setSafetyBufferPct
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-[#FFFFFF]">Next-Day Dish Demand Forecast</h2>
          <p className="text-xs text-[#B8C2D9]">
            Regression with cyclical weekday features vs 4-point same-weekday moving average
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#24345A] px-2.5 py-1 rounded text-xs">
          <span className="text-[#B8C2D9]">Safety Buffer:</span>
          <span className="font-bold text-[#E4A0A0]">+{safetyBufferPct}%</span>
          <button
            onClick={() => setSafetyBufferPct((prev) => Math.max(0, prev - 5))}
            className="px-1.5 bg-[#1B2A4A] rounded text-[#B8C2D9]"
          >
            -
          </button>
          <button
            onClick={() => setSafetyBufferPct((prev) => Math.min(25, prev + 5))}
            className="px-1.5 bg-[#1B2A4A] rounded text-[#B8C2D9]"
          >
            +
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-[#B8C2D9] bg-[#24345A] rounded">
          Computing machine-learning forecast models and holdout MAE...
        </div>
      ) : forecastData ? (
        <div className="space-y-4">
          {/* Visual Comparative Bar Chart */}
          <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#FFFFFF]">Dish Quantity Forecast Comparison</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-[#EED9A0]">
                  <span className="w-2.5 h-2.5 bg-[#EED9A0] rounded-sm" /> Forecast Qty
                </span>
                <span className="flex items-center gap-1 text-[#E4A0A0]">
                  <span className="w-2.5 h-2.5 bg-[#E4A0A0] rounded-sm" /> Recommended Batch (+{safetyBufferPct}%)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {forecastData.dishes?.map((d) => (
                <div key={d.dish_id} className="text-xs">
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-[#FFFFFF] font-medium">{d.dish_name}</span>
                    <span className="text-[#B8C2D9]">
                      Forecast: <strong className="text-[#EED9A0]">{d.forecast_qty}</strong> | Prep:{' '}
                      <strong className="text-[#E4A0A0]">{d.recommended_qty}</strong>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#1B2A4A] rounded overflow-hidden flex">
                    <div
                      className="h-full bg-[#EED9A0]"
                      style={{ width: `${Math.min(100, (d.forecast_qty / 150) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-[#E4A0A0]"
                      style={{
                        width: `${Math.min(
                          100,
                          ((d.recommended_qty - d.forecast_qty) / 150) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast Table */}
          <div className="bg-[#24345A] rounded overflow-x-auto border border-[#24345A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B2A4A] text-[#B8C2D9]">
                <tr>
                  <th className="p-2.5">Dish</th>
                  <th className="p-2.5">Forecast</th>
                  <th className="p-2.5">Recommended</th>
                  <th className="p-2.5">Confidence</th>
                  <th className="p-2.5">Selected Algorithm</th>
                  <th className="p-2.5">Holdout MAE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A4A]">
                {forecastData.dishes?.map((d) => (
                  <tr key={d.dish_id} className="hover:bg-[#1B2A4A]/40">
                    <td className="p-2.5 font-medium text-[#FFFFFF]">{d.dish_name}</td>
                    <td className="p-2.5 text-[#EED9A0] font-bold">{d.forecast_qty}</td>
                    <td className="p-2.5 text-[#E4A0A0] font-bold">{d.recommended_qty}</td>
                    <td className="p-2.5 text-[#B8C2D9]">
                      {d.confidence_range?.[0]} - {d.confidence_range?.[1]}
                    </td>
                    <td className="p-2.5 text-[#B8C2D9]">
                      <span className="bg-[#1B2A4A] px-1.5 py-0.5 rounded text-[10px]">
                        {d.selected_model.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[#FFFFFF]">{d.mae}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

