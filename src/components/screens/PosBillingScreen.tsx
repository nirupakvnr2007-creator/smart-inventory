import React, { useState } from 'react';
import { ProductItem, CartItem, SalesTransaction, ProductRecommendation, RoleType } from '../../types';

interface PosBillingScreenProps {
  products: ProductItem[];
  activeRole: RoleType;
  transactions: SalesTransaction[];
  recommendations: ProductRecommendation[];
  onCompleteSale: (
    items: CartItem[],
    subtotal: number,
    gst: number,
    discount: number,
    total: number,
    paymentMethod: 'UPI' | 'Cash' | 'Card',
    cashierName: string
  ) => void;
  onRefundTransaction: (txnId: string) => void;
  onShowToast: (msg: string) => void;
}

export const PosBillingScreen: React.FC<PosBillingScreenProps> = ({
  products,
  activeRole,
  transactions,
  recommendations,
  onCompleteSale,
  onRefundTransaction,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'history'>('checkout');
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: products.find((p) => p.sku === 'SKU-103') || products[0],
      quantity: 1
    },
    {
      product: products.find((p) => p.sku === 'SKU-102') || products[1],
      quantity: 1
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [customerPhone, setCustomerPhone] = useState('+91 98401 22334');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedBundleName, setAppliedBundleName] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<SalesTransaction | null>(null);

  const activeCashierName =
    activeRole === 'Cashier'
      ? 'Rahul Joshi'
      : activeRole === 'Manager'
      ? 'Ananya Kapoor'
      : activeRole === 'Owner'
      ? 'Dr. Maya Chen'
      : 'Siddharth Varma (Helper)';

  const addToCart = (product: ProductItem) => {
    if (product.currentStock <= 0) {
      onShowToast(`Out of stock alert: ${product.name} has 0 units available.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          onShowToast(
            `Stock Limit Reached: Only ${product.currentStock} units of ${product.sku} currently available.`
          );
          return prev;
        }
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (sku: string, delta: number) => {
    const item = cart.find((i) => i.product.sku === sku);
    if (!item) return;

    if (delta > 0 && item.quantity >= item.product.currentStock) {
      onShowToast(
        `Cannot add more than available inventory count (${item.product.currentStock}).`
      );
      return;
    }

    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.sku === sku) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const applyPromoBundle = (rec: ProductRecommendation) => {
    const leadProd = products.find((p) => p.sku === rec.leadSku);
    const pairProd = products.find((p) => p.sku === rec.pairSku);

    if (!leadProd || !pairProd) return;

    if (leadProd.currentStock <= 0 || pairProd.currentStock <= 0) {
      onShowToast(`Cannot apply promo: One or both bundle items are out of stock.`);
      return;
    }

    // Add both to cart
    setCart((prev) => {
      const nextCart = [...prev];
      const hasLead = nextCart.find((i) => i.product.sku === leadProd.sku);
      const hasPair = nextCart.find((i) => i.product.sku === pairProd.sku);

      if (!hasLead) nextCart.push({ product: leadProd, quantity: 1 });
      if (!hasPair) nextCart.push({ product: pairProd, quantity: 1 });
      return nextCart;
    });

    const discountValue = rec.originalPrice - rec.bundlePrice;
    setAppliedDiscount(discountValue);
    setAppliedBundleName(rec.title);
    onShowToast(`Applied ${rec.title}: ₹${discountValue} promotional combo discount!`);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(0);
    setAppliedBundleName(null);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const gst = Math.round((subtotal - appliedDiscount) * 0.05);
  const total = Math.max(0, subtotal - appliedDiscount + gst);

  const handleCheckout = () => {
    if (cart.length === 0) {
      onShowToast('Register cart is empty. Tap items to scan.');
      return;
    }

    // Validate stock for all items
    for (const item of cart) {
      const liveProduct = products.find((p) => p.sku === item.product.sku);
      if (!liveProduct || item.quantity > liveProduct.currentStock) {
        onShowToast(
          `Validation failed: ${item.product.name} exceeds available stock (${liveProduct?.currentStock || 0}).`
        );
        return;
      }
    }

    const receipt: SalesTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierName: activeCashierName,
      items: cart.map((c) => ({
        sku: c.product.sku,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity
      })),
      subtotal,
      gst,
      discount: appliedDiscount,
      total,
      paymentMethod,
      status: 'Completed'
    };

    setLastReceipt(receipt);
    onCompleteSale(
      cart,
      subtotal,
      gst,
      appliedDiscount,
      total,
      paymentMethod,
      activeCashierName
    );
    setCart([]);
    setAppliedDiscount(0);
    setAppliedBundleName(null);
    setShowReceiptModal(true);
    onShowToast(`Sale completed for ₹${total}! Live stock automatically decremented.`);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Terminal Header */}
      <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-[#e5eeff] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#dae2fd] text-[#131b2e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-semibold text-[15px] text-[#0b1c30]">
                Checkout Terminal #02
              </span>
              <span className="text-[10px] bg-[#85f8c4] text-[#002114] px-1.5 py-0.2 rounded font-bold">
                ONLINE
              </span>
            </div>
            <span className="text-[11px] text-[#565e74]">
              Active Cashier: {activeCashierName} • Lane 02
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg border border-[#dae2fd]">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              activeTab === 'checkout'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74]'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74]'
            }`}
          >
            Sales Log ({transactions.length})
          </button>
        </div>
      </div>

      {activeTab === 'checkout' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Quick SKU Touch Bar */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {/* AI Promotional Recommendations Callout */}
            {recommendations.length > 0 && (
              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dae2fd] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#0037b0] font-bold text-[12px]">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>AI Promotional Bundles (1-Click Add)</span>
                  </div>
                  <span className="text-[10px] bg-[#85f8c4] text-[#002114] px-1.5 py-0.2 rounded font-bold">
                    Active Offers
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => applyPromoBundle(rec)}
                      className="p-2 bg-white rounded-lg border border-[#dae2fd] hover:border-[#0037b0] text-left transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0b1c30]">
                          {rec.title}
                        </span>
                        <span className="text-[10px] text-[#ba1a1a] font-bold">
                          -{rec.discountPercent}% OFF
                        </span>
                      </div>
                      <span className="text-[10px] text-[#565e74] mt-0.5 truncate">
                        {rec.leadSku} + {rec.pairSku}
                      </span>
                      <div className="flex items-center justify-between pt-1 border-t border-[#eff4ff] mt-1 text-[11px]">
                        <span className="text-[#004f35] font-bold font-mono">
                          Combo ₹{rec.bundlePrice}
                        </span>
                        <span className="text-[10px] text-[#0037b0] font-semibold">
                          Apply Bundle +
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#565e74] uppercase tracking-wider">
                Quick SKU Touchpad
              </span>
              <span className="text-[11px] text-[#565e74]">
                Tap product to increment checkout slip
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {products.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                return (
                  <button
                    key={p.sku}
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className="p-2.5 bg-white rounded-xl border border-[#dae2fd] hover:border-[#1d4ed8] text-left transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex flex-col justify-between h-28 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#565e74]">{p.sku}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            isOutOfStock ? 'text-[#ba1a1a]' : 'text-[#004f35]'
                          }`}
                        >
                          {isOutOfStock ? '0 units' : `${p.currentStock} left`}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#0b1c30] line-clamp-2 mt-0.5">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#eff4ff]">
                      <span className="font-headline font-bold text-[13px] text-[#0037b0]">
                        ₹{p.price}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-[#0037b0]">
                        add_shopping_cart
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Cart & Register Slip */}
          <div className="lg:col-span-5 bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0037b0]">
                    receipt_long
                  </span>
                  <span className="font-headline font-semibold text-[14px] text-[#0b1c30]">
                    Customer Bill Slip ({cart.length})
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-[#ba1a1a] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-[#eff4ff] max-h-52 overflow-y-auto my-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-[#565e74] text-[12px]">
                    Cart is empty. Tap any product on the touchpad to begin billing.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.sku}
                      className="py-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-semibold text-[#0b1c30] truncate">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-[#565e74]">
                          ₹{item.product.price} × {item.quantity} = ₹
                          {item.product.price * item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-[#eff4ff] px-1.5 py-0.5 rounded-lg border border-[#dae2fd]">
                        <button
                          onClick={() => updateCartQty(item.product.sku, -1)}
                          className="w-5 h-5 flex items-center justify-center text-[#ba1a1a] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-[11px] font-bold text-[#0b1c30] w-4 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.sku, 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#004f35] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-2 border-t border-[#eff4ff] space-y-1.5 text-[12px]">
                <div className="flex justify-between text-[#565e74]">
                  <span>Items Subtotal:</span>
                  <span className="tabular-nums font-semibold">₹{subtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#004f35] font-semibold">
                    <span>Bundle Discount ({appliedBundleName}):</span>
                    <span className="tabular-nums">-₹{appliedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#565e74]">
                  <span>Store GST (5%):</span>
                  <span className="tabular-nums font-semibold">₹{gst}</span>
                </div>
                <div className="flex justify-between text-[#0b1c30] font-headline font-bold text-[15px] pt-1 border-t border-[#dae2fd]">
                  <span>Total Amount Due:</span>
                  <span className="text-[#0037b0] tabular-nums">₹{total}</span>
                </div>
              </div>

              {/* Tender Options */}
              <div className="pt-3 space-y-1.5">
                <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                  Payment Tender
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['UPI', 'Cash', 'Card'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#0037b0] text-white border-[#0037b0] shadow-xs'
                          : 'bg-[#eff4ff] text-[#565e74] border-[#dae2fd]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <label className="text-[11px] text-[#565e74]">Customer Receipt Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] px-2.5 py-1.5 rounded-lg text-[12px] text-[#0b1c30] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg font-bold text-[13px] shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirm Sale &amp; Decrement Stock (₹{total})</span>
            </button>
          </div>
        </div>
      ) : (
        /* Transactions & Refund Management View */
        <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
              Recorded Sales Transactions Archive
            </h3>
            <span className="text-[11px] text-[#565e74]">
              Automatic audit &amp; refund stock reinstatement
            </span>
          </div>

          <div className="divide-y divide-[#eff4ff]">
            {transactions.map((txn) => {
              const isRefunded = txn.status === 'Refunded';
              return (
                <div key={txn.id} className="py-3 flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] text-[#0037b0]">
                          {txn.id}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            isRefunded
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#85f8c4] text-[#002114]'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#565e74]">
                        {txn.timestamp} • Cashier: {txn.cashierName} • {txn.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-headline font-bold text-[15px] text-[#0b1c30] tabular-nums block">
                        ₹{txn.total}
                      </span>
                      {!isRefunded && (activeRole === 'Manager' || activeRole === 'Owner' || activeRole === 'Cashier') && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Process return/refund for ${txn.id}? Sold units will be restored to inventory.`
                              )
                            ) {
                              onRefundTransaction(txn.id);
                              onShowToast(`Transaction ${txn.id} refunded! Stock reinstated in MongoDB.`);
                            }
                          }}
                          className="text-[11px] text-[#ba1a1a] hover:underline font-bold mt-0.5 cursor-pointer"
                        >
                          Process Return / Refund
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#eff4ff] p-2 rounded-lg text-[11px] text-[#434655] space-y-0.5">
                    {txn.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.name} (x{it.quantity})
                        </span>
                        <span className="font-mono">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-[#e5eeff] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center pb-2 border-b border-dashed border-[#c4c5d7]">
              <span className="material-symbols-outlined text-[28px] text-[#004f35]">
                check_circle
              </span>
              <h3 className="font-headline font-bold text-[16px] text-[#0b1c30] mt-1">
                GreenHarvest Supermarket
              </h3>
              <p className="text-[11px] text-[#565e74]">
                Mepco Retail Hub • Terminal #02
              </p>
              <p className="text-[10px] font-mono text-[#565e74] mt-0.5">
                Receipt #{lastReceipt.id} • {lastReceipt.timestamp}
              </p>
            </div>

            <div className="space-y-1.5 text-[12px] divide-y divide-[#eff4ff]">
              {lastReceipt.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between pt-1 font-medium text-[#0b1c30]"
                >
                  <span className="truncate max-w-[180px]">
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="tabular-nums">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-[#c4c5d7] space-y-1 text-[12px]">
              <div className="flex justify-between text-[#565e74]">
                <span>Subtotal:</span>
                <span>₹{lastReceipt.subtotal}</span>
              </div>
              {lastReceipt.discount > 0 && (
                <div className="flex justify-between text-[#004f35]">
                  <span>Promo Bundle Discount:</span>
                  <span>-₹{lastReceipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#565e74]">
                <span>CGST/SGST (5%):</span>
                <span>₹{lastReceipt.gst}</span>
              </div>
              <div className="flex justify-between text-[#0b1c30] font-bold text-[14px]">
                <span>Total Paid ({lastReceipt.paymentMethod}):</span>
                <span className="text-[#0037b0]">₹{lastReceipt.total}</span>
              </div>
            </div>

            <div className="bg-[#e5eeff] p-2 rounded-lg text-center text-[11px] text-[#004f35] font-semibold">
              ✓ Stock decremented in MongoDB Atlas database.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onShowToast(`Print command sent to receipt thermal printer.`);
                  setShowReceiptModal(false);
                }}
                className="py-2 bg-[#eff4ff] text-[#0037b0] border border-[#dae2fd] rounded-lg text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-2 bg-[#0037b0] text-white rounded-lg text-[12px] font-bold cursor-pointer"
              >
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
