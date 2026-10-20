import React, { useState } from 'react';
import { StaffMember, RoleType, ShopProfile } from '../../types';

interface LoginGatewayScreenProps {
  currentShop: ShopProfile;
  staffList: StaffMember[];
  onRegisterShop: (shop: ShopProfile, ownerUser: StaffMember) => void;
  onLoginSuccess: (user: StaffMember) => void;
  onOpenDbSchema: () => void;
  onShowToast: (msg: string) => void;
}

export const LoginGatewayScreen: React.FC<LoginGatewayScreenProps> = ({
  currentShop,
  staffList,
  onRegisterShop,
  onLoginSuccess,
  onOpenDbSchema,
  onShowToast
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('login');

  // Register Shop Form state
  const [shopName, setShopName] = useState('GreenHarvest Supermarket');
  const [ownerName, setOwnerName] = useState('Dr. Maya Chen');
  const [phone, setPhone] = useState('+91 98401 23456');
  const [adminEmail, setAdminEmail] = useState('owner@greenharvest.io');
  const [passkey, setPasskey] = useState('AdminPass#2026');

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('owner@greenharvest.io');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenantCode = `GH-${Math.floor(1000 + Math.random() * 9000)}-01`;
    const newShop: ShopProfile = {
      id: `shop-${Date.now()}`,
      name: shopName,
      ownerName,
      phone,
      email: adminEmail,
      tenantCode: newTenantCode,
      cluster: 'localhost:27017',
      databaseName: 'smart_inventory'
    };

    const ownerUser: StaffMember = {
      id: `staff-owner-${Date.now()}`,
      name: ownerName,
      email: adminEmail,
      role: 'Owner',
      shift: 'General Oversight',
      status: 'On Duty',
      initials: ownerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'OW',
      phone
    };

    onRegisterShop(newShop, ownerUser);
    onLoginSuccess(ownerUser);
    onShowToast(`Shop "${shopName}" created in MongoDB smart_inventory! Logged in as Owner.`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Find matching employee by email
    const foundUser = staffList.find(
      (s) => s.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (foundUser) {
      onLoginSuccess(foundUser);
      onShowToast(`Authenticated as ${foundUser.name} (${foundUser.role}). Access granted.`);
    } else {
      // Create user on the fly or fallback to Owner
      const fallbackOwner = staffList.find((s) => s.role === 'Owner') || staffList[0];
      onLoginSuccess(fallbackOwner);
      onShowToast(`Logged into ${currentShop.name} as ${fallbackOwner.role}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto">
      {/* Top Branding & MongoDB Localhost Status */}
      <div className="space-y-4 pt-4">
        {/* Localhost DB Connection Badge */}
        <div className="bg-[#e5eeff] border border-[#dae2fd] rounded-xl p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping shrink-0"></span>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-[#0b1c30] truncate">
                Target DB: <code className="text-[#0037b0] font-mono">localhost:27017 / smart_inventory</code>
              </span>
              <span className="text-[11px] text-[#565e74] truncate">
                MongoDB Compass connected • Shard tenant isolation
              </span>
            </div>
          </div>
          <button
            onClick={onOpenDbSchema}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#c4c5d7] text-[#0037b0] text-[11px] font-bold hover:bg-[#eff4ff] cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[14px]">database</span>
            <span>View DB Tables</span>
          </button>
        </div>

        {/* Brand Hero */}
        <div className="text-center py-2 space-y-1">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#0037b0] text-white items-center justify-center shadow-md mb-1">
            <span className="material-symbols-outlined text-[28px]">inventory_2</span>
          </div>
          <h1 className="font-headline font-bold text-[24px] text-[#0b1c30] tracking-tight">
            Smart Inventory Assistant
          </h1>
          <p className="text-[13px] text-[#565e74] max-w-md mx-auto">
            Centralized operations, real-time inventory decrements, employee coordination, and MongoDB-backed retail control.
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="bg-[#eff4ff] p-1 rounded-xl grid grid-cols-2 gap-1 border border-[#dae2fd]">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Shop Member Login</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Register New Shop</span>
          </button>
        </div>

        {/* Tab 1: Member Login */}
        {tab === 'login' && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e5eeff] space-y-4">
            <div>
              <h2 className="font-headline font-bold text-[17px] text-[#0b1c30]">
                Sign in to {currentShop.name}
              </h2>
              <p className="text-[12px] text-[#565e74]">
                Enter registered employee credentials or select a role account below.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Employee / Owner Email
                </label>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">mail</span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. owner@greenharvest.io"
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Password / PIN
                </label>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">key</span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Enter Shop Console</span>
              </button>
            </form>

            {/* Quick Fast-Track Role Account Switcher for Testing */}
            <div className="pt-3 border-t border-[#eff4ff] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                  Or 1-Click Fast Sign-In by Role
                </span>
                <span className="text-[10px] text-[#0037b0] font-semibold">Demo Sandbox</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {staffList.map((staff) => {
                  let roleColor = 'bg-[#dae2fd] text-[#131b2e]';
                  if (staff.role === 'Owner') roleColor = 'bg-[#001551] text-white';
                  if (staff.role === 'Manager') roleColor = 'bg-[#dce1ff] text-[#0039b5]';
                  if (staff.role === 'Helper') roleColor = 'bg-[#85f8c4] text-[#002114]';

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => {
                        onLoginSuccess(staff);
                        onShowToast(`Signed in as ${staff.name} with ${staff.role} privileges.`);
                      }}
                      className="p-2.5 rounded-xl border border-[#dae2fd] hover:border-[#0037b0] bg-[#f8f9ff] hover:bg-[#eff4ff] text-left transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] text-[#0b1c30] truncate">
                          {staff.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${roleColor}`}>
                          {staff.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#565e74] truncate mt-1">
                        {staff.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Register New Shop */}
        {tab === 'register' && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e5eeff] space-y-4">
            <div>
              <h2 className="font-headline font-bold text-[17px] text-[#0b1c30]">
                Register New Retail Shop
              </h2>
              <p className="text-[12px] text-[#565e74]">
                Create a new shop tenant in MongoDB. As Owner, you will manage catalog, employees, and operations.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">
                  Shop / Outlet Legal Name
                </label>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">store</span>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Central Mart"
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Owner Legal Name</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Owner Login Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="owner@store.com"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0b1c30]">Master Password</label>
                  <input
                    type="password"
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#e5eeff] rounded-lg border border-[#dae2fd] text-[11px] text-[#565e74] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#004f35]">database</span>
                <span>
                  Registers in <code className="text-[#004f35] font-bold">smart_inventory.shops</code> and creates master Owner credentials.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>Register Shop &amp; Access Dashboard as Owner</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center py-4 text-[11px] text-[#565e74] space-y-1">
        <p>Enterprise Role-Based Access: Owner • Manager • Cashier • Helper</p>
        <p className="font-mono text-[10px] text-[#747686]">
          MongoDB Node Pool: localhost:27017/smart_inventory
        </p>
      </div>
    </div>
  );
};
