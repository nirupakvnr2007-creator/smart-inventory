import React from 'react';
import { Product, SaleTransaction, RoleType } from '../../types';

interface DashboardScreenProps {
  products: Product[];
  sales: SaleTransaction[];
  userRole: RoleType;
  onNavigateToBilling?: () => void;
  onNavigateToRestock?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  sales,
  userRole,
  onNavigateToBilling,
  onNavigateToRestock
}) => {
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalItemsSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const totalStockAvailable = products.reduce((acc, p) => acc + p.currentStock, 0);
  const breachedProducts = products.filter((p) => p.currentStock <= p.minThreshold);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Title & Role Context */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
            Real-Time Store Performance
          </span>
          <h2 className="font-headline font-bold text-[18px] text-[#0b1c30]">
            Shop Sales Trends &amp; Inventory Overview
          </h2>
        </div>
        <span className="text-[11px] bg-[#eff4ff] border border-[#dae2fd] text-[#0037b0] px-2.5 py-1 rounded-full font-bold">
          {userRole} Clearance
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74] font-medium">Total Gross Sales</span>
          <div className="font-headline font-bold text-[22px] text-[#0037b0] tabular-nums mt-0.5">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#565e74] mt-1 block">
            From {sales.length} checkout sales
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74] font-medium">Units Sold</span>
          <div className="font-headline font-bold text-[22px] text-[#0b1c30] tabular-nums mt-0.5">
            {totalItemsSold}
          </div>
          <span className="text-[10px] text-[#565e74] mt-1 block">
            Billed by Cashier
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74] font-medium">Available Stock</span>
          <div className="font-headline font-bold text-[22px] text-[#004f35] tabular-nums mt-0.5">
            {totalStockAvailable}
          </div>
          <span className="text-[10px] text-[#565e74] mt-1 block">
            Across {products.length} products
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#565e74] font-medium">Stock Threshold Alerts</span>
          <div className={`font-headline font-bold text-[22px] tabular-nums mt-0.5 ${
            breachedProducts.length > 0 ? 'text-[#ba1a1a]' : 'text-[#004f35]'
          }`}>
            {breachedProducts.length}
          </div>
          <span className="text-[10px] text-[#565e74] mt-1 block">
            {breachedProducts.length > 0 ? 'Below safety threshold' : 'All stocks healthy'}
          </span>
        </div>
      </div>

      {/* Threshold Alert Banner if breached */}
      {breachedProducts.length > 0 && (
        <div className="p-3 bg-[#ffdad6] border border-[#ffb4ab] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#93000a] text-[12px] font-bold">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>
              {breachedProducts.length} product(s) dropped to or below minimum threshold!
            </span>
          </div>
          {onNavigateToRestock && (userRole === 'Manager' || userRole === 'Owner') && (
            <button
              onClick={onNavigateToRestock}
              className="px-2.5 py-1 bg-[#ba1a1a] text-white text-[11px] font-bold rounded-lg cursor-pointer"
            >
              Review Restock
            </button>
          )}
        </div>
      )}

      {/* Sales Trend Visualizer */}
      <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
            Cashier Sales Flow &amp; Trend
          </h3>
          <span className="text-[11px] text-[#565e74]">
            Synchronized with counter billing
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="py-8 text-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#dae2fd] space-y-1">
            <span className="material-symbols-outlined text-[28px] text-[#747686]">receipt_long</span>
            <p className="text-[13px] font-semibold text-[#0b1c30]">
              No sales transactions recorded yet.
            </p>
            <p className="text-[11px] text-[#565e74] max-w-sm mx-auto">
              When the Cashier bills products in the POS terminal, real sales trends and hourly turnover will appear here automatically.
            </p>
            {onNavigateToBilling && (userRole === 'Cashier' || userRole === 'Owner') && (
              <button
                onClick={onNavigateToBilling}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#0037b0] text-white text-[11px] font-bold cursor-pointer"
              >
                Go to POS Billing Counter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-32 flex items-end gap-2 pt-2 px-2 border-b border-[#eff4ff]">
              {sales.slice(-7).map((s, idx) => {
                const maxTotal = Math.max(...sales.map((item) => item.total), 1);
                const heightPct = Math.max(15, Math.round((s.total / maxTotal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="text-[10px] font-bold font-mono text-[#0037b0]">
                      ₹{s.total}
                    </div>
                    <div
                      className="w-full bg-[#0037b0] rounded-t-md transition-all group-hover:bg-[#1d4ed8]"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-[9px] text-[#565e74] truncate max-w-full">
                      {s.timestamp.split(',')[1] || s.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-[#565e74] pt-1">
              <span>Past sales transactions billed at counter</span>
              <span className="font-bold text-[#0037b0]">Gross: ₹{totalRevenue}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stock Health Monitor Table */}
      <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
            Current Shelf Stock &amp; Safety Thresholds
          </h3>
          <span className="text-[11px] text-[#565e74]">
            {products.length} registered products
          </span>
        </div>

        {products.length === 0 ? (
          <div className="py-6 text-center text-[#565e74] text-[12px] bg-[#f8f9ff] rounded-xl border border-dashed border-[#dae2fd]">
            No products in database yet. {userRole === 'Manager' || userRole === 'Owner' ? 'Add products in the Products tab.' : 'Manager will register products.'}
          </div>
        ) : (
          <div className="border border-[#dae2fd] rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#eff4ff] text-[#565e74] font-bold border-b border-[#dae2fd]">
                <tr>
                  <th className="p-2.5">Product &amp; Brand</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Available Stock</th>
                  <th className="p-2.5">Min Threshold</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {products.map((p) => {
                  const isBreached = p.currentStock <= p.minThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-[#f8f9ff]">
                      <td className="p-2.5">
                        <span className="font-bold text-[#0b1c30] block">{p.name}</span>
                        <span className="text-[10px] text-[#565e74]">{p.brand}</span>
                      </td>
                      <td className="p-2.5 font-bold text-[#0037b0]">₹{p.price}</td>
                      <td className="p-2.5 font-bold tabular-nums">
                        <span className={isBreached ? 'text-[#ba1a1a]' : 'text-[#004f35]'}>
                          {p.currentStock} units
                        </span>
                      </td>
                      <td className="p-2.5 text-[#565e74] tabular-nums font-semibold">
                        {p.minThreshold} units
                      </td>
                      <td className="p-2.5">
                        {isBreached ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                            Restock Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                            Stock Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Cashier Transactions List */}
      {sales.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#e5eeff] shadow-xs space-y-3">
          <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
            Recent Counter Billing Transactions
          </h3>
          <div className="divide-y divide-[#eff4ff]">
            {sales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[12px] text-[#0037b0]">
                      {sale.id}
                    </span>
                    <span className="text-[11px] text-[#565e74]">
                      {sale.timestamp} • Cashier: {sale.cashierName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#0b1c30] mt-0.5 block truncate max-w-xs">
                    {sale.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline font-bold text-[14px] text-[#004f35]">
                    ₹{sale.total}
                  </span>
                  <span className="text-[10px] text-[#565e74] block">
                    Paid via {sale.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
