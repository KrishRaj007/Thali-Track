import React from 'react';

export default function ManagerImpact({ impactData }) {
  if (!impactData) {
    return (
      <div className="p-8 text-center text-xs text-[#B8C2D9] bg-[#24345A] rounded">
        Loading impact and food waste calculations...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#FFFFFF]">Food Waste Reduction Impact</h2>
        <p className="text-xs text-[#B8C2D9]">
          Calculated strictly from 4 weeks of empirical daily production records
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
          <span className="text-xs text-[#B8C2D9] block">Total Food Saved</span>
          <span className="text-3xl font-extrabold text-[#EED9A0]">{impactData.food_saved_kg} kg</span>
          <span className="text-[11px] text-[#B8C2D9] block mt-1">across {impactData.days_tracked} operating days</span>
        </div>
        <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
          <span className="text-xs text-[#B8C2D9] block">Waste Reduction Rate</span>
          <span className="text-3xl font-extrabold text-[#10B981]">{impactData.waste_reduction_percentage}%</span>
          <span className="text-[11px] text-[#B8C2D9] block mt-1">compared to blind prep baseline</span>
        </div>
        <div className="bg-[#24345A] p-4 rounded border border-[#24345A]">
          <span className="text-xs text-[#B8C2D9] block">Pre-Orders Facilitated</span>
          <span className="text-3xl font-extrabold text-[#E4A0A0]">{impactData.total_preorders_placed}</span>
          <span className="text-[11px] text-[#B8C2D9] block mt-1">queue-free student pickups</span>
        </div>
      </div>

      <div className="bg-[#24345A] p-4 rounded border border-[#24345A] space-y-2">
        <h4 className="font-semibold text-xs text-[#FFFFFF]">Explainable Formula Breakdown</h4>
        <div className="p-3 bg-[#1B2A4A] rounded text-[11px] font-mono text-[#EED9A0]">
          {impactData.formula_explanation}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 bg-[#1B2A4A] rounded">
            <span className="text-[#B8C2D9] block text-[10px]">Baseline Guess Waste</span>
            <strong className="text-[#FFFFFF]">{impactData.total_baseline_waste_kg} kg</strong>
          </div>
          <div className="p-2 bg-[#1B2A4A] rounded">
            <span className="text-[#B8C2D9] block text-[10px]">Actual Waste with ThaliTrack</span>
            <strong className="text-[#10B981]">{impactData.total_actual_waste_kg} kg</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

