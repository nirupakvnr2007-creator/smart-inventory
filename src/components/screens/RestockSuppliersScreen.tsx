import React, { useState } from 'react';
import { ProductItem, RestockOrder, RoleType } from '../../types';

interface RestockSuppliersScreenProps {
  products: ProductItem[];
  orders: RestockOrder[];
  activeRole: RoleType;
  onApprovePO: (order: RestockOrder) => void;
  onConfirmInwardStock: (poNumber: string, sku: string, units: number) => void;
  onSelectProductDetail: (sku: string) => void;
  onShowToast: (msg: string) => void;
}

export const RestockSuppliersScreen: React.FC<RestockSuppliersScreenProps> = ({
  products,
  orders,
  activeRole,
  onApprovePO,
  onConfirmInwardStock,
  onSelectProductDetail,
  onShowToast
}) => {
  // Find products that are below or at threshold
  const breachedProducts = products.filter((p) => p.currentStock <= p.minThreshold);
  const lowProducts = products.filter(
    (p) => p.currentStock > p.minThreshold && p.currentStock <= p.minThreshold + 5
  );

  const [selectedSku, setSelectedSku] = useState<string>(
    breachedProducts[0]?.sku || products[0]?.sku || 'SKU-102'
  );

  const activeProduct =
    products.find((p) => p.sku === selectedSku) || products[0];

  const [requestedVolume, setRequestedVolume] = useState<number>(
    activeProduct?.suggestedRestock || 50
  );

  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQty, setTempQty] = useState<string>(requestedVolume.toString());
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showToastBanner, setShowToastBanner] = useState(false);

  // Email body state
  const [emailBody, setEmailBody] = useState<string>(
    `Dear ${activeProduct?.supplierName || 'Supplier'} Fulfillment Team,\n\nPlease generate an expedited Purchase Order dispatch for ${activeProduct?.sku}:\n• Item Description: ${activeProduct?.name}\n• Requested Volume: ${requestedVolume} units\n• Target Inward Dock: Mepco Central Warehouse - Bay 4 (Dock Inwarding)\n• Terms of Settlement: Net 30, Electronic Fund Transfer on Inward Quality Clearance\n• Tracking Note: Buffer emergency replenished under Hub Safety Rule #B-44\n\nKindly confirm the delivery estimated dispatch slot by reply.\n\nBest regards,\nAutomated Procurement System | Mepco Retail Hub`
  );

  const canApprove = activeRole === 'Owner' || activeRole === 'Manager';

  const handleSwitchShowcase = (sku: string) => {
    setSelectedSku(sku);
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      const vol = prod.suggestedRestock || 30;
      setRequestedVolume(vol);
      setTempQty(vol.toString());
      setEmailBody(
        `Dear ${prod.supplierName} Fulfillment Team,\n\nPlease generate an expedited Purchase Order dispatch for ${prod.sku}:\n• Item Description: ${prod.name}\n• Requested Volume: ${vol} units\n• Target Inward Dock: Mepco Central Warehouse - Bay 4 (Dock Inwarding)\n• Terms of Settlement: Net 30, Electronic Fund Transfer on Inward Quality Clearance\n• Tracking Note: Buffer emergency replenished under Hub Safety Rule #B-44\n\nKindly confirm the delivery estimated dispatch slot by reply.\n\nBest regards,\nAutomated Procurement System | Mepco Retail Hub`
      );
      setIsSent(false);
    }
  };

  const handleApprovePO = () => {
    if (!canApprove) {
      onShowToast(`RBAC Alert: ${activeRole}s cannot approve restocking requests.`);
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setShowToastBanner(true);

      const newOrder: RestockOrder = {
        id: `ro-${Date.now()}`,
        poNumber: `PO-${Math.floor(9043 + Math.random() * 50)}`,
        sku: activeProduct.sku,
        productName: activeProduct.name,
        supplier: activeProduct.supplierName,
        supplierEmail: activeProduct.supplierEmail,
        units: requestedVolume,
        status: 'PO Email Sent',
        timestamp: 'Just now',
        statusNote: `Transmitted to ${activeProduct.supplierEmail}`,
        emailContent: emailBody
      };

      onApprovePO(newOrder);
      onShowToast(`Supplier PO Dispatched to ${activeProduct.supplierName}! Inward log created.`);
    }, 900);
  };

  const handleSaveQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(tempQty, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setRequestedVolume(parsed);
      setEmailBody((prev) =>
        prev.replace(
          /Requested Volume: \d+ units/,
          `Requested Volume: ${parsed} units`
        )
      );
      setIsEditingQuantity(false);
      onShowToast(`Restock volume updated to ${parsed} units.`);
    }
  };

  const handleReject = () => {
    if (!canApprove) {
      onShowToast(`RBAC Alert: ${activeRole}s cannot reject or dismiss restocking requests.`);
      return;
    }
    if (
      window.confirm(
        `Confirm dismissal of auto-generated Purchase Order for ${activeProduct.sku}? This will snooze alerts for 12 hours.`
      )
    ) {
      onShowToast(`PO Trigger for ${activeProduct.sku} dismissed and logged in Hub Audit stream.`);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Active Threshold Alerts Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#ffdad6] p-4 shadow-xs border border-[#ffb4ab]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ba1a1a] flex items-center justify-center shrink-0 text-white shadow-xs">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
                <span className="font-headline font-semibold text-[17px] text-[#93000a]">
                  {breachedProducts.length} SKUs Breached Safety Minimum
                </span>
              </div>
              <p className="text-[12px] text-[#93000a]/90 mt-0.5">
                Automated safety buffer triggered. Instant purchase dispatch ready.
              </p>
            </div>
          </div>
          {breachedProducts.length > 0 && (
            <button
              onClick={() => {
                const nextIndex =
                  (breachedProducts.findIndex((p) => p.sku === activeProduct.sku) + 1) %
                  breachedProducts.length;
                handleSwitchShowcase(breachedProducts[nextIndex].sku);
              }}
              className="shrink-0 px-3 py-1 rounded-full bg-white text-[#ba1a1a] text-[12px] font-bold shadow-xs hover:bg-[#fff0ee] transition-colors border border-[#ffb4ab] cursor-pointer"
            >
              Cycle ({breachedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* RBAC Notice if Helper or Cashier */}
      {!canApprove && (
        <div className="p-2.5 bg-[#eff4ff] border border-[#dae2fd] rounded-xl flex items-center gap-2 text-[12px] text-[#434655]">
          <span className="material-symbols-outlined text-[#0037b0] text-[18px]">info</span>
          <span>
            <strong>{activeRole} Notice:</strong> Restocking request approval &amp; supplier email dispatch requires Manager or Owner clearance.
          </span>
        </div>
      )}

      {/* Primary Replenishment Request Showcase Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-4">
        {/* Header with SKU & Status Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline font-semibold text-[15px] text-[#0b1c30] truncate">
                  {activeProduct.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold shrink-0">
                  Critical Stock
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#565e74] mt-0.5">
                <span className="font-semibold">{activeProduct.sku}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">category</span>
                  {activeProduct.category}
                </span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#3f465c] text-[11px] font-bold shrink-0 flex items-center gap-1 border border-[#c4c5d7]/40">
            <span className="material-symbols-outlined text-[14px]">bolt</span> Automated PO
          </span>
        </div>

        {/* Stock Metrics Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-[#eff4ff] border border-[#dae2fd] rounded-lg">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#565e74]">Current Stock</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline font-bold text-[24px] text-[#ba1a1a] tabular-nums">
                {activeProduct.currentStock}
              </span>
              <span className="text-[11px] text-[#565e74]">units</span>
            </div>
            <div className="w-full bg-[#d3e4fe] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#ba1a1a] h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((activeProduct.currentStock / activeProduct.minThreshold) * 100)
                  )}%`
                }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[12px] text-[#565e74]">Min Threshold</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline font-bold text-[24px] text-[#0b1c30] tabular-nums">
                {activeProduct.minThreshold}
              </span>
              <span className="text-[11px] text-[#565e74]">units</span>
            </div>
            <span className="text-[11px] text-[#434655] mt-1.5 flex items-center gap-0.5 font-medium">
              <span className="material-symbols-outlined text-[12px] text-[#747686]">
                verified_user
              </span>{' '}
              Safety Level
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[12px] text-[#0037b0] font-semibold">Suggested Restock</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline font-bold text-[24px] text-[#0037b0] tabular-nums">
                +{requestedVolume}
              </span>
              <span className="text-[11px] text-[#565e74]">units</span>
            </div>
            <span className="text-[11px] text-[#004f35] mt-1.5 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>{' '}
              {activeProduct.runDays} Days Run
            </span>
          </div>
        </div>

        {/* Supplier Identity Details Block */}
        <div className="bg-[#e5eeff] rounded-lg p-3 border border-[#dae2fd] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0037b0]">store</span>
              <span className="text-[13px] text-[#0b1c30] font-bold">
                {activeProduct.supplierName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                Primary Vendor
              </span>
            </div>
            <span className="text-[11px] text-[#565e74] font-medium">
              ID: {activeProduct.supplierId}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[12px] text-[#434655]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#747686]">mail</span>
                <span>{activeProduct.supplierEmail}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-semibold text-[#565e74] border border-[#c4c5d7]/50">
                Verified SMTP
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#434655]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#747686]">
                  phone_in_talk
                </span>
                <span>{activeProduct.supplierPhone}</span>
              </span>
              <span className="text-[11px] text-[#004f35] font-semibold">
                Direct Dispatch Line
              </span>
            </div>
          </div>
        </div>

        {/* Restock Email Draft Interactive Module */}
        <div className="bg-[#f8f9ff] rounded-xl p-3.5 border border-[#dae2fd] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#dce1ff] flex items-center justify-center text-[#001551]">
                <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-[14px] text-[#0b1c30] leading-tight">
                  Automated Restock Email Draft
                </h4>
                <span className="text-[11px] text-[#565e74]">
                  AI Synthesis from Threshold Breach Rule
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#d3e4fe] text-[#0b1c30] text-[11px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-[#004f35]">
                auto_awesome
              </span>{' '}
              Smart Template
            </span>
          </div>

          {/* Email Headers Fieldset */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-[#0b1c30] border border-[#dae2fd] shadow-2xs">
              <span className="text-[12px] font-semibold text-[#565e74] w-14 shrink-0">To:</span>
              <span className="text-[12px] text-[#0b1c30] font-medium truncate">
                {activeProduct.supplierEmail}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-[#0b1c30] border border-[#dae2fd] shadow-2xs">
              <span className="text-[12px] font-semibold text-[#565e74] w-14 shrink-0">CC:</span>
              <span className="text-[12px] text-[#565e74] truncate">
                storemanager@retailhub.mepco.ac.in
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-[#0b1c30] border border-[#dae2fd] shadow-2xs">
              <span className="text-[12px] font-semibold text-[#565e74] w-14 shrink-0">
                Subject:
              </span>
              <span className="text-[12px] text-[#0b1c30] font-bold truncate">
                Urgent PO Restock Request: {activeProduct.sku} ({requestedVolume} Units) - GreenHarvest
              </span>
            </div>
          </div>

          {/* Interactive Editable Body */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[12px] text-[#565e74]">
              <span className="font-semibold">Draft Message Content</span>
              <span className="text-[#004f35] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tune</span> Live Editable
              </span>
            </div>
            <textarea
              className="w-full bg-white rounded-lg p-3 text-[12px] text-[#0b1c30] leading-relaxed resize-none focus:outline-none border border-[#dae2fd] focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 transition-all font-sans"
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
          </div>

          {/* Action Button Group */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleApprovePO}
              disabled={isSending || isSent || !canApprove}
              className={`w-full min-h-[44px] rounded-lg text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 ${
                isSent
                  ? 'bg-[#004f35]'
                  : 'bg-[#0037b0] hover:bg-[#1d4ed8]'
              }`}
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    sync
                  </span>
                  <span>Transmitting Purchase Order...</span>
                </>
              ) : isSent ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Sent to {activeProduct.supplierEmail}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Approve &amp; Send Supplier Email</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTempQty(requestedVolume.toString());
                  setIsEditingQuantity(true);
                }}
                className="min-h-[40px] rounded-lg bg-white border border-[#dae2fd] text-[#0b1c30] font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">
                  edit_note
                </span>
                <span>Edit Quantity</span>
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="min-h-[40px] rounded-lg bg-white border border-[#ffdad6] text-[#ba1a1a] font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Reject Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast Banner on Approval */}
      {showToastBanner && (
        <div className="rounded-xl bg-[#004f35] text-white p-3 shadow-md flex items-center justify-between transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">
              check_circle
            </span>
            <span className="text-[13px] font-medium">
              Supplier PO Dispatched to {activeProduct.supplierName}! Inward log created.
            </span>
          </div>
          <button
            onClick={() => setShowToastBanner(false)}
            className="text-white opacity-80 hover:opacity-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Additional Breached SKUs Summary Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-semibold text-[15px] text-[#0b1c30]">
            Other Low-Stock SKUs Pending Review
          </h3>
          <span className="text-[12px] text-[#565e74]">
            {products.filter((p) => p.sku !== activeProduct.sku && p.currentStock <= p.minThreshold + 5).length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {products
            .filter((p) => p.sku !== activeProduct.sku && p.currentStock <= p.minThreshold + 5)
            .map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl p-3 flex items-center justify-between shadow-xs border border-[#e5eeff] hover:border-[#b7c4ff] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline font-semibold text-[13px] text-[#0b1c30] truncate max-w-[170px]">
                      {prod.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#565e74] mt-0.5">
                      <span>{prod.sku}</span>
                      <span>•</span>
                      <span className="text-[#ba1a1a] font-bold">
                        Stock: {prod.currentStock} left (Min: {prod.minThreshold})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#3f465c] text-[11px] font-bold">
                    +{prod.suggestedRestock} Units
                  </span>
                  <button
                    onClick={() => handleSwitchShowcase(prod.sku)}
                    title="Load PO draft for this item"
                    className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#0037b0] hover:bg-[#0037b0] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Past Restocking History & Inward Reception */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0037b0]">history</span>
            <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
              Past Restocking History &amp; Inward Log
            </h3>
          </div>
          <span className="text-[12px] text-[#565e74]">MongoDB Inward Log</span>
        </div>

        {/* History Timeline / Item List */}
        <div className="space-y-2.5">
          {orders.map((ord) => {
            let statusBadge = 'bg-[#dae2fd] text-[#3f465c]';
            let icon = 'local_shipping';
            const isPendingArrival =
              ord.status === 'PO Email Sent' || ord.status === 'Pending Supplier Dispatch';

            if (ord.status === 'Delivered & Confirmed') {
              statusBadge = 'bg-[#85f8c4] text-[#002114]';
              icon = 'done_all';
            } else if (ord.status === 'PO Email Sent') {
              statusBadge = 'bg-[#dce1ff] text-[#0039b5]';
              icon = 'outgoing_mail';
            }

            return (
              <div
                key={ord.id}
                className="p-3 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#0b1c30] font-bold">
                      {ord.productName} ({ord.units} units)
                    </span>
                    <span className="text-[11px] text-[#565e74]">
                      {ord.poNumber} • {ord.sku} • {ord.supplier}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] shrink-0 flex items-center gap-1 font-bold ${statusBadge}`}
                  >
                    <span className="material-symbols-outlined text-[12px]">{icon}</span>
                    {ord.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[#004f35] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">database</span>
                    {ord.statusNote}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#565e74]">{ord.timestamp}</span>

                    {/* Stock Arrival Confirmation Hook */}
                    {isPendingArrival && canApprove && (
                      <button
                        onClick={() => {
                          onConfirmInwardStock(ord.poNumber, ord.sku, ord.units);
                          onShowToast(
                            `Shipment for ${ord.poNumber} verified! +${ord.units} units credited to inventory.`
                          );
                        }}
                        className="px-2.5 py-1 rounded-md bg-[#004f35] text-white font-bold text-[11px] hover:bg-[#006948] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          check_circle
                        </span>
                        <span>Receive &amp; Inward</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Quantity Modal */}
      {isEditingQuantity && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm border border-[#e5eeff] space-y-3">
            <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
              Adjust Restock Units
            </h3>
            <p className="text-[12px] text-[#565e74]">
              Change requested procurement volume for {activeProduct.name} ({activeProduct.sku}).
            </p>
            <form onSubmit={handleSaveQuantity} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tempQty}
                  onChange={(e) => setTempQty(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[16px] font-bold text-[#0037b0] tabular-nums outline-none"
                  autoFocus
                />
                <span className="text-[13px] text-[#565e74] font-medium">Units</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingQuantity(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0037b0] text-white text-[12px] font-bold shadow-sm"
                >
                  Save &amp; Update Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
