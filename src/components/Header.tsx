import React, { useState } from 'react';
import { RoleType, UserAccount, ShopProfile } from '../types';

interface HeaderProps {
  currentTab: string;
  activeRole: RoleType;
  currentUser: UserAccount;
  currentShop: ShopProfile;
  staffList: UserAccount[];
  onRoleChange: (role: RoleType) => void;
  onOpenNotifications: () => void;
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
  onLogout,
  notificationCount
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getSectionTitle = (tab: string) => {
    switch (tab) {
      case 'members':
      case 'auth-store':
        return 'Shop Management';
      case 'inventory':
        return 'Product Inventory';
      case 'restock':
      case 'restock-suppliers':
        return 'Supplier Restock';
      case 'pos-billing':
      case 'billing':
        return 'POS Counter Billing';
      case 'forum':
        return 'Team Discussion Forum';
      case 'dashboard':
      case 'analytics-ai':
        return 'Sales Trends & Dashboard';
      default:
        return 'Shop Console';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff]">
      <div className="max-w-4xl mx-auto h-16 px-4 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          {/* Brand lockup */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0037b0] flex items-center justify-center shrink-0 shadow-sm text-white">
              <span className="material-symbols-outlined text-[20px]">
                storefront
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-semibold text-[15px] text-[#0b1c30] leading-none tracking-tight">
                {currentShop.name}
              </span>
              <span className="text-[11px] text-[#565e74] leading-tight mt-1 font-medium truncate max-w-[200px]">
                {currentUser.name} • <strong className="text-[#0037b0]">{currentUser.role}</strong>
              </span>
            </div>
          </div>

          {/* Action and Role controls */}
          <div className="flex items-center gap-2">
            {/* Active Role Switcher / Profile */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#0037b0] text-[11px] font-bold hover:bg-[#dce1ff] transition-colors cursor-pointer border border-[#dae2fd]"
                title="Account details"
              >
                <span className="w-2 h-2 rounded-full bg-[#0037b0]"></span>
                <span>{currentUser.role}</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_drop_down
                </span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-[#dae2fd] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#747686] uppercase tracking-wider">
                    Logged in account
                  </div>
                  <div className="p-2 bg-[#f8f9ff] rounded-lg border border-[#dae2fd] space-y-0.5 mb-2">
                    <p className="text-[13px] font-bold text-[#0b1c30]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#565e74] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#dce1ff] text-[#0039b5]">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  {/* Switch between created accounts if any other members exist */}
                  {staffList.filter((s) => s.id !== currentUser.id).length > 0 && (
                    <div className="space-y-1 mb-2">
                      <div className="px-2 py-0.5 text-[10px] font-bold text-[#747686] uppercase tracking-wider">
                        Switch Registered Member
                      </div>
                      {staffList
                        .filter((s) => s.id !== currentUser.id)
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              onRoleChange(s.role);
                              setShowRoleMenu(false);
                            }}
                            className="w-full text-left p-1.5 rounded-lg text-[11px] hover:bg-[#eff4ff] text-[#0b1c30] flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{s.name}</span>
                            <span className="text-[10px] text-[#565e74] font-bold">{s.role}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="pt-1 border-t border-[#eff4ff]">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left p-1.5 text-[11px] text-[#ba1a1a] hover:bg-[#ffdad6] rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification bell */}
            <button
              onClick={onOpenNotifications}
              className="w-8 h-8 flex items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors relative cursor-pointer"
              aria-label="Restock Alerts"
              title="Restock Alerts"
            >
              <span className="material-symbols-outlined text-[19px]">
                notifications
              </span>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center text-[#565e74] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
