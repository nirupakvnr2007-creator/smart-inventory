import React, { useState } from 'react';
import { ShopProfile, UserAccount } from '../../types';

interface LoginGatewayScreenProps {
  currentShop: ShopProfile | null;
  users: UserAccount[];
  onRegisterShop: (shop: ShopProfile, owner: UserAccount) => void;
  onLoginSuccess: (user: UserAccount) => void;
  onShowToast: (msg: string) => void;
}

export const LoginGatewayScreen: React.FC<LoginGatewayScreenProps> = ({
  currentShop,
  users,
  onRegisterShop,
  onLoginSuccess,
  onShowToast
}) => {
  // If no shop exists, default to register. Otherwise default to login.
  const [mode, setMode] = useState<'login' | 'register'>(currentShop ? 'login' : 'register');

  // Register Form
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required shop and owner details.');
      return;
    }

    const shop: ShopProfile = {
      id: `shop-${Date.now()}`,
      name: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString()
    };

    const owner: UserAccount = {
      id: `user-${Date.now()}`,
      name: ownerName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: 'Owner',
      phone: phone.trim(),
      createdAt: new Date().toISOString()
    };

    onRegisterShop(shop, owner);
    onLoginSuccess(owner);
    onShowToast(`Shop "${shop.name}" registered successfully! Welcome, ${owner.name}.`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === loginPassword.trim()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
      onShowToast(`Welcome back, ${matchedUser.name} (${matchedUser.role})!`);
    } else {
      setErrorMessage('Invalid email or password. Please verify your credentials or ask the Owner.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-4 selection:bg-[#dce1ff] selection:text-[#001551]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e5eeff] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon & Brand */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-[#0037b0] text-white flex items-center justify-center mx-auto shadow-md">
            <span className="material-symbols-outlined text-[28px]">storefront</span>
          </div>
          <h1 className="font-headline font-bold text-[22px] text-[#0b1c30]">
            Smart Inventory Assistant
          </h1>
          <p className="text-[12px] text-[#565e74]">
            {currentShop ? currentShop.name : 'Centralized Retail Management System'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-[#eff4ff] p-1 rounded-xl grid grid-cols-2 gap-1 border border-[#dae2fd]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#0037b0] shadow-xs'
                : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">app_registration</span>
            <span>Register Shop</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#ffdad6] border border-[#ffb4ab] rounded-xl text-[12px] text-[#93000a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#0b1c30]">Email Address</label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#0037b0] focus-within:ring-2 focus-within:ring-[#0037b0]/20 transition-all">
                <span className="material-symbols-outlined text-[#747686] text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#0b1c30]">Password</label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#0037b0] focus-within:ring-2 focus-within:ring-[#0037b0]/20 transition-all">
                <span className="material-symbols-outlined text-[#747686] text-[18px]">lock</span>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In to Shop</span>
            </button>

            {users.length === 0 && (
              <p className="text-[11px] text-[#565e74] text-center pt-2">
                No accounts created yet. Please register your shop first to create the Owner account.
              </p>
            )}
          </form>
        )}

        {/* Mode: Register Shop */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#0b1c30]">
                Shop / Outlet Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Grocery Mart"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Owner Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Owner Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none focus:bg-white focus:border-[#0037b0]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Register Shop &amp; Enter as Owner</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#eff4ff]">
          <span className="text-[11px] text-[#565e74]">
            Privilege Tiers: Owner • Manager • Cashier • Helper
          </span>
        </div>
      </div>
    </div>
  );
};
