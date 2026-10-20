import React from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  criticalCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  criticalCount = 0
}) => {
  const tabs = [
    {
      id: 'auth-store',
      label: 'Auth/Store',
      icon: 'storefront'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'shelves'
    },
    {
      id: 'restock-suppliers',
      label: 'Restock',
      icon: 'local_shipping',
      badge: criticalCount > 0 ? criticalCount : undefined
    },
    {
      id: 'pos-billing',
      label: 'POS',
      icon: 'point_of_sale'
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: 'forum'
    },
    {
      id: 'analytics-ai',
      label: 'Analytics',
      icon: 'auto_graph'
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#ffffff]/95 backdrop-blur-xl border-t border-[#e5eeff] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] transition-all relative ${
                isActive
                  ? 'text-[#0037b0] font-bold'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight text-center truncate max-w-[54px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-[#0037b0] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
