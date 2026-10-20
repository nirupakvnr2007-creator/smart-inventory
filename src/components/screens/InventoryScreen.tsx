import React, { useState } from 'react';
import { ProductItem, RoleType } from '../../types';

interface InventoryScreenProps {
  products: ProductItem[];
  activeRole: RoleType;
  onSelectProduct: (sku: string) => void;
  onUpdateStock: (sku: string, delta: number) => void;
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onRemoveProduct: (sku: string) => void;
  onShowToast: (msg: string) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products,
  activeRole,
  onSelectProduct,
  onUpdateStock,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showQrPrintModal, setShowQrPrintModal] = useState<ProductItem | null>(null);

  // New product form state
  const [newSku, setNewSku] = useState('SKU-501');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Beverages & Dairy');
  const [newPrice, setNewPrice] = useState('180');
  const [newCostPrice, setNewCostPrice] = useState('120');
  const [newStock, setNewStock] = useState('25');
  const [newMin, setNewMin] = useState('10');
  const [newSupplierName, setNewSupplierName] = useState('GreenFarms Logistics');
  const [newSupplierEmail, setNewSupplierEmail] = useState('orders@greenfarms.in');
  const [newSupplierPhone, setNewSupplierPhone] = useState('+91 98402 11223');

  const categories = [
    'All',
    'Beverages & Dairy',
    'Pantry & Sweeteners',
    'Grains & Cereals',
    'Oils & Sauces'
  ];

  const canManageCatalog = activeRole === 'Owner' || activeRole === 'Manager';

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) {
      onShowToast(`RBAC Restriction: ${activeRole} cannot add new catalog SKUs.`);
      return;
    }

    const newItem: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: newSku.toUpperCase().trim(),
      name: newName.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 100,
      costPrice: parseFloat(newCostPrice) || 70,
      currentStock: parseInt(newStock, 10) || 20,
      minThreshold: parseInt(newMin, 10) || 10,
      suggestedRestock: (parseInt(newMin, 10) || 10) * 3,
      runDays: 14,
      batchNumber: `#M-2024-B01 (Mfg: Oct 2024)`,
      mfgDate: 'Oct 2024',
      fssai: '10020042001928',
      imageUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      supplierName: newSupplierName,
      supplierEmail: newSupplierEmail,
      supplierPhone: newSupplierPhone,
      supplierId: `VEND-${Math.floor(100 + Math.random() * 900)}`,
      status:
        parseInt(newStock, 10) <= parseInt(newMin, 10)
          ? 'critical'
          : parseInt(newStock, 10) <= parseInt(newMin, 10) + 5
          ? 'low'
          : 'healthy',
      unit: 'units',
      rating: 5.0,
      reviewCount: 0,
      salesLast30Days: 0
    };

    onAddProduct(newItem);
    setShowAddModal(false);
    setNewName('');
    onShowToast(`Product ${newSku} (${newName}) registered with unique packaging QR!`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!canManageCatalog) {
      onShowToast(`RBAC Restriction: ${activeRole} cannot modify catalog records.`);
      return;
    }

    onUpdateProduct(editingProduct);
    setShowEditModal(false);
    setEditingProduct(null);
    onShowToast(`Product ${editingProduct.sku} updated successfully.`);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
            Centralized Inventory
          </span>
          <h2 className="font-headline font-semibold text-[18px] text-[#0b1c30]">
            Catalog &amp; Packaging QR Codes ({products.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Add SKU button */}
          <button
            onClick={() => {
              if (!canManageCatalog) {
                onShowToast(
                  `RBAC Alert: ${activeRole}s cannot modify catalog records. Switch to Manager or Owner in top bar.`
                );
              } else {
                setShowAddModal(true);
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-[12px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Role notice banner if Helper */}
      {activeRole === 'Helper' && (
        <div className="p-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-xl flex items-center gap-2 text-[12px] text-[#434655]">
          <span className="material-symbols-outlined text-[#0037b0] text-[18px]">info</span>
          <span>
            <strong>Helper View-Only:</strong> You can review live stock counts and sales trends. Catalog modifications require Manager clearance.
          </span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col space-y-2">
        <div className="w-full bg-white border border-[#dae2fd] rounded-xl p-2.5 flex items-center gap-2 focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all shadow-xs">
          <span className="material-symbols-outlined text-[#747686] text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none placeholder:text-[#747686]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#747686] hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-[#0037b0] text-white border-[#0037b0] shadow-xs'
                  : 'bg-white text-[#565e74] border-[#dae2fd] hover:bg-[#eff4ff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredProducts.map((prod) => {
          const isCritical = prod.currentStock <= prod.minThreshold;
          const isLow =
            !isCritical && prod.currentStock <= prod.minThreshold + 5;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-xl p-3.5 shadow-xs border border-[#e5eeff] flex flex-col justify-between space-y-3 hover:border-[#b7c4ff] transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  onClick={() => onSelectProduct(prod.sku)}
                  className="w-16 h-16 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group"
                  title="View customer feedback & QR detail"
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#565e74]">
                      {prod.sku}
                    </span>
                    <span className="font-headline font-bold text-[16px] text-[#0037b0] tabular-nums">
                      ₹{prod.price}
                    </span>
                  </div>
                  <h4
                    onClick={() => onSelectProduct(prod.sku)}
                    className="font-headline font-semibold text-[14px] text-[#0b1c30] truncate hover:text-[#0037b0] cursor-pointer"
                  >
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
                    <span>{prod.category}</span>
                    <span>•</span>
                    <span className="text-[#004f35] font-semibold">
                      {prod.rating || 4.8}★ ({prod.reviewCount || 100}+ reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {isCritical ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                        Critical ({prod.currentStock} left)
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#3f465c] text-[10px] font-bold">
                        Low Stock ({prod.currentStock})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                        Stock: {prod.currentStock} units
                      </span>
                    )}
                    <span className="text-[11px] text-[#565e74]">
                      Threshold: <strong>{prod.minThreshold}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectProduct(prod.sku)}
                    className="text-[12px] text-[#0037b0] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">rate_review</span>
                    <span>Feedback</span>
                  </button>

                  {/* Print QR Packaging Tag */}
                  <button
                    onClick={() => setShowQrPrintModal(prod)}
                    className="text-[12px] text-[#004f35] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    title="Print packaging QR label"
                  >
                    <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                    <span>QR Label</span>
                  </button>

                  {canManageCatalog && (
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setShowEditModal(true);
                      }}
                      className="text-[12px] text-[#565e74] hover:text-[#0b1c30] flex items-center gap-0.5 cursor-pointer"
                      title="Edit details"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  )}
                </div>

                {/* Stock Adjuster (Disabled if Helper) */}
                <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2 py-1 rounded-lg border border-[#dae2fd]">
                  <button
                    onClick={() => {
                      if (!canManageCatalog && activeRole !== 'Cashier') {
                        onShowToast('Helpers have view-only access to stock counts.');
                      } else {
                        onUpdateStock(prod.sku, -1);
                      }
                    }}
                    disabled={prod.currentStock <= 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors disabled:opacity-30 cursor-pointer"
                    title="Decrease stock"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="text-[12px] font-bold text-[#0b1c30] w-6 text-center tabular-nums">
                    {prod.currentStock}
                  </span>
                  <button
                    onClick={() => {
                      if (!canManageCatalog && activeRole !== 'Cashier') {
                        onShowToast('Helpers have view-only access to stock counts.');
                      } else {
                        onUpdateStock(prod.sku, 1);
                      }
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#004f35] hover:bg-[#85f8c4] transition-colors cursor-pointer"
                    title="Increase stock"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Packaging QR Tag Modal */}
      {showQrPrintModal && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-[#e5eeff] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0037b0] text-[20px]">
                  qr_code_2
                </span>
                <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
                  Packaging QR Tag
                </h3>
              </div>
              <button
                onClick={() => setShowQrPrintModal(null)}
                className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#565e74]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Packaging Label Preview */}
            <div className="p-4 bg-[#f8f9ff] border-2 border-dashed border-[#0037b0] rounded-xl flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-[#565e74] uppercase">
                GreenHarvest Retail Hub
              </span>
              <h4 className="font-headline font-bold text-[15px] text-[#0b1c30]">
                {showQrPrintModal.name}
              </h4>
              <span className="text-[11px] text-[#0037b0] font-mono font-bold">
                {showQrPrintModal.sku} • MRP: ₹{showQrPrintModal.price}
              </span>

              {/* High-Contrast SVG QR Pattern */}
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-xs border border-[#dae2fd] flex flex-col items-center justify-center relative my-1">
                <svg
                  className="w-full h-full text-[#0b1c30]"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z" />
                  <path d="M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z" />
                  <path d="M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z" />
                  <rect x="45" y="15" width="8" height="8" />
                  <rect x="45" y="30" width="8" height="8" />
                  <rect x="15" y="45" width="8" height="8" />
                  <rect x="30" y="45" width="8" height="8" />
                  <rect x="55" y="55" width="12" height="12" />
                  <rect x="75" y="55" width="10" height="10" />
                  <rect x="55" y="75" width="10" height="10" />
                  <rect x="75" y="75" width="12" height="12" />
                </svg>
                <span className="text-[9px] font-mono text-[#565e74] mt-1">
                  #SCAN-9842-MEPCO
                </span>
              </div>

              <div className="text-[10px] text-[#565e74] space-y-0.5">
                <p>Batch: {showQrPrintModal.batchNumber || '#M-2024-B01'}</p>
                <p>FSSAI: {showQrPrintModal.fssai || '10020042001928'}</p>
                <p className="text-[#004f35] font-semibold mt-1">
                  Scan with smartphone to verify batch &amp; submit feedback
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onShowToast(`Packaging QR label sent to barcode label printer.`);
                  setShowQrPrintModal(null);
                }}
                className="py-2 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Packaging Label</span>
              </button>
              <button
                onClick={() => {
                  setShowQrPrintModal(null);
                  onSelectProduct(showQrPrintModal.sku);
                }}
                className="py-2 rounded-lg bg-[#eff4ff] text-[#0037b0] border border-[#dae2fd] text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Test Feedback Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-md border border-[#e5eeff] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#dce1ff] text-[#0037b0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
                    Register New Product SKU
                  </h3>
                  <span className="text-[11px] text-[#565e74]">
                    Manager Clearance • Generates Packaging QR Tag
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#434655] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Product Code (SKU)</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  >
                    <option value="Beverages & Dairy">Beverages &amp; Dairy</option>
                    <option value="Pantry & Sweeteners">Pantry &amp; Sweeteners</option>
                    <option value="Grains & Cereals">Grains &amp; Cereals</option>
                    <option value="Oils & Sauces">Oils &amp; Sauces</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chia Seeds 250g"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Selling (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Initial Units</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#ba1a1a]">Threshold</label>
                  <input
                    type="number"
                    required
                    value={newMin}
                    onChange={(e) => setNewMin(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums font-bold text-[#ba1a1a]"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Supplier Information
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Supplier / Vendor Name"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Supplier Email (for Restock POs)"
                      value={newSupplierEmail}
                      onChange={(e) => setNewSupplierEmail(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[12px] outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Supplier Phone"
                      value={newSupplierPhone}
                      onChange={(e) => setNewSupplierPhone(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[12px] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold shadow-xs hover:bg-[#1d4ed8] cursor-pointer"
                >
                  Register &amp; Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-md border border-[#e5eeff] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
                Edit {editingProduct.name} ({editingProduct.sku})
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#434655] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Selling Price</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Current Stock</label>
                  <input
                    type="number"
                    value={editingProduct.currentStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        currentStock: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#ba1a1a]">Threshold</label>
                  <input
                    type="number"
                    value={editingProduct.minThreshold}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minThreshold: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none tabular-nums font-bold text-[#ba1a1a]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Supplier Name &amp; Contact
                </label>
                <input
                  type="text"
                  value={editingProduct.supplierName}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      supplierName: e.target.value
                    })
                  }
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to remove ${editingProduct.sku} from the catalog?`
                      )
                    ) {
                      onRemoveProduct(editingProduct.sku);
                      setShowEditModal(false);
                      onShowToast(`Product ${editingProduct.sku} removed.`);
                    }
                  }}
                  className="text-[12px] text-[#ba1a1a] font-bold hover:underline cursor-pointer"
                >
                  Delete / Sunset SKU
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
