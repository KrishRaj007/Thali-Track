import React from 'react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="max-w-2xl mx-auto bg-[#24345A] p-6 rounded border border-[#24345A] text-xs leading-relaxed space-y-3">
      <h1 className="text-xl font-bold text-[#FFFFFF]">Privacy Policy</h1>
      <p className="text-[#EED9A0] font-semibold bg-[#1B2A4A] p-2.5 rounded">
        NOTICE: This policy is drafted in plain language for campus pre-order operations and requires review before commercial production launch.
      </p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">1. Information We Collect</h3>
      <p className="text-[#B8C2D9]">We collect student/faculty names, institutional email addresses, pre-order dish selections, and pickup slot timestamps to coordinate food preparation and queue flow.</p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">2. Purpose of Collection</h3>
      <p className="text-[#B8C2D9]">Data is processed solely to notify you when your thali is ready, compute campus queue wait times, and train waste-reduction forecasting models.</p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">3. Demo Payments Disclaimer</h3>
      <p className="text-[#B8C2D9]">Payments within this application are strictly simulated for evaluation and hackathon judging. No actual financial credentials, credit cards, or bank funds are stored or charged.</p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">4. Data Retention</h3>
      <p className="text-[#B8C2D9]">Active order tokens are retained during daily operations and aggregated into anonymous historical production statistics.</p>
      <button onClick={onBack} className="mt-4 bg-[#E4A0A0] text-[#1B2A4A] font-bold px-4 py-2 rounded">
        Return to Ordering
      </button>
    </div>
  );
}

export function TermsConditions({ onBack }) {
  return (
    <div className="max-w-2xl mx-auto bg-[#24345A] p-6 rounded border border-[#24345A] text-xs leading-relaxed space-y-3">
      <h1 className="text-xl font-bold text-[#FFFFFF]">Terms & Conditions</h1>
      <p className="text-[#EED9A0] font-semibold bg-[#1B2A4A] p-2.5 rounded">
        NOTICE: These terms outline campus canteen slot reservation rules and require administrative verification prior to full launch.
      </p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">1. Pickup Slot Windows</h3>
      <p className="text-[#B8C2D9]">Pre-orders are scheduled in 10-minute windows. Students should present their short order token (e.g. TT-4821) at Counter 1 within 15 minutes of slot readiness.</p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">2. Unclaimed Meals</h3>
      <p className="text-[#B8C2D9]">Unclaimed meals past 3:00 PM may be redistributed via the post-3 PM surplus discounting program to prevent organic waste.</p>
      <h3 className="font-bold text-sm text-[#FFFFFF] pt-2">3. Demonstration Prototype</h3>
      <p className="text-[#B8C2D9]">ThaliTrack is deployed under the hackathon problem statement PS-06 for campus sustainability.</p>
      <button onClick={onBack} className="mt-4 bg-[#E4A0A0] text-[#1B2A4A] font-bold px-4 py-2 rounded">
        Return to Ordering
      </button>
    </div>
  );
}

