import React from 'react';

export default function ManagerKitchen({
  managerOrders,
  managerSummary,
  managerStatusFilter,
  setManagerStatusFilter,
  managerSlotFilter,
  setManagerSlotFilter,
  onUpdateOrderStatus
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-[#FFFFFF]">Kitchen Order Dashboard</h2>
          <p className="text-xs text-[#B8C2D9]">Orders grouped by 10-minute pickup slots</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={managerStatusFilter}
            onChange={(e) => setManagerStatusFilter(e.target.value)}
            className="bg-[#24345A] text-xs text-[#FFFFFF] px-2.5 py-1.5 rounded border border-[#1B2A4A]"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
          </select>

          <select
            value={managerSlotFilter}
            onChange={(e) => setManagerSlotFilter(e.target.value)}
            className="bg-[#24345A] text-xs text-[#FFFFFF] px-2.5 py-1.5 rounded border border-[#1B2A4A]"
          >
            <option value="all">All Slots</option>
            {managerSummary.map((s) => (
              <option key={s.slot_start} value={s.slot_start}>
                {s.slot_start} ({s.count} orders)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slot summary tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {managerSummary.map((s) => (
          <div
            key={s.slot_start}
            onClick={() => setManagerSlotFilter(managerSlotFilter === s.slot_start ? 'all' : s.slot_start)}
            className={`px-3 py-1.5 rounded border text-xs cursor-pointer flex-shrink-0 transition ${
              managerSlotFilter === s.slot_start ? 'bg-[#24345A] border-[#EED9A0] text-[#EED9A0]' : 'bg-[#24345A] border-transparent text-[#B8C2D9]'
            }`}
          >
            <span className="font-bold">{s.slot_start}</span>
            <span className="ml-1 text-[10px] text-[#FFFFFF]">({s.count})</span>
            {s.ready_count > 0 && <span className="ml-1 text-[10px] text-[#10B981]">✓{s.ready_count}</span>}
          </div>
        ))}
      </div>

      {/* Orders Feed */}
      <div className="space-y-2.5">
        {managerOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#B8C2D9] bg-[#24345A] rounded">
            No orders matching the current filter.
          </div>
        ) : (
          managerOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-[#24345A] p-3.5 rounded border border-[#24345A] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#FFFFFF]">{ord.public_order_id}</span>
                  <span className="text-[11px] bg-[#1B2A4A] text-[#EED9A0] font-semibold px-2 py-0.5 rounded">
                    Slot: {ord.slot_start} IST
                  </span>
                  <span className="text-xs text-[#B8C2D9]">{ord.customer_name}</span>
                </div>
                <div className="mt-1 text-xs text-[#FFFFFF] font-medium">
                  {ord.items?.map((it) => `${it.qty}x ${it.name}`).join(' | ')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ord.status !== 'ready' && (
                  <button
                    onClick={() => onUpdateOrderStatus(ord.public_order_id, 'ready')}
                    className="text-xs bg-[#10B981] text-[#1B2A4A] font-bold px-3 py-1.5 rounded hover:opacity-90 active:scale-95 transition"
                  >
                    Mark Ready
                  </button>
                )}
                {ord.status === 'ready' && (
                  <button
                    onClick={() => onUpdateOrderStatus(ord.public_order_id, 'picked_up')}
                    className="text-xs bg-[#1B2A4A] text-[#B8C2D9] hover:text-[#FFFFFF] px-3 py-1.5 rounded transition"
                  >
                    Complete Handover
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

