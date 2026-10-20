import React, { useState, useEffect } from 'react';
import { CustomerReview, ProductItem } from '../../types';

interface SkuDetailScreenProps {
  product?: ProductItem;
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const SkuDetailScreen: React.FC<SkuDetailScreenProps> = ({
  product,
  reviews,
  onAddReview,
  onBack,
  onShowToast
}) => {
  // Use product if provided, else fallback to SKU-103
  const targetProduct: ProductItem = product || {
    id: 'prod-103',
    sku: 'SKU-103',
    name: 'Natural Honey 250g',
    category: 'Pantry & Sweeteners',
    price: 190,
    currentStock: 18,
    minThreshold: 10,
    suggestedRestock: 30,
    runDays: 20,
    batchNumber: '#M-2024-H09 (Mfg: Oct 2024)',
    mfgDate: 'Oct 2024',
    fssai: '10020042001928',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6dT1NxscPm63CA_-PtKC_--63OKW-6xUP59o2swHkhdSVAW7uRT9z-vm4uVxuCD3ilSx4jvss6RGbAaC4MJuk5oTivjJ-zbDJdHCbIx8bfjR3NztR4Atuj6sONsHnkyO-63yMfgwF1mFh0ytqYv5CPl9trATrhatGvkbV7FkbIZJBt6DRUJsp8o0Qd67JCmmlOy6CrHDMNaRF5KPKBXidIgfqv5z03DgGB5NMZaDYJyu4lBg1hPi6RA',
    supplierName: 'Apex Apiaries Direct',
    supplierEmail: 'procure@apexapiaries.com',
    supplierPhone: '+91 98401 88990',
    supplierId: 'VEND-712',
    status: 'healthy',
    unit: 'units',
    rating: 4.8,
    reviewCount: 328
  };

  // OTP state
  const [phoneNumber, setPhoneNumber] = useState('+91 98765-43210');
  const [otpDigits, setOtpDigits] = useState<string[]>(['4', '9', '1', '8', '2', '0']);
  const [isOtpVerified, setIsOtpVerified] = useState(true);
  const [resendTimer, setResendTimer] = useState(42);

  // Review Form state
  const [rating, setRating] = useState<number>(5.0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Freshness',
    'Packaging Quality',
    'Value for Money',
    'Taste'
  ]);
  const [reviewText, setReviewText] = useState<string>(
    'Tastes pure and packaging seal was intact! Would definitely buy again in combo with Almond Milk.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);
    if (newDigits.every((d) => d !== '')) {
      setIsOtpVerified(true);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      alert('Please complete customer OTP verification first.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCommitted(true);

      const newReview: CustomerReview = {
        id: `rev-${Date.now()}`,
        author: 'Verified Shopper (' + phoneNumber.slice(-4) + ')',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBJS2RKAQvmnttk8QsgrfgAmDDwLYckXX7xDuofa8XqeihldHKADibzoYuFjRq_Q2cjjerxsVWpDNCmjCBycQQc-HfIgKnGTBV9_srAuSiBik_fk_WtlyRq47svex5lgG5cVqpsoJV0R4ydzO0rwJaVGeTaQ-qp82j1xYj8QJfIS8R4nQfj5OEZuMvfgKFU49wdAJLGowd650kpEIUNW7Xw7eaYR-jrACPK-G6wlXuYDHQG6XX4kf-2yQ',
        rating,
        timestamp: 'Verified Buyer • Just now',
        content: reviewText,
        tags: selectedTags,
        isQrVerified: true
      };

      onAddReview(newReview);
      onShowToast('Review committed to MongoDB Atlas! Doc ID: #674fa');
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Top Detail Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-1 flex items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
          aria-label="Back to Catalog"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div className="flex flex-col text-center">
          <h2 className="font-headline font-semibold text-[17px] text-[#0b1c30] leading-tight">
            Sku Item Detail
          </h2>
          <span className="text-[11px] text-[#565e74]">Mepco Retail Hub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#3f465c] text-[11px] font-bold">
            Admin
          </span>
          <div className="w-8 h-8 rounded-full bg-[#0037b0] flex items-center justify-center text-white shrink-0 shadow-2xs font-semibold text-xs">
            <span className="material-symbols-outlined text-[16px]">person</span>
          </div>
        </div>
      </div>

      {/* Scan Trust Context Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-xl">
        <div className="flex items-center gap-1.5 text-[#004f35]">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            qr_code_scanner
          </span>
          <span className="text-[12px] font-semibold">QR Token: #SCAN-9842-MEPCO</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006948] text-white text-[11px] font-bold shadow-2xs">
          <span className="material-symbols-outlined text-[14px]">verified</span> Authentic Scan
        </span>
      </div>

      {/* Product Header Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-[#eff4ff] border border-[#dae2fd]">
            <img
              src={targetProduct.imageUrl}
              alt={targetProduct.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 right-1 bg-white/95 backdrop-blur-xs rounded-full p-0.5 flex items-center justify-center shadow-xs">
              <span
                className="material-symbols-outlined text-[#0037b0] text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          </div>
          <div className="flex flex-col flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#565e74] uppercase tracking-wider font-semibold">
                {targetProduct.sku}
              </span>
              <span className="font-headline font-bold text-[22px] text-[#0037b0] tabular-nums">
                ₹{targetProduct.price}
              </span>
            </div>
            <h2 className="font-headline font-semibold text-[17px] text-[#0b1c30] truncate">
              {targetProduct.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-[#565e74]">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span className="text-[12px]">
                Batch: {targetProduct.batchNumber || '#M-2024-H09 (Mfg: Oct 2024)'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#3f465c] text-[11px] font-bold">
                FSSAI {targetProduct.fssai || '10020042001928'}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[#004f35] text-[11px] font-bold">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>{' '}
                Seal Checked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & OTP Verification Gate */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col space-y-3.5">
        <div className="p-3 bg-[#dce9ff] rounded-lg flex items-start gap-2.5 border border-[#dae2fd]">
          <span className="material-symbols-outlined text-[#0037b0] text-[20px] shrink-0 mt-0.5">
            shield
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#0b1c30]">
              Customer Verification Required
            </span>
            <span className="text-[11px] text-[#434655] leading-tight">
              Prevent spam &amp; validate product reviewer integrity via fast SMS OTP.
            </span>
          </div>
        </div>

        {/* Phone Number Input with Action Button */}
        <div className="flex flex-col space-y-1">
          <label className="text-[12px] font-semibold text-[#565e74]">
            Customer Mobile Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#565e74]">
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
              </div>
              <input
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#0b1c30] text-[13px] font-medium focus:outline-none focus:border-[#1d4ed8]"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button
              className="px-3.5 h-10 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#565e74] text-[12px] font-bold shrink-0 flex items-center gap-1 cursor-pointer hover:bg-[#dce9ff]"
              type="button"
              onClick={() => {
                setResendTimer(45);
                onShowToast(`OTP resubmitted to ${phoneNumber}`);
              }}
            >
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Resend in {resendTimer}s</span>
            </button>
          </div>
        </div>

        {/* OTP Input Boxes & Verified Chip */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-[#565e74]">
              6-Digit Security Token
            </label>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#004f35] text-white text-[11px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[13px]">check</span> Verified ✓
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                className="h-12 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex items-center justify-center text-center font-headline font-bold text-[20px] text-[#0037b0] shadow-2xs focus:bg-white focus:border-[#1d4ed8] outline-none"
              />
            ))}
          </div>
          <span className="text-[12px] text-[#004f35] flex items-center gap-1 mt-0.5 font-medium">
            <span className="material-symbols-outlined text-[15px]">lock_open</span> Device authenticated. Feedback form unlocked.
          </span>
        </div>
      </div>

      {/* Unlocked Feedback Form */}
      <form
        onSubmit={handleSubmitReview}
        className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
              Your Product Rating
            </h3>
            <span className="text-[12px] text-[#565e74]">Tap stars to calibrate rating</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#dce1ff] text-[#001551] text-[12px] font-bold">
            {rating.toFixed(1)} / 5.0
          </span>
        </div>

        {/* Interactive 5-Star Selector */}
        <div className="flex items-center justify-center py-2.5 gap-2 bg-[#eff4ff] border border-[#dae2fd] rounded-lg">
          {[1, 2, 3, 4, 5].map((starVal) => {
            const isFilled = rating >= starVal;
            return (
              <button
                key={starVal}
                type="button"
                onClick={() => setRating(starVal)}
                className="p-1 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined text-[32px] ${
                    isFilled ? 'text-[#0037b0]' : 'text-[#c4c5d7]'
                  }`}
                  style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            );
          })}
        </div>

        {/* Quality Attribute Tags */}
        <div className="flex flex-col space-y-2">
          <label className="text-[12px] font-semibold text-[#565e74]">
            What impressed you the most?
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Freshness', icon: 'eco' },
              { label: 'Packaging Quality', icon: 'package_2' },
              { label: 'Value for Money', icon: 'savings' },
              { label: 'Taste', icon: 'restaurant' }
            ].map((tag) => {
              const active = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleTagToggle(tag.label)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-2xs transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1d4ed8] text-white border border-[#1d4ed8]'
                      : 'bg-[#eff4ff] text-[#565e74] border border-[#dae2fd] hover:bg-[#dce9ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Feedback Textarea */}
        <div className="flex flex-col space-y-1">
          <label className="text-[12px] font-semibold text-[#565e74]">
            Verified Customer Review
          </label>
          <textarea
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
            className="w-full p-3 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#0b1c30] text-[13px] focus:outline-none focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 resize-none leading-relaxed font-sans transition-all"
          />
          <div className="flex items-center justify-between text-[#565e74] text-[11px] pt-0.5">
            <span>Markdown supported</span>
            <span className="tabular-nums">{reviewText.length} / 500 chars</span>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-11 text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer ${
            isCommitted
              ? 'bg-[#004f35]'
              : 'bg-[#0037b0] hover:bg-[#1d4ed8]'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>Syncing to MongoDB...</span>
            </>
          ) : isCommitted ? (
            <>
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span>Review Committed (Doc ID: #674fa)</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>Post Verified Review to MongoDB</span>
            </>
          )}
        </button>
      </form>

      {/* Recent Customer Reviews Stream linked to SKU-103 */}
      <div className="flex flex-col space-y-3">
        {/* Stream Header & Aggregate Score Card */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
              {targetProduct.sku} Feedback Loop
            </span>
            <h3 className="font-headline font-semibold text-[17px] text-[#0b1c30]">
              Verified Community
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-[#eff4ff] border border-[#dae2fd] px-3 py-1.5 rounded-lg">
            <span
              className="material-symbols-outlined text-[#0037b0] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <div className="flex flex-col items-end">
              <span className="font-headline font-bold text-[18px] text-[#0b1c30] leading-none tabular-nums">
                4.8
              </span>
              <span className="text-[11px] text-[#565e74]">
                from {targetProduct.reviewCount || 328} scans
              </span>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#eff4ff] border border-[#dae2fd] shrink-0">
                  <img
                    src={rev.avatarUrl}
                    alt={rev.author}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#0b1c30]">{rev.author}</span>
                    {rev.isQrVerified && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#004f35] text-white text-[10px] font-bold">
                        QR Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#565e74]">{rev.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center text-[#0037b0]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`material-symbols-outlined text-[16px] ${
                      rev.rating >= s ? 'text-[#0037b0]' : 'text-[#c4c5d7]'
                    }`}
                    style={{ fontVariationSettings: rev.rating >= s ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-[#0b1c30] leading-relaxed">{rev.content}</p>
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {rev.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-[#eff4ff] border border-[#dae2fd] text-[#565e74] text-[11px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Operational Footer Signature */}
      <div className="flex items-center justify-center gap-1 text-[#565e74] pt-2 pb-4 text-center">
        <span className="material-symbols-outlined text-[14px]">database</span>
        <span className="text-[11px] font-mono">
          Document Store: cluster-mepco-feedback.reviews[{targetProduct.sku.toLowerCase()}]
        </span>
      </div>
    </div>
  );
};
