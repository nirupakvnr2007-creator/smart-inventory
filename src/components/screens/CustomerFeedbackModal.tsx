import React, { useState } from 'react';
import { CustomerReview, ProductItem } from '../../types';
import { QRCodeSVG } from '../../utils/qrGenerator';

interface CustomerFeedbackModalProps {
  product: ProductItem | null;
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const CustomerFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({
  product,
  reviews,
  onAddReview,
  onClose,
  onShowToast
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Quality']);

  if (!product) return null;

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      onShowToast('Please write a short review or feedback.');
      return;
    }

    const review: CustomerReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      customerPhone: customerPhone.trim() || 'Anonymous Customer',
      rating,
      comment: comment.trim(),
      tags: selectedTags,
      timestamp: new Date().toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      isVerified: true
    };

    onAddReview(review);
    setComment('');
    setCustomerPhone('');
    onShowToast(`Thank you! Verified customer review submitted for ${product.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-lg border border-[#e5eeff] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0037b0] text-[22px]">
              rate_review
            </span>
            <h3 className="font-headline font-bold text-[16px] text-[#0b1c30]">
              Customer Product Feedback
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#565e74] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Product Identity Header */}
        <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dae2fd] flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg border border-[#dae2fd]">
            <QRCodeSVG value={product.qrCode} size={64} />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[10px] font-bold text-[#0037b0]">
              {product.sku}
            </span>
            <h4 className="font-headline font-bold text-[15px] text-[#0b1c30] truncate">
              {product.name}
            </h4>
            <p className="text-[12px] text-[#565e74]">
              Brand: <strong>{product.brand}</strong> • Price: ₹{product.price}
            </p>
          </div>
        </div>

        {/* Review Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Rating Stars */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-[#0b1c30]">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="cursor-pointer text-[#ffab00] hover:scale-110 transition-transform"
                >
                  <span
                    className="material-symbols-outlined text-[26px]"
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
              <span className="text-[12px] font-bold text-[#0b1c30] ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Tags */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-[#0b1c30]">Quality Highlights</label>
            <div className="flex flex-wrap gap-1.5">
              {['Freshness', 'Packaging Quality', 'Value for Money', 'Taste', 'Satisfaction'].map(
                (tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#0037b0] text-white border-[#0037b0]'
                          : 'bg-[#eff4ff] text-[#565e74] border-[#dae2fd]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Phone verification */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-[#0b1c30]">
              Customer Mobile (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-[#0b1c30]">Feedback Comments *</label>
            <textarea
              rows={3}
              required
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Submit Verified Feedback</span>
          </button>
        </form>

        {/* Existing Reviews */}
        {productReviews.length > 0 && (
          <div className="pt-3 border-t border-[#eff4ff] space-y-2">
            <h4 className="font-headline font-bold text-[14px] text-[#0b1c30]">
              Customer Feedback Stream ({productReviews.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-2.5 bg-[#f8f9ff] border border-[#dae2fd] rounded-lg text-[12px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0b1c30]">
                      {rev.customerPhone || 'Customer'}
                    </span>
                    <span className="text-[11px] text-[#565e74]">{rev.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#ffab00]">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-[#434655]">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
