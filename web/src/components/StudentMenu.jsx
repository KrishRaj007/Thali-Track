import React from 'react';
import {
  Search,
  X,
  Tag,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function StudentMenu({
  dishes,
  cart,
  updateCart,
  cartTotal,
  cartItemCount,
  onProceedToSlots,
  surplusOffers,
  quieterTip,
  onPickQuieterSlot,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory
}) {
  const filteredDishes = dishes.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'meals') return d.name.includes('Thali') || d.name.includes('Chawal') || d.name.includes('Biryani');
    if (activeCategory === 'snacks') return d.name.includes('Samosa') || d.name.includes('Poha') || d.name.includes('Dosa') || d.name.includes('Roll') || d.name.includes('Paratha') || d.name.includes('Bhature');
    if (activeCategory === 'beverages') return d.name.includes('Chai');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Timetable Rush Alert Banner */}
      {quieterTip && (
        <div className="bg-[#24345A] border border-[#EED9A0]/50 p-3 rounded flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 bg-[#1B2A4A] rounded flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#EED9A0]" />
            </div>
            <div>
              <span className="font-bold text-[#EED9A0] block">Timetable Rush Advisory</span>
              <span className="text-[#B8C2D9]">{quieterTip.message}</span>
            </div>
          </div>
          <button
            onClick={() => onPickQuieterSlot(quieterTip.recommended_slot)}
            className="bg-[#1B2A4A] text-[#EED9A0] hover:text-[#FFFFFF] border border-[#EED9A0]/40 font-semibold px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition"
          >
            Pick {quieterTip.recommended_slot}
          </button>
        </div>
      )}

      {/* Post-3 PM Surplus Discount Alert */}
      {surplusOffers.length > 0 && (
        <div className="bg-[#24345A] border border-[#E4A0A0]/60 p-3 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1B2A4A] rounded flex items-center justify-center">
              <Tag className="w-4 h-4 text-[#E4A0A0]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#FFFFFF] block">
                Post-3 PM Zero Food Waste Flash Sale Active
              </span>
              <span className="text-[11px] text-[#B8C2D9]">
                {surplusOffers.length} surplus items offered at up to 45% discount
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#1B2A4A] bg-[#E4A0A0] px-2 py-0.5 rounded">
            Discount Active
          </span>
        </div>
      )}

      {/* 3. Site Search & Category Segment Bar (Baseline #3) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#B8C2D9]" />
          <input
            type="text"
            placeholder="Search Rajma Chawal, Masala Dosa, Chai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#24345A] text-[#FFFFFF] pl-9 pr-8 py-2 text-xs rounded border border-transparent focus:border-[#E4A0A0] focus:outline-none placeholder-[#B8C2D9]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-[#B8C2D9]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center bg-[#24345A] p-0.5 rounded border border-[#1B2A4A] text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'meals', label: 'Thalis & Meals' },
            { id: 'snacks', label: 'Snacks' },
            { id: 'beverages', label: 'Tea & Drinks' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 font-medium rounded transition ${
                activeCategory === cat.id ? 'bg-[#1B2A4A] text-[#E4A0A0] font-bold' : 'text-[#B8C2D9] hover:text-[#FFFFFF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredDishes.map((dish) => {
          const inCartQty = cart[dish.id] || 0;
          const isOutOfStock = dish.remaining_quantity <= 0;
          const surplusDeal = surplusOffers.find((s) => s.dish_id === dish.id);

          return (
            <div
              key={dish.id}
              className={`bg-[#24345A] p-3.5 rounded border transition flex flex-col justify-between ${
                inCartQty > 0 ? 'border-[#E4A0A0]' : 'border-[#24345A] hover:border-[#B8C2D9]/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2">
                    <span
                      className="w-3.5 h-3.5 flex items-center justify-center border text-[8px] rounded-sm font-bold flex-shrink-0 mt-0.5"
                      style={{
                        borderColor: dish.veg ? '#10B981' : '#EF4444',
                        color: dish.veg ? '#10B981' : '#EF4444'
                      }}
                    >
                      ●
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-[#FFFFFF] leading-tight">{dish.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#B8C2D9]">
                        <span>Portion: ~{Math.round(dish.avg_portion_weight_kg * 1000)}g</span>
                        <span>•</span>
                        <span>{dish.remaining_quantity} left</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {surplusDeal ? (
                      <div>
                        <span className="font-bold text-sm text-[#E4A0A0] block">₹{surplusDeal.discount_price}</span>
                        <span className="text-[10px] text-[#B8C2D9] line-through">₹{dish.price}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-base text-[#EED9A0]">₹{dish.price}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-[#1B2A4A] flex items-center justify-between">
                <span className="text-[11px] text-[#B8C2D9]">
                  {inCartQty > 0 ? (
                    <strong className="text-[#E4A0A0]">{inCartQty} in tray (₹{inCartQty * dish.price})</strong>
                  ) : isOutOfStock ? (
                    <span className="text-[#EF4444] font-medium">Sold Out</span>
                  ) : (
                    'Ready in 10-min slot'
                  )}
                </span>

                {isOutOfStock ? (
                  <button disabled className="text-xs bg-[#1B2A4A] text-[#B8C2D9]/50 px-3 py-1 rounded cursor-not-allowed">
                    Unavailable
                  </button>
                ) : inCartQty === 0 ? (
                  <button
                    onClick={() => updateCart(dish.id, 1)}
                    className="text-xs bg-[#E4A0A0] text-[#1B2A4A] font-bold px-4 py-1.5 rounded hover:opacity-90 active:scale-95 transition"
                  >
                    Add to Tray
                  </button>
                ) : (
                  <div className="flex items-center bg-[#1B2A4A] rounded border border-[#24345A]">
                    <button
                      onClick={() => updateCart(dish.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-[#E4A0A0] font-bold hover:bg-[#24345A] rounded-l"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-bold text-[#FFFFFF]">{inCartQty}</span>
                    <button
                      onClick={() => updateCart(dish.id, 1)}
                      disabled={inCartQty >= dish.remaining_quantity}
                      className="w-7 h-7 flex items-center justify-center text-[#E4A0A0] font-bold hover:bg-[#24345A] rounded-r disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Floating Tray Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-30 no-print">
          <div className="bg-[#24345A] border-2 border-[#E4A0A0] p-3 rounded shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#B8C2D9] block">
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in your pickup tray
              </span>
              <span className="text-lg font-bold text-[#FFFFFF]">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onProceedToSlots}
              className="bg-[#E4A0A0] text-[#1B2A4A] font-bold px-5 py-2.5 rounded text-xs hover:opacity-90 transition flex items-center gap-1.5"
            >
              <span>Pick Pickup Slot (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

