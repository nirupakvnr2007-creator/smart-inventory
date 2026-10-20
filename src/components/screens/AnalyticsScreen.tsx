import React, { useState } from 'react';
import { ProductItem, ProductRecommendation, RoleType } from '../../types';

interface AnalyticsScreenProps {
  products: ProductItem[];
  recommendations: ProductRecommendation[];
  activeRole: RoleType;
  onAddRecommendation: (rec: ProductRecommendation) => void;
  onNavigateToRestock: () => void;
  onNavigateToPos: () => void;
  onShowToast: (msg: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  products,
  recommendations,
  activeRole,
  onAddRecommendation,
  onNavigateToRestock,
  onNavigateToPos,
  onShowToast
}) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('daily');
  const [showNewAiPromoModal, setShowNewAiPromoModal] = useState(false);

  // New promo builder state
  const [promoLeadSku, setPromoLeadSku] = useState('SKU-103');
  const [promoPairSku, setPromoPairSku] = useState('SKU-314');
  const [discountPct, setDiscountPct] = useState('15');

  const isOwnerOrManager = activeRole === 'Owner' || activeRole === 'Manager';

  // Calculate product metrics
  const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalSalesVolume = products.reduce((acc, p) => acc + (p.salesLast30Days || 0), 0);
  const totalRevenue = products.reduce(
    (acc, p) => acc + (p.salesLast30Days || 0) * p.price,
    0
  );
  const estimatedCost = products.reduce(
    (acc, p) => acc + (p.salesLast30Days || 0) * (p.costPrice || p.price * 0.7),
    0
  );
  const grossProfit = totalRevenue - estimatedCost;
  const profitMargin = Math.round((grossProfit / (totalRevenue || 1)) * 100);

  // Classify products into Best-performing, Underperforming, Slow-moving
  const sortedBySales = [...products].sort(
    (a, b) => (b.salesLast30Days || 0) - (a.salesLast30Days || 0)
  );
  const bestPerformers = sortedBySales.slice(0, 3);
  const slowMovers = sortedBySales.slice(-3).reverse();

  // Handle generating new AI combo
  const handleGenerateAiCombo = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = products.find((p) => p.sku === promoLeadSku);
    const pair = products.find((p) => p.sku === promoPairSku);

    if (!lead || !pair) return;

    const originalPrice = lead.price + pair.price;
    const discount = parseInt(discountPct, 10) || 10;
    const bundlePrice = Math.round(originalPrice * (1 - discount / 100));

    const newRec: ProductRecommendation = {
      id: `rec-${Date.now()}`,
      title: `${lead.name.split(' ')[0]} & ${pair.name.split(' ')[0]} Smart Duo`,
      leadSku: lead.sku,
      pairSku: pair.sku,
      originalPrice,
      bundlePrice,
      discountPercent: discount,
      rationale: `AI identified that high-frequency ${lead.name} (${lead.salesLast30Days} units) pairs effectively with slow-moving ${pair.name} (${pair.salesLast30Days} units) based on breakfast/beverage affinity scores.`,
      predictedSalesLift: `+${discount * 2}% ${pair.sku} velocity, ₹${Math.round(
        bundlePrice * 12
      )} estimated margin boost`,
      status: 'Active'
    };

    onAddRecommendation(newRec);
    setShowNewAiPromoModal(false);
    onShowToast(`AI Recommendation "${newRec.title}" generated and synced with POS!`);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
            Sales &amp; Business Intelligence
          </span>
          <h2 className="font-headline font-semibold text-[18px] text-[#0b1c30]">
            Performance Analytics &amp; AI Recommendations
          </h2>
        </div>

        {/* Time period toggle */}
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg border border-[#dae2fd]">
          <button
            onClick={() => setTimeRange('daily')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              timeRange === 'daily'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74]'
            }`}
          >
            Today (Shift)
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              timeRange === 'monthly'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74]'
            }`}
          >
            Monthly Trend
          </button>
        </div>
      </div>

      {/* Role view notice for Helper */}
      {activeRole === 'Helper' && (
        <div className="p-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-xl flex items-center gap-2 text-[12px] text-[#434655]">
          <span className="material-symbols-outlined text-[#0037b0] text-[18px]">visibility</span>
          <span>
            <strong>Helper Access:</strong> You can view sales trends, unit velocity, and stock health. Financial profit margins are reserved for Owner/Manager.
          </span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74]">
            {timeRange === 'daily' ? "Today's Gross Sales" : '30-Day Gross Revenue'}
          </span>
          <div className="font-headline font-bold text-[22px] text-[#0037b0] tabular-nums mt-0.5">
            ₹{timeRange === 'daily' ? '42,850' : totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#004f35] font-semibold flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +18.4% vs last period
          </span>
        </div>

        {/* Profit Indicators: Owner & Manager only */}
        {isOwnerOrManager ? (
          <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
            <span className="text-[11px] text-[#565e74]">Est. Gross Profit</span>
            <div className="font-headline font-bold text-[22px] text-[#004f35] tabular-nums mt-0.5">
              ₹{grossProfit.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#004f35] font-semibold mt-1 block">
              {profitMargin}% estimated margin
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
            <span className="text-[11px] text-[#565e74]">Units Sold (30D)</span>
            <div className="font-headline font-bold text-[22px] text-[#0b1c30] tabular-nums mt-0.5">
              {totalSalesVolume} units
            </div>
            <span className="text-[11px] text-[#565e74] mt-1 block">
              Healthy floor turnover
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74]">Total Live Units</span>
          <div className="font-headline font-bold text-[22px] text-[#0b1c30] tabular-nums mt-0.5">
            {totalStock}
          </div>
          <span className="text-[11px] text-[#565e74] mt-1 block">
            Across {products.length} registered SKUs
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74]">Customer Rating Index</span>
          <div className="font-headline font-bold text-[22px] text-[#0037b0] tabular-nums mt-0.5">
            4.7 ★
          </div>
          <span className="text-[11px] text-[#004f35] font-semibold mt-1 block">
            From 920+ QR audit scans
          </span>
        </div>
      </div>

      {/* Sales Trend Chart (CSS / SVG Graphic) */}
      <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
              {timeRange === 'daily'
                ? 'Hourly Shift Sales Velocity (Today)'
                : 'Weekly Sales Revenue Trend (This Month)'}
            </h3>
            <span className="text-[11px] text-[#565e74]">
              Data synchronized with Cashier checkout register
            </span>
          </div>
          <span className="text-[11px] text-[#0037b0] font-bold">
            Peak: 11:00 AM - 1:00 PM
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-36 w-full flex items-end gap-2 pt-4 px-2 border-b border-[#eff4ff]">
          {[
            { label: '08:00', value: 35, amount: '₹3,200' },
            { label: '10:00', value: 65, amount: '₹7,800' },
            { label: '12:00', value: 95, amount: '₹14,200' },
            { label: '14:00', value: 50, amount: '₹6,100' },
            { label: '16:00', value: 75, amount: '₹8,900' },
            { label: '18:00', value: 85, amount: '₹11,400' },
            { label: '20:00', value: 40, amount: '₹4,200' }
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0b1c30] text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap z-10">
                {bar.amount}
              </div>
              <div
                className="w-full bg-[#dce1ff] group-hover:bg-[#0037b0] rounded-t-md transition-colors"
                style={{ height: `${bar.value}%` }}
              ></div>
              <span className="text-[10px] text-[#565e74] font-mono mt-1">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Based Smart Product Recommendations Section */}
      <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dce1ff] text-[#001551] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
                AI-Based Smart Product Recommendations
              </h3>
              <span className="text-[11px] text-[#565e74]">
                Combines high-velocity &amp; slow-moving SKUs based on basket association algorithms
              </span>
            </div>
          </div>
          {isOwnerOrManager && (
            <button
              onClick={() => setShowNewAiPromoModal(true)}
              className="px-3 py-1 rounded-lg bg-[#0037b0] text-white text-[11px] font-bold hover:bg-[#1d4ed8] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>New AI Combo</span>
            </button>
          )}
        </div>

        <div className="space-y-3 pt-1">
          {recommendations.map((rec) => {
            const leadProd = products.find((p) => p.sku === rec.leadSku);
            const pairProd = products.find((p) => p.sku === rec.pairSku);

            return (
              <div
                key={rec.id}
                className="p-3.5 bg-[#eff4ff] border border-[#dae2fd] rounded-xl space-y-2 hover:border-[#0037b0] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-headline font-bold text-[14px] text-[#0b1c30]">
                        {rec.title}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                        {rec.status} Promo
                      </span>
                    </div>
                    <span className="text-[11px] text-[#565e74]">
                      Pairing: <strong>{leadProd?.name || rec.leadSku}</strong> +{' '}
                      <strong>{pairProd?.name || rec.pairSku}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-headline font-bold text-[15px] text-[#0037b0] tabular-nums block">
                      Bundle: ₹{rec.bundlePrice}
                    </span>
                    <span className="text-[10px] text-[#565e74] line-through">
                      MRP: ₹{rec.originalPrice}
                    </span>
                  </div>
                </div>

                <p className="text-[12px] text-[#434655] leading-relaxed">
                  <strong>AI Rationale:</strong> {rec.rationale}
                </p>

                <div className="pt-2 border-t border-[#dae2fd] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-[#004f35] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">insights</span>
                    <span>Predicted Lift: {rec.predictedSalesLift}</span>
                  </div>
                  <button
                    onClick={onNavigateToPos}
                    className="text-[#0037b0] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>Apply at POS Counter</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Performance Classification (Best, Underperforming & Slow-Moving) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Best Performing SKUs */}
        <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#004f35]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <h3 className="font-headline font-semibold text-[14px]">
                Best-Performing Products
              </h3>
            </div>
            <span className="text-[11px] text-[#565e74]">High Volume &amp; Ratings</span>
          </div>

          <div className="space-y-2">
            {bestPerformers.map((p) => (
              <div
                key={p.sku}
                className="p-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="text-[12px] font-bold text-[#0b1c30] block truncate max-w-[180px]">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-[#565e74]">
                    {p.sku} • {p.rating || 4.8}★ • {p.salesLast30Days || 120} sold (30D)
                  </span>
                </div>
                <span className="font-headline font-bold text-[13px] text-[#004f35]">
                  ₹{(p.salesLast30Days || 100) * p.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving / Underperforming SKUs */}
        <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
              <h3 className="font-headline font-semibold text-[14px]">
                Underperforming / Slow-Moving
              </h3>
            </div>
            <span className="text-[11px] text-[#565e74]">Require Attention</span>
          </div>

          <div className="space-y-2">
            {slowMovers.map((p) => (
              <div
                key={p.sku}
                className="p-2.5 bg-[#fff0ee] border border-[#ffdad6] rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="text-[12px] font-bold text-[#0b1c30] block truncate max-w-[180px]">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-[#565e74]">
                    {p.sku} • Only {p.salesLast30Days || 40} sold (30D) • Stock: {p.currentStock}
                  </span>
                </div>
                <button
                  onClick={onNavigateToRestock}
                  className="px-2 py-1 bg-white border border-[#ffb4ab] text-[#ba1a1a] rounded text-[10px] font-bold hover:bg-[#ffdad6] cursor-pointer"
                >
                  Inspect PO
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New AI Promotional Combination Modal */}
      {showNewAiPromoModal && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-md border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0037b0] text-[20px]">
                  auto_awesome
                </span>
                <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
                  Synthesize AI Product Bundle
                </h3>
              </div>
              <button
                onClick={() => setShowNewAiPromoModal(false)}
                className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#565e74]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerateAiCombo} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Anchor High-Mover SKU
                </label>
                <select
                  value={promoLeadSku}
                  onChange={(e) => setPromoLeadSku(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} - {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Paired Slow-Mover SKU to Accelerate
                </label>
                <select
                  value={promoPairSku}
                  onChange={(e) => setPromoPairSku(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} - {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Target Bundle Discount (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAiPromoModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold shadow-xs hover:bg-[#1d4ed8]"
                >
                  Generate &amp; Activate Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
