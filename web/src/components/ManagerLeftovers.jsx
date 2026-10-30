import React from 'react';

export default function ManagerLeftovers({
  dishes,
  leftoverInputs,
  setLeftoverInputs,
  onSubmitLeftovers
}) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#FFFFFF]">Closing Leftovers Logging</h2>
        <p className="text-xs text-[#B8C2D9]">
          Weights recorded here dynamically lower tomorrow's recommended prepare buffer
        </p>
      </div>

      <form onSubmit={onSubmitLeftovers} className="bg-[#24345A] p-4 rounded space-y-3">
        {dishes.map((d) => (
          <div key={d.id} className="flex items-center justify-between text-xs py-1 border-b border-[#1B2A4A]/50">
            <span className="font-medium text-[#FFFFFF]">{d.name}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setLeftoverInputs({
                    ...leftoverInputs,
                    [d.id]: ((parseFloat(leftoverInputs[d.id]) || 0) + 0.5).toFixed(1)
                  })
                }
                className="px-1.5 py-0.5 bg-[#1B2A4A] rounded text-[10px] text-[#B8C2D9]"
              >
                +0.5
              </button>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={leftoverInputs[d.id] || ''}
                onChange={(e) => setLeftoverInputs({ ...leftoverInputs, [d.id]: e.target.value })}
                className="w-16 bg-[#1B2A4A] text-right p-1.5 rounded text-[#FFFFFF] text-xs border border-[#1B2A4A] focus:border-[#E4A0A0]"
              />
              <span className="text-[#B8C2D9] text-xs">kg</span>
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2.5 rounded text-xs hover:opacity-90 transition mt-2"
        >
          Submit Leftover Audit
        </button>
      </form>
    </div>
  );
}

