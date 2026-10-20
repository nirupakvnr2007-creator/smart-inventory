import React, { useState } from 'react';
import { RoleType, StaffMember, ShopProfile } from '../types';

interface HeaderProps {
  currentTab: string;
  activeRole: RoleType;
  currentUser: StaffMember;
  currentShop: ShopProfile;
  staffList: StaffMember[];
  onRoleChange: (role: RoleType) => void;
  onOpenNotifications: () => void;
  onOpenDbSchema: () => void;
  onLogout: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeRole,
  currentUser,
  currentShop,
  staffList,
  onRoleChange,
  onOpenNotifications,
  onOpenDbSchema,
  onLogout,
  notificationCount
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getSectionTitle = (tab: string) => {
    switch (tab) {
      case 'auth-store':
        return 'Shop Management';
      case 'inventory':
        return 'Inventory & Packaging QR';
      case 'restock-suppliers':
        return 'Restock & Suppliers';
      case 'pos-billing':
        return 'POS Counter Billing';
      case 'forum':
        return 'Floor Operations Forum';
      case 'analytics-ai':
        return 'Sales & AI Recommendations';
      case 'sku-detail':
        return 'Product QR Feedback & Detail';
      default:
        return 'Shop Console';
    }
  };

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
              <span className="text-[12px] text-[#565e74] leading-tight mt-1 font-medium truncate max-w-[200px]">
                {currentShop.name} • {currentUser.name}
              </span>
            </div>
          </div>

          {/* Action and Role controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Database Schema Button */}
            <button
              onClick={onOpenDbSchema}
              className="px-2.5 py-1 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#0037b0] text-[11px] font-bold hover:bg-[#dce1ff] transition-colors cursor-pointer flex items-center gap-1"
              title="View MongoDB Compass Collections Schema"
            >
              <span className="material-symbols-outlined text-[15px]">database</span>
              <span className="hidden sm:inline">DB Tables</span>
            </button>

            {/* Interactive Role Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-bold hover:bg-[#bec6e0] transition-colors cursor-pointer border border-[#c4c5d7]/50"
                title="Switch employee role account"
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
                    Switch Active Member (RBAC)
                  </div>
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onRoleChange(s.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-[12px] transition-colors flex flex-col cursor-pointer ${
                        currentUser.id === s.id
                          ? 'bg-[#dce1ff] text-[#001551] font-bold'
                          : 'text-[#434655] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#dae2fd]">
                          {s.role}
                        </span>
                      </div>
                      <span className="text-[11px] opacity-80">{s.email}</span>
                    </button>
                  ))}
                  <div className="mt-1 pt-1 border-t border-[#eff4ff]">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left p-1.5 text-[11px] text-[#ba1a1a] hover:bg-[#ffdad6] rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      <span>Log Out to Login Gateway</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification bell */}
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 flex items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="w-9 h-9 flex items-center justify-center text-[#565e74] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Log Out to Login Page"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>

        {/* Sub-bar with DB connection status */}
        <div className="flex items-center justify-between pt-1 mt-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0 animate-pulse"></span>
            <span className="text-[11px] text-[#004f35] font-medium truncate max-w-[240px]">
              MongoDB: localhost:27017/smart_inventory
            </span>
          </div>
          <div className="text-[10px] text-[#434655] uppercase font-bold tracking-wider">
            {getSectionTitle(currentTab)}
          </div>
        </div>
      </div>
    </header>
  );
};
