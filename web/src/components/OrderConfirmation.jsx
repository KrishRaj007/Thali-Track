import React from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  Printer
} from 'lucide-react';

export default function OrderConfirmation({
  activeOrder,
  copiedKey,
  copyToClipboard,
  onOrderAnother
}) {
  if (!activeOrder) return null;

  return (
    <div className="max-w-md mx-auto space-y-4 print-area">
      <div className="bg-[#24345A] p-6 rounded border-2 border-[#EED9A0] text-center">
        <span className="text-[11px] font-bold text-[#EED9A0] uppercase tracking-wider block">
          Counter Pickup Token
        </span>

        {/* Big readable Order ID */}
        <div className="flex items-center justify-center gap-2.5 my-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FFFFFF]">
            {activeOrder.public_order_id}
          </h1>
          {/* 9. Copy Button (Baseline #9) */}
          <button
            onClick={() => copyToClipboard(activeOrder.public_order_id, 'token-id')}
            className="p-1.5 bg-[#1B2A4A] rounded text-[#B8C2D9] hover:text-[#FFFFFF] no-print"
            title="Copy Token ID"
          >
            {copiedKey === 'token-id' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[#B8C2D9]">Call out this token at Counter 1 when ready</p>

        {/* Real-time Order Status Banner */}
        <div className="my-5 p-3.5 bg-[#1B2A4A] rounded flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] text-[#B8C2D9] block uppercase font-semibold">Live Status</span>
            <span
              className={`font-extrabold text-sm uppercase ${
                activeOrder.status === 'ready'
                  ? 'text-[#10B981]'
                  : activeOrder.status === 'preparing'
                  ? 'text-[#EED9A0]'
                  : 'text-[#E4A0A0]'
              }`}
            >
              ● {activeOrder.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#B8C2D9] block uppercase font-semibold">Pickup Time</span>
            <span className="font-extrabold text-sm text-[#FFFFFF]">{activeOrder.slot_start} IST</span>
          </div>
        </div>

        {/* Ready Notification Callout */}
        {activeOrder.status === 'ready' && (
          <div className="p-3 bg-[#10B981]/20 border border-[#10B981] text-[#10B981] rounded text-xs font-bold mb-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Your thali is ready for pickup at Counter 1!</span>
          </div>
        )}

        {/* Items Breakdown */}
        <div className="text-left text-xs border-t border-[#1B2A4A] pt-3 space-y-1.5 mb-4">
          <span className="font-semibold text-[#FFFFFF] block mb-1">Pre-Ordered Items:</span>
          {activeOrder.items?.map((it, idx) => (
            <div key={idx} className="flex justify-between text-[#B8C2D9]">
              <span>{it.qty}x {it.name}</span>
              <span className="text-[#FFFFFF]">₹{it.qty * it.unit_price}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-sm text-[#FFFFFF] pt-2 border-t border-[#1B2A4A]">
            <span>Total Amount Paid</span>
            <span>₹{activeOrder.total}</span>
          </div>
        </div>

        {/* 10. Print Stylesheet (Baseline #10) */}
        <div className="flex gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-[#1B2A4A] text-[#FFFFFF] py-2 rounded text-xs flex items-center justify-center gap-1.5 hover:bg-[#24345A] border border-[#24345A]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Token</span>
          </button>
          <button
            onClick={onOrderAnother}
            className="flex-1 bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2 rounded text-xs hover:opacity-90"
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  );
}

