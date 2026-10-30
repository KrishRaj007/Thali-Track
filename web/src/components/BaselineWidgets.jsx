import React from 'react';
import {
  Phone,
  X,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

// 2. Simple Cookie Banner (Baseline #2)
export function CookieBanner({ cookieAccepted, onAccept }) {
  if (cookieAccepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#24345A] border-t border-[#E4A0A0] p-3 no-print">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span className="text-[#B8C2D9]">
          ThaliTrack uses essential local cookies to store your pickup tray and demo credentials.
        </span>
        <button
          onClick={onAccept}
          className="bg-[#E4A0A0] text-[#1B2A4A] font-semibold px-4 py-1.5 rounded hover:opacity-90 transition whitespace-nowrap"
        >
          Accept Essential
        </button>
      </div>
    </div>
  );
}

// 4. Back to Top Button (Baseline #4)
export function BackToTop({ show }) {
  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-16 right-4 z-40 p-2.5 bg-[#24345A] border border-[#24345A] text-[#B8C2D9] hover:text-[#FFFFFF] rounded hover:border-[#E4A0A0] transition no-print"
      title="Back to Top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

// 20. Floating Contact Button & Modal (Baseline #20)
export function ContactHelpdesk({ isOpen, setIsOpen }) {
  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 no-print">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 bg-[#24345A] border border-[#E4A0A0] text-[#E4A0A0] rounded flex items-center justify-center hover:bg-[#E4A0A0] hover:text-[#1B2A4A] transition shadow-md"
          title="Campus Canteen Support"
          aria-label="Contact Canteen Helpdesk"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B2A4A]/80 flex items-center justify-center p-4">
          <div className="bg-[#24345A] p-5 rounded max-w-sm w-full border border-[#E4A0A0]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-[#FFFFFF]">Canteen Counter Desk</h3>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-[#B8C2D9]" /></button>
            </div>
            <p className="text-xs text-[#B8C2D9] mb-3">Have an issue with your pickup slot or dietary allergen?</p>
            <div className="space-y-1.5 text-xs text-[#FFFFFF] bg-[#1B2A4A] p-3 rounded mb-3">
              <p>📍 Central Campus Dining Hall, Counter 1</p>
              <p>📞 Internal Intercom: Ext 4022</p>
              <p>⏱️ Hours: 08:00 AM to 05:00 PM (Mon-Sat)</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// 19. Expandable FAQ Accordion (Baseline #19)
export function ExpandableFaq({ expandedFaq, setExpandedFaq }) {
  const faqs = [
    {
      q: 'How does the 10-minute pickup slot system work?',
      a: 'Choose your desired pickup time (e.g. 12:50 between lectures). The canteen prepares your order in advance so you can walk up to Counter 1 and show your short ID without waiting in line.'
    },
    {
      q: 'How does ThaliTrack predict canteen demand and prevent food waste?',
      a: 'Our forecasting microservice tracks 4 weeks of historical sales per weekday, analyzes lecture timetable peak breaks, and dynamically calculates recommended batch sizes with a 5% safety buffer.'
    },
    {
      q: 'What is the Post-3 PM Surplus Alert?',
      a: 'To achieve zero food waste, any remaining prepared portions after 3:00 PM are automatically offered at up to 45% discount to students and campus staff.'
    },
    {
      q: 'Are payments real?',
      a: 'No. Payment processing is completely simulated for hackathon demonstration. No real money or bank accounts are accessed.'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-[#24345A]">
      <h3 className="font-bold text-sm text-[#FFFFFF] mb-3">Campus Pre-Order FAQ</h3>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-[#24345A] rounded border border-[#24345A]">
            <button
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              className="w-full text-left p-3 flex justify-between items-center text-xs font-semibold text-[#FFFFFF]"
            >
              <span>{faq.q}</span>
              {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-[#E4A0A0]" /> : <ChevronDown className="w-4 h-4 text-[#B8C2D9]" />}
            </button>
            {expandedFaq === idx && (
              <div className="p-3 pt-0 text-xs text-[#B8C2D9] border-t border-[#1B2A4A]/50">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Auth Modal with 1-Tap Demo Logins
export function AuthModal({
  isOpen,
  setIsOpen,
  onDemoSignIn,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  showPassword,
  setShowPassword,
  isLoading,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1B2A4A]/80 flex items-center justify-center p-4">
      <div className="bg-[#24345A] p-5 rounded max-w-sm w-full border border-[#24345A]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-base text-[#FFFFFF]">Sign In to ThaliTrack</h3>
          <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-[#B8C2D9]" /></button>
        </div>

        {/* Quick 1-tap demo logins for judges */}
        <div className="mb-4 bg-[#1B2A4A] p-3 rounded">
          <span className="text-[11px] text-[#EED9A0] font-semibold block mb-2">1-Tap Judge Demo Logins:</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onDemoSignIn('student@thalitrack.edu', 'student123')}
              className="text-[11px] bg-[#24345A] text-[#FFFFFF] py-1.5 px-2 rounded hover:border-[#E4A0A0] border border-transparent font-medium"
            >
              Student (Aarav)
            </button>
            <button
              type="button"
              onClick={() => onDemoSignIn('manager@thalitrack.edu', 'manager123')}
              className="text-[11px] bg-[#24345A] text-[#EED9A0] py-1.5 px-2 rounded hover:border-[#EED9A0] border border-transparent font-semibold"
            >
              Manager (Chef)
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#B8C2D9] mb-1">Email Address</label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full bg-[#1B2A4A] p-2 rounded text-[#FFFFFF]"
              placeholder="student@thalitrack.edu"
              required
            />
          </div>

          {/* 13. Password Visibility Toggle (Baseline #13) */}
          <div>
            <label className="block text-[#B8C2D9] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-[#1B2A4A] p-2 pr-8 rounded text-[#FFFFFF]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[#B8C2D9]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Screen 3: Mock UPI Payment View
export function MockPaymentScreen({
  cart,
  dishes,
  cartTotal,
  selectedSlot,
  copiedKey,
  copyToClipboard,
  onChangeSlot,
  onAuthorizePay,
  isLoading
}) {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-[#24345A] p-5 rounded border border-[#24345A]">
        <div className="inline-block bg-[#1B2A4A] border border-[#EED9A0]/40 text-[#EED9A0] text-[10px] font-bold px-2 py-0.5 rounded mb-3 uppercase">
          Demo UPI Payment Gateway (No Real Money)
        </div>
        <h2 className="text-xl font-bold text-[#FFFFFF]">Pay ₹{cartTotal.toFixed(2)}</h2>
        <p className="text-xs text-[#B8C2D9] mt-0.5">
          Reserved Slot: <strong className="text-[#FFFFFF]">{selectedSlot} IST</strong>
        </p>

        <div className="my-4 border-t border-b border-[#1B2A4A] py-3 text-xs space-y-2">
          {Object.entries(cart).map(([dId, qty]) => {
            const dish = dishes.find((d) => d.id === parseInt(dId, 10));
            if (!dish) return null;
            return (
              <div key={dId} className="flex justify-between text-[#B8C2D9]">
                <span>{qty}x {dish.name}</span>
                <span className="font-semibold text-[#FFFFFF]">₹{qty * dish.price}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#1B2A4A] p-3 rounded mb-4 text-xs flex items-center justify-between">
          <div>
            <span className="text-[#B8C2D9] block text-[10px]">Canteen Demo VPA</span>
            <span className="font-mono font-bold text-[#FFFFFF]">canteen@campusupi</span>
          </div>
          {/* 9. Copy Button (Baseline #9) */}
          <button
            onClick={() => copyToClipboard('canteen@campusupi', 'upi-vpa')}
            className="text-xs text-[#E4A0A0] hover:text-[#FFFFFF] flex items-center gap-1 font-semibold"
          >
            {copiedKey === 'upi-vpa' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'upi-vpa' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onChangeSlot}
            className="flex-1 bg-[#1B2A4A] text-[#B8C2D9] py-2.5 rounded text-xs hover:text-[#FFFFFF]"
          >
            Change Slot
          </button>
          <button
            onClick={onAuthorizePay}
            disabled={isLoading}
            className="flex-1 bg-[#E4A0A0] text-[#1B2A4A] font-bold py-2.5 rounded text-xs hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Authorizing...' : 'Authorize Demo Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}

