import React from 'react';

export default function ManagerSurplus({
  dishes,
  surplusForm,
  setSurplusForm,
  onSubmitSurplus
}) {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#FFFFFF]">Post-3 PM Surplus Food Flash Sale</h2>
        <p className="text-xs text-[#B8C2D9]">
          Trigger automatic discounted flash offers to clear food inventory before closing
        </p>
      </div>

      <form onSubmit={onSubmitSurplus} className="bg-[#24345A] p-4 rounded space-y-3 text-xs">
        <div>
          <label className="block text-[#B8C2D9] mb-1">Surplus Dish</label>
          <select
            value={surplusForm.dish_id}
            onChange={(e) => {
              const d = dishes.find((item) => item.id === parseInt(e.target.value, 10));
              setSurplusForm({
                ...surplusForm,
                dish_id: e.target.value,
                original_price: d ? d.price : ''
              });
            }}
            className="w-full bg-[#1B2A4A] p-2 rounded text-[#FFFFFF]"
            required
          >
            <option value="">-- Choose Dish --</option>
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>{d.name} (Original: ₹{d.price})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[#B8C2D9] mb-1">Portions Remaining</label>
            <input
              type="number"
              value={surplusForm.qty}
              onChange={(e) => setSurplusForm({ ...surplusForm, qty: e.target.value })}
              className="w-full bg-[#1B2A4A] p-2 rounded text-[#FFFFFF]"
              placeholder="e.g. 10"
              required
            />
          </div>
          <div>
            <label className="block text-[#B8C2D9] mb-1">Discount Price (₹)</label>
            <input
              type="number"
              value={surplusForm.discount_price}
              onChange={(e) => setSurplusForm({ ...surplusForm, discount_price: e.target.value })}
              className="w-full bg-[#1B2A4A] p-2 rounded text-[#FFFFFF]"
              placeholder="e.g. 45"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2.5 rounded hover:opacity-90 transition mt-2"
        >
          Broadcast Flash Offer & Push Alert
        </button>
      </form>
    </div>
  );
}

