import React, { useState } from 'react';
import { RoleType } from '../types';

interface HeaderProps {
  currentTab: string;
  activeRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeRole,
  onRoleChange,
  onOpenNotifications,
  notificationCount
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getSectionTitle = (tab: string) => {
    switch (tab) {
      case 'auth-store':
        return 'Auth & Staff Management';
      case 'inventory':
        return 'Inventory & QR Catalog';
      case 'restock-suppliers':
        return 'Restock & Suppliers';
      case 'pos-billing':
        return 'POS Counter Billing';
      case 'forum':
        return 'Shop Discussion Forum';
      case 'analytics-ai':
        return 'Sales & AI Recommendations';
      case 'sku-detail':
        return 'Product QR Feedback & Detail';
      default:
        return 'Shop Console';
    }
  };

  const roles: { role: RoleType; label: string; name: string }[] = [
    { role: 'Owner', label: 'Owner (Full Access & Business Insights)', name: 'Dr. Maya Chen' },
    { role: 'Manager', label: 'Manager (Catalog, Stock & Restock Approval)', name: 'Ananya Kapoor' },
    { role: 'Cashier', label: 'Cashier (Billing, Sales & Receipt Archive)', name: 'Rahul Joshi' },
    { role: 'Helper', label: 'Helper (View Sales Trends, Shelves & Forum)', name: 'Siddharth Varma' }
  ];

  const currentRoleInfo = roles.find((r) => r.role === activeRole) || roles[0];

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff]">
      <div className="max-w-4xl mx-auto h-20 px-4 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          {/* Brand lockup */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0037b0] flex items-center justify-center shrink-0 shadow-sm text-white">
              <span className="material-symbols-outlined text-[20px]">
                inventory_2
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-semibold text-[16px] text-[#0b1c30] leading-none tracking-tight">
                Smart Inventory Assistant
              </span>
              <span className="text-[12px] text-[#565e74] leading-tight mt-1 font-medium">
                Mepco Retail Hub • GreenHarvest
              </span>
            </div>
          </div>

          {/* Action and Role controls */}
          <div className="flex items-center gap-2">
            {/* Interactive Role Switcher for testing RBAC */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] text-[12px] font-bold hover:bg-[#bec6e0] transition-colors cursor-pointer border border-[#c4c5d7]/50"
                title="Switch active role to test RBAC permissions"
              >
                <span className="w-2 h-2 rounded-full bg-[#0037b0]"></span>
                <span>{activeRole}</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_drop_down
                </span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-[#dae2fd] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#747686] uppercase tracking-wider">
                    Simulate Shop Role (RBAC)
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-[12px] transition-colors flex flex-col cursor-pointer ${
                        activeRole === r.role
                          ? 'bg-[#dce1ff] text-[#001551] font-bold'
                          : 'text-[#434655] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{r.role}</span>
                        {activeRole === r.role && (
                          <span className="material-symbols-outlined text-[15px] text-[#0037b0]">
                            check
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80">{r.name}</span>
                    </button>
                  ))}
                  <div className="mt-1 pt-1 border-t border-[#eff4ff] px-2 py-1 text-[10px] text-[#565e74]">
                    *Permissions dynamically adapt to the active role.
                  </div>
                </div>
              )}
            </div>

            {/* Notification bell */}
            <button
              onClick={onOpenNotifications}
              className="w-10 h-10 flex items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile Avatar with user initials */}
            <div
              className="w-8 h-8 rounded-full bg-[#0037b0] text-white flex items-center justify-center shrink-0 shadow-xs font-headline font-bold text-xs"
              title={`${currentRoleInfo.name} (${activeRole})`}
            >
              {currentRoleInfo.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
          </div>
        </div>

        {/* Sub-bar with DB connection status and active section title */}
        <div className="flex items-center justify-between pt-1 mt-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0 animate-pulse"></span>
            <span className="text-[12px] text-[#004f35] font-medium truncate max-w-[230px]">
              Connected: retail_hub_db / Cluster0
            </span>
          </div>
          <div className="text-[11px] text-[#434655] uppercase font-bold tracking-wider">
            {getSectionTitle(currentTab)}
          </div>
        </div>
      </div>
    </header>
  );
};
