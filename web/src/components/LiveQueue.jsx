import React from 'react';

export default function LiveQueue({ queueInfo, slotsData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-[#FFFFFF]">Live Counter Queue & Rush Status</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
          <span className="text-xs text-[#B8C2D9] block">Currently Preparing</span>
          <span className="text-3xl font-extrabold text-[#EED9A0]">{queueInfo.active_orders_count}</span>
          <span className="text-[11px] text-[#B8C2D9] block mt-1">orders in active kitchen queue</span>
        </div>
        <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
          <span className="text-xs text-[#B8C2D9] block">Current Estimated Wait</span>
          <span className="text-3xl font-extrabold text-[#E4A0A0]">~{queueInfo.estimated_wait_minutes} min</span>
          <span className="text-[11px] text-[#B8C2D9] block mt-1">based on 1.2m average prep speed</span>
        </div>
      </div>

      <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
        <h3 className="font-semibold text-sm mb-3 text-[#FFFFFF]">Slot Load Timeline</h3>
        <div className="space-y-2">
          {slotsData.slice(0, 10).map((s) => (
            <div key={s.slot} className="flex items-center justify-between p-2.5 bg-[#1B2A4A] rounded text-xs">
              <span className="font-bold text-[#FFFFFF]">{s.slot} IST</span>
              <span className="text-[#B8C2D9]">{s.count}/{s.max_capacity} pre-orders</span>
              <span className={`font-bold ${s.load_level === 'High' ? 'text-[#EF4444]' : s.load_level === 'Medium' ? 'text-[#EED9A0]' : 'text-[#10B981]'}`}>
                {s.load_level} Load
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

