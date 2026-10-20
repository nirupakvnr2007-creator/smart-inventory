import React, { useState } from 'react';
import { ShopProfile, MemberAccount } from '../../types';

interface AuthPortalProps {
  shop: ShopProfile | null;
  members: MemberAccount[];
  onRegisterShop: (shop: ShopProfile, owner: MemberAccount) => void;
  onLogin: (member: MemberAccount) => void;
  onResetShop: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  shop,
  members,
  onRegisterShop,
  onLogin,
  onResetShop,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(shop ? 'login' : 'register');

  // Register Shop State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) {
      onShowToast('Please fill in all required shop and owner details.');
      return;
    }

    const newShop: ShopProfile = {
      id: `shop-${Date.now()}`,
      name: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: ownerPhone.trim() || '+91 90000 00000',
      email: ownerEmail.trim(),
      createdAt: new Date().toISOString()
    };

    const ownerMember: MemberAccount = {
      id: `member-${Date.now()}`,
      name: ownerName.trim(),
      email: ownerEmail.trim().toLowerCase(),
      password: ownerPassword.trim(),
      role: 'Owner',
      phone: ownerPhone.trim() || '+91 90000 00000',
      shift: 'General Oversight',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    onRegisterShop(newShop, ownerMember);
    onLogin(ownerMember);
    onShowToast(`Shop "${newShop.name}" registered! Welcome, ${ownerMember.name}.`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = members.find(
      (m) =>
        m.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        m.password === loginPassword.trim()
    );

    if (matched) {
      onLogin(matched);
      onShowToast(`Welcome back, ${matched.name} (${matched.role})!`);
    } else {
      onShowToast('Invalid email or password. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#dae2fd] p-6 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#0037b0] rounded-xl text-white flex items-center justify-center mx-auto shadow-md">
            <span className="material-symbols-outlined text-[28px]">storefront</span>
          </div>
          <h1 className="font-headline font-bold text-[22px] text-[#0b1c30]">
            Smart Inventory Assistant
          </h1>
          <p className="text-[12px] text-[#565e74]">
            {shop ? shop.name : 'Centralized Retail Operations & Inventory Platform'}
          </p>
        </div>

        {/* Tab switcher if shop exists */}
        {shop && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#eff4ff] rounded-xl border border-[#dae2fd]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Member Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Register New Shop
            </button>
          </div>
        )}

        {/* Mode 1: Register Shop & Owner Account */}
        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <h2 className="font-headline font-bold text-[16px] text-[#0b1c30]">
                Register Your Shop
              </h2>
              <p className="text-[12px] text-[#565e74]">
                Create your shop database. As Owner, you will create and manage member accounts.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0b1c30]">Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Mart / Apex Supermarket"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0b1c30]">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0b1c30]">Owner Login Email *</label>
              <input
                type="email"
                required
                placeholder="owner@yourshop.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0b1c30]">Owner Master Password *</label>
              <input
                type="password"
                required
                placeholder="Create strong password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm transition-all cursor-pointer mt-2"
            >
              Create Shop &amp; Sign In as Owner
            </button>
          </form>
        ) : (
          /* Mode 2: Member Login */
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <h2 className="font-headline font-bold text-[16px] text-[#0b1c30]">
                Sign In to Your Account
              </h2>
              <p className="text-[12px] text-[#565e74]">
                Enter your shop credentials. Access is restricted to your assigned role.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0b1c30]">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@yourshop.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0b1c30]">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm transition-all cursor-pointer"
            >
              Authenticate &amp; Enter Shop
            </button>

            {/* Quick 1-Click Access for created members */}
            {members.length > 0 && (
              <div className="pt-3 border-t border-[#eff4ff] space-y-2">
                <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider block">
                  Created Accounts in this Shop ({members.length}):
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {members.map((m) => {
                    let badgeClass = 'bg-[#eff4ff] text-[#0037b0]';
                    if (m.role === 'Owner') badgeClass = 'bg-[#001551] text-white';
                    if (m.role === 'Manager') badgeClass = 'bg-[#dce1ff] text-[#0039b5]';
                    if (m.role === 'Cashier') badgeClass = 'bg-[#dae2fd] text-[#131b2e]';
                    if (m.role === 'Helper') badgeClass = 'bg-[#85f8c4] text-[#002114]';

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onLogin(m);
                          onShowToast(`Signed in as ${m.name} (${m.role})`);
                        }}
                        className="w-full p-2 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#dae2fd] rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <span className="text-[12px] font-bold text-[#0b1c30] block truncate">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-[#565e74] block truncate">
                            {m.email}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${badgeClass}`}>
                          {m.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        )}

        {/* Footer Reset option if shop exists */}
        {shop && (
          <div className="pt-2 border-t border-[#eff4ff] text-center">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset current shop and clear local database? This will clear all shop data.'
                  )
                ) {
                  onResetShop();
                  setMode('register');
                  setShopName('');
                  setOwnerName('');
                  setOwnerEmail('');
                  setOwnerPassword('');
                }
              }}
              className="text-[11px] text-[#ba1a1a] hover:underline cursor-pointer"
            >
              Reset / Register a Different Shop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
