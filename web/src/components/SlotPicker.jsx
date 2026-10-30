import React from 'react';
import { Info } from 'lucide-react';

export default function SlotPicker({
  slotsData,
  selectedSlot,
  setSelectedSlot,
  quieterTip,
  onBackToMenu,
  onProceedToPayment
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#FFFFFF]">Select 10-Minute Pickup Slot</h2>
          <p className="text-xs text-[#B8C2D9]">Operating hours: 08:00 AM to 05:00 PM IST</p>
        </div>
        <button
          onClick={onBackToMenu}
          className="text-xs text-[#E4A0A0] hover:underline"
        >
          Back to Dishes
        </button>
      </div>

      {quieterTip && (
        <div className="bg-[#24345A] border border-[#EED9A0] p-3 rounded text-xs text-[#EED9A0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{quieterTip.message}</span>
          </div>
          <button
            onClick={() => setSelectedSlot(quieterTip.recommended_slot)}
            className="bg-[#1B2A4A] text-[#EED9A0] font-bold px-3 py-1 rounded border border-[#EED9A0]/40 hover:bg-[#EED9A0] hover:text-[#1B2A4A] transition"
          >
            Choose {quieterTip.recommended_slot}
          </button>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {slotsData.map((s) => {
          const isSelected = selectedSlot === s.slot;
          const isRush = s.is_rush;
          const isFull = s.is_full;
          const capacityPct = Math.min(100, (s.count / s.max_capacity) * 100);

          return (
            <button
              key={s.slot}
              disabled={isFull}
              onClick={() => setSelectedSlot(s.slot)}
              className={`p-3 rounded text-left border transition relative flex flex-col justify-between ${
                isFull
                  ? 'bg-[#1B2A4A]/50 border-[#24345A] opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#24345A] border-2 border-[#E4A0A0]'
                  : 'bg-[#24345A] border-[#24345A] hover:border-[#B8C2D9]/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-[#FFFFFF]">{s.slot}</span>
                  {isRush && (
                    <span className="text-[9px] bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] px-1 py-0.2 rounded font-bold uppercase">
                      Rush Peak
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[#B8C2D9]">{s.count}/{s.max_capacity} orders</span>
                  <span
                    className={`font-semibold ${
                      s.load_level === 'High' ? 'text-[#EF4444]' : s.load_level === 'Medium' ? 'text-[#EED9A0]' : 'text-[#10B981]'
                    }`}
                  >
                    {s.load_level}
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#1B2A4A] rounded overflow-hidden mt-2.5">
                <div
                  className={`h-full ${
                    s.load_level === 'High' ? 'bg-[#EF4444]' : s.load_level === 'Medium' ? 'bg-[#EED9A0]' : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#24345A] p-4 rounded flex items-center justify-between border border-[#24345A]">
        <div>
          <span className="text-[11px] text-[#B8C2D9] block">Chosen Pickup Window</span>
          <span className="text-base font-bold text-[#EED9A0]">
            {selectedSlot ? `${selectedSlot} IST (10-min window)` : 'Select a slot above'}
          </span>
        </div>
        <button
          disabled={!selectedSlot}
          onClick={onProceedToPayment}
          className="bg-[#E4A0A0] text-[#1B2A4A] font-bold px-6 py-2.5 rounded text-xs hover:opacity-90 disabled:opacity-40 transition"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

