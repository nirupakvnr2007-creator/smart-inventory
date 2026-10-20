import React from 'react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRestock: () => void;
  onNavigateToDetail: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToRestock,
  onNavigateToDetail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dce1ff] text-[#0037b0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">Audit & Alerts</h3>
              <span className="text-[12px] text-[#565e74]">3 active operational notices</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9ff] hover:bg-[#eff4ff] flex items-center justify-center text-[#434655]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div
            onClick={() => {
              onNavigateToRestock();
              onClose();
            }}
            className="p-3 bg-[#ffdad6] rounded-xl border border-[#ffb4ab] cursor-pointer hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-[#93000a] font-semibold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Stock Breach Alert</span>
            </div>
            <p className="text-[12px] text-[#0b1c30] mt-1 font-medium">
              SKU-102 (Almond Milk 1L) is down to 4 units (Threshold: 15). Automated PO generated.
            </p>
            <span className="text-[11px] text-[#565e74] block mt-1">2 mins ago • Tap to approve restock</span>
          </div>

          <div
            onClick={() => {
              onNavigateToDetail();
              onClose();
            }}
            className="p-3 bg-[#eff4ff] rounded-xl border border-[#dae2fd] cursor-pointer hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-[#0037b0] font-semibold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>New QR Customer Review</span>
            </div>
            <p className="text-[12px] text-[#0b1c30] mt-1 font-medium">
              Verified review posted for SKU-103 Natural Honey 250g (5.0 ★ from Pooja Sharma).
            </p>
            <span className="text-[11px] text-[#565e74] block mt-1">2 hours ago • Tap to view product detail</span>
          </div>

          <div className="p-3 bg-[#e5eeff] rounded-xl border border-[#dae2fd]">
            <div className="flex items-center gap-2 text-[#004f35] font-semibold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Atlas Shard Sync</span>
            </div>
            <p className="text-[12px] text-[#0b1c30] mt-1">
              Multi-tenant shard Mepco-Retail-Node-01 healthy. 12ms latency, TLS 1.3 active.
            </p>
            <span className="text-[11px] text-[#565e74] block mt-1">Continuous live prober</span>
          </div>
        </div>

        <div className="p-4 border-t border-[#e5eeff] bg-[#f8f9ff]">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white border border-[#c4c5d7] rounded-lg text-[13px] font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
