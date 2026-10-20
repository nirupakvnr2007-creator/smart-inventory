import React, { useState } from 'react';
import { ProductItem, RestockRequest, RoleType, ShopProfile } from '../../types';
import { QRCodeSVG } from '../../utils/qrGenerator';

interface ManagerProductsScreenProps {
  products: ProductItem[];
  restockRequests: RestockRequest[];
  currentShop: ShopProfile;
  activeRole: RoleType;
  onAddProduct: (product: ProductItem) => void;
  onRemoveProduct: (productId: string) => void;
  onApproveRestock: (request: RestockRequest) => void;
  onShowFeedbackPage: (product: ProductItem) => void;
  onShowToast: (msg: string) => void;
}

export const ManagerProductsScreen: React.FC<ManagerProductsScreenProps> = ({
  products,
  restockRequests,
  currentShop,
  activeRole,
  onAddProduct,
  onRemoveProduct,
  onApproveRestock,
  onShowFeedbackPage,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'restock'>('catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState<ProductItem | null>(null);

  // Product Add Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [price, setPrice] = useState('');
  const [availableStock, setAvailableStock] = useState('');
  const [minThreshold, setMinThreshold] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');

  const isManagerOrOwner = activeRole === 'Manager' || activeRole === 'Owner';
  const pendingRequests = restockRequests.filter((r) => r.status === 'Pending');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !price || !availableStock || !minThreshold || !supplierName.trim() || !supplierEmail.trim()) {
      onShowToast('Please fill in all required fields (Product Name, Brand, Price, Stock, Threshold, Supplier Info).');
      return;
    }

    const skuCode = `SKU-${Math.floor(100 + Math.random() * 900)}`;
    const qrToken = `QR-FEEDBACK-${skuCode}-${Date.now().toString(36).toUpperCase()}`;

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: skuCode,
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      price: parseFloat(price) || 0,
      availableStock: parseInt(availableStock, 10) || 0,
      minThreshold: parseInt(minThreshold, 10) || 0,
      supplierName: supplierName.trim(),
      supplierEmail: supplierEmail.trim(),
      supplierPhone: supplierPhone.trim(),
      qrCode: qrToken,
      createdAt: new Date().toISOString()
    };

    onAddProduct(newProduct);
    setShowAddModal(false);
    setName('');
    setBrand('');
    setPrice('');
    setAvailableStock('');
    setMinThreshold('');
    setSupplierName('');
    setSupplierEmail('');
    setSupplierPhone('');
    onShowToast(`Product "${newProduct.name}" added and QR code generated!`);
  };

  const handleRemove = (product: ProductItem) => {
    if (!isManagerOrOwner) {
      onShowToast('Only Manager or Owner can remove products.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove "${product.name}" (${product.brand})? This will update the database.`)) {
      onRemoveProduct(product.id);
      onShowToast(`Product "${product.name}" removed from database.`);
    }
  };

  const handleApprove = (request: RestockRequest) => {
    onApproveRestock(request);

    // Open supplier email page without a draft for requesting more stock in the quantity of minimum threshold
    const subject = encodeURIComponent(`Restock Request: ${request.productName} (${request.brand})`);
    const body = encodeURIComponent(
      `Dear ${request.supplierName},\n\nPlease dispatch ${request.minThreshold} units of ${request.productName} (${request.brand}) to ${currentShop.name}.\n\nCurrent Stock: ${request.currentStock}\nSafety Threshold: ${request.minThreshold}\nRequested Replenishment: ${request.minThreshold} units\n\nThank you,\n${currentShop.name} Management`
    );

    const mailtoUrl = `mailto:${request.supplierEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    onShowToast(`Restock request approved! Mail window opened for ${request.supplierEmail}.`);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Bar with Navigation between Catalog and Restock Requests */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-headline font-bold text-[18px] text-[#0b1c30]">
            Product Catalog &amp; Supplier Restock
          </h2>
          <p className="text-[12px] text-[#565e74]">
            Manage products, generate packaging QR feedback codes, and handle threshold restocking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-[#eff4ff] p-1 rounded-lg border border-[#dae2fd] flex items-center">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold cursor-pointer transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('restock')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold cursor-pointer transition-colors relative flex items-center gap-1 ${
                activeTab === 'restock'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              <span>Restock Requests</span>
              {pendingRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              )}
            </button>
          </div>

          {/* Add Product Button (Manager/Owner only) */}
          {isManagerOrOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Restock Notification Banner if active */}
      {pendingRequests.length > 0 && activeTab === 'catalog' && (
        <div className="bg-[#ffdad6] border border-[#ffb4ab] rounded-xl p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-[#93000a]">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="text-[12px] font-bold">
              {pendingRequests.length} product(s) have fallen below their minimum threshold!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('restock')}
            className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-bold hover:bg-[#93000a] cursor-pointer"
          >
            Review Restock →
          </button>
        </div>
      )}

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl p-10 border border-[#e5eeff] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0037b0] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">shelves</span>
              </div>
              <h3 className="font-headline font-bold text-[16px] text-[#0b1c30]">
                No Products in Catalog Yet
              </h3>
              <p className="text-[12px] text-[#565e74] max-w-sm mx-auto">
                {isManagerOrOwner
                  ? 'Click "Add Product" to create your first item with supplier details, minimum threshold, and packaging QR code.'
                  : 'The Manager has not added any products yet.'}
              </p>
              {isManagerOrOwner && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-[12px] font-bold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add First Product</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((product) => {
                const isBelowThreshold = product.availableStock <= product.minThreshold;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-3 flex flex-col justify-between hover:border-[#b7c4ff] transition-all"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-[#565e74] uppercase font-mono">
                            {product.sku}
                          </span>
                          <h4 className="font-headline font-bold text-[15px] text-[#0b1c30] truncate">
                            {product.name}
                          </h4>
                          <span className="text-[12px] text-[#565e74]">
                            Brand: <strong>{product.brand}</strong> • {product.category}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-bold text-[18px] text-[#0037b0] tabular-nums block">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>

                      {/* Stock & Threshold Metrics */}
                      <div className="mt-2.5 p-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-lg grid grid-cols-2 gap-2 text-[12px]">
                        <div>
                          <span className="text-[#565e74] text-[11px] block">Available Stock</span>
                          <span
                            className={`font-headline font-bold text-[16px] tabular-nums ${
                              isBelowThreshold ? 'text-[#ba1a1a]' : 'text-[#004f35]'
                            }`}
                          >
                            {product.availableStock} units
                          </span>
                        </div>
                        <div>
                          <span className="text-[#565e74] text-[11px] block">Min Threshold</span>
                          <span className="font-headline font-bold text-[16px] text-[#0b1c30] tabular-nums">
                            {product.minThreshold} units
                          </span>
                        </div>
                      </div>

                      {isBelowThreshold && (
                        <div className="mt-1.5 text-[11px] font-bold text-[#ba1a1a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span>Breached minimum threshold! Restock request active.</span>
                        </div>
                      )}

                      {/* Supplier Information */}
                      <div className="mt-2 text-[11px] text-[#565e74] space-y-0.5 border-t border-[#eff4ff] pt-2">
                        <p>
                          Supplier: <strong>{product.supplierName}</strong>
                        </p>
                        <p>
                          Email: {product.supplierEmail} {product.supplierPhone ? `• ${product.supplierPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions: QR Code & Remove */}
                    <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQrProduct(product)}
                          className="px-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce1ff] text-[#0037b0] rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                          <span>View Product QR</span>
                        </button>
                        <button
                          onClick={() => onShowFeedbackPage(product)}
                          className="px-2 py-1 text-[#565e74] hover:text-[#0b1c30] text-[11px] font-semibold cursor-pointer"
                        >
                          Feedback Form
                        </button>
                      </div>

                      {isManagerOrOwner && (
                        <button
                          onClick={() => handleRemove(product)}
                          className="text-[#ba1a1a] hover:text-[#93000a] text-[11px] font-bold p-1 cursor-pointer flex items-center gap-0.5"
                          title="Remove product from catalog"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESTOCK REQUESTS QUEUE */}
      {activeTab === 'restock' && (
        <div className="space-y-3">
          {restockRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-[#e5eeff] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#004f35]">check_circle</span>
              <h3 className="font-headline font-bold text-[16px] text-[#0b1c30]">
                All Products Above Minimum Threshold
              </h3>
              <p className="text-[12px] text-[#565e74]">
                When product stock drops below the defined minimum threshold, automatic restocking requests appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {restockRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-[15px] text-[#0b1c30]">
                        {req.productName} ({req.brand})
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-[#85f8c4] text-[#002114]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#565e74]">
                      Current Stock: <strong className="text-[#ba1a1a]">{req.currentStock}</strong> • Minimum Threshold: <strong>{req.minThreshold}</strong> • Requested Replenishment: <strong className="text-[#0037b0]">{req.minThreshold} units</strong>
                    </p>
                    <p className="text-[11px] text-[#565e74]">
                      Supplier: {req.supplierName} ({req.supplierEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req)}
                      className="px-3.5 py-2 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                      <span>Approve &amp; Open Mail</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product QR Code Modal */}
      {selectedQrProduct && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-[#e5eeff] space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline font-bold text-[15px] text-[#0b1c30]">
                Product Feedback QR Code
              </h3>
              <button
                onClick={() => setSelectedQrProduct(null)}
                className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#565e74] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3 bg-[#f8f9ff] rounded-xl border border-[#dae2fd]">
              <QRCodeSVG value={selectedQrProduct.qrCode} size={150} />
              <div className="space-y-0.5">
                <h4 className="font-headline font-bold text-[14px] text-[#0b1c30]">
                  {selectedQrProduct.name}
                </h4>
                <p className="text-[11px] text-[#565e74]">
                  {selectedQrProduct.brand} • Price: ₹{selectedQrProduct.price}
                </p>
                <p className="font-mono text-[10px] text-[#0037b0] font-bold">
                  {selectedQrProduct.qrCode}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#565e74]">
              Print this QR code and attach it to packaging. Customers scan it with their phone to submit verified feedback.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                  setSelectedQrProduct(null);
                }}
                className="py-2 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold cursor-pointer"
              >
                Print Label
              </button>
              <button
                onClick={() => {
                  const prod = selectedQrProduct;
                  setSelectedQrProduct(null);
                  onShowFeedbackPage(prod);
                }}
                className="py-2 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#0037b0] text-[12px] font-bold cursor-pointer"
              >
                Test Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-lg border border-[#e5eeff] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0037b0] text-[22px]">add_box</span>
                <h3 className="font-headline font-bold text-[16px] text-[#0b1c30]">
                  Add New Product
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#565e74] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Honey 250g"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Apiaries"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Pantry, Beverages"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Selling Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Available Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={availableStock}
                    onChange={(e) => setAvailableStock(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#ba1a1a]">Minimum Threshold *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
              </div>

              {/* Supplier Information */}
              <div className="pt-2 border-t border-[#eff4ff] space-y-2">
                <span className="text-[12px] font-bold text-[#0037b0] block">Supplier Information</span>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0b1c30]">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GreenFarms Distribution"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[12px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0b1c30]">Supplier Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="orders@supplier.com"
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[12px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0b1c30]">Supplier Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[12px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
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
                  Save Product &amp; Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
