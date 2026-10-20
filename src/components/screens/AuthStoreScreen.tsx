import React, { useState } from 'react';
import { StaffMember, RoleType } from '../../types';

interface AuthStoreScreenProps {
  staffList: StaffMember[];
  activeRole: RoleType;
  onAddStaff: (staff: StaffMember) => void;
  onRemoveStaff: (staffId: string) => void;
  onSwitchRole: (role: RoleType) => void;
  onShowToast: (msg: string) => void;
}

export const AuthStoreScreen: React.FC<AuthStoreScreenProps> = ({
  staffList,
  activeRole,
  onAddStaff,
  onRemoveStaff,
  onSwitchRole,
  onShowToast
}) => {
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [shopName, setShopName] = useState('GreenHarvest Supermarket');
  const [ownerName, setOwnerName] = useState('Dr. Maya Chen');
  const [phone, setPhone] = useState('+91 98401 23456');
  const [adminEmail, setAdminEmail] = useState('admin@greenharvest.io');
  const [adminPasskey, setAdminPasskey] = useState('SuperSecureToken#2024');

  const [tenantCode, setTenantCode] = useState('GH-9840-01');
  const [loginEmail, setLoginEmail] = useState('owner@greenharvest.io');
  const [loginPasskey, setLoginPasskey] = useState('••••••••••••');

  // Employee Provisioning Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+91 98400 11223');
  const [newStaffPasskey, setNewStaffPasskey] = useState('Passcode#2024');
  const [newStaffRole, setNewStaffRole] = useState<'Manager' | 'Cashier' | 'Helper'>('Cashier');
  const [selectedShift, setSelectedShift] = useState('07:00 - 15:30 (Morning)');

  // Filter state
  const [roleFilter, setRoleFilter] = useState<'All' | 'Manager' | 'Cashier' | 'Helper'>('All');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`Shop "${shopName}" created on MongoDB Atlas! Owner account provisioned.`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`Shop credentials authenticated for ${loginEmail}! Tenant data isolated.`);
  };

  const handleCommitStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Owner' && activeRole !== 'Manager') {
      onShowToast(`RBAC Alert: Only Shop Owner or Manager can provision employee accounts.`);
      return;
    }

    const name = newStaffName.trim() || 'Priya Sundaram';
    const email =
      newStaffEmail.trim() ||
      `${name.toLowerCase().replace(/\s+/g, '.')}@greenharvest.io`;
    const initials =
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'PS';

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      email,
      phone: newStaffPhone,
      pinCode: newStaffPasskey,
      role: newStaffRole,
      shift: selectedShift,
      status: 'On Duty',
      initials
    };

    onAddStaff(newMember);
    setIsModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    onShowToast(`Employee ${name} provisioned with ${newStaffRole} credentials.`);
  };

  const filteredStaff =
    roleFilter === 'All'
      ? staffList
      : staffList.filter((s) => s.role === roleFilter);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Micro-Banner: Status & Tenant Isolation Indicator */}
      <div className="w-full bg-[#e5eeff] rounded-xl p-2.5 shadow-xs flex items-center justify-between border border-[#dae2fd]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping shrink-0"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-[#0b1c30] truncate font-medium">
              Atlas Cluster: <strong className="text-[#004f35]">Mepco-Retail-Node-01</strong>
            </span>
            <span className="text-[11px] text-[#565e74] truncate">
              Multi-Tenant Shard: isolated by TenantID #GH-9840-01 • TLS 1.3 Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-xs shrink-0 border border-[#c4c5d7]">
          <span
            className="material-symbols-outlined text-[#004f35] text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="text-[11px] font-bold text-[#004f35]">Operational</span>
        </div>
      </div>

      {/* Primary Card: Enterprise Onboarding / Shop Authentication */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-[#e5eeff] p-4 flex flex-col space-y-4">
        {/* Header with Segmented Switcher */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
                Shop Registration &amp; Access Portal
              </span>
              <h2 className="font-headline font-semibold text-[20px] text-[#0b1c30] leading-tight">
                Enterprise Workspace Onboarding
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#dce1ff] flex items-center justify-center text-[#0037b0] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="w-full bg-[#eff4ff] p-1 rounded-lg grid grid-cols-2 gap-1 border border-[#dae2fd]">
            <button
              onClick={() => setAuthTab('register')}
              type="button"
              className={`w-full py-2 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 font-semibold cursor-pointer ${
                authTab === 'register'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              <span>Register New Shop</span>
            </button>
            <button
              onClick={() => setAuthTab('login')}
              type="button"
              className={`w-full py-2 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 font-semibold cursor-pointer ${
                authTab === 'login'
                  ? 'bg-white text-[#0037b0] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Existing Shop Login</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Register Form */}
        {authTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col space-y-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">
                  storefront
                </span>
                Shop / Outlet Legal Name
              </label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                <input
                  className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                  placeholder="e.g. GreenHarvest Supermarket"
                  required
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
                <span className="material-symbols-outlined text-[#747686] text-[18px]">store</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#0037b0]">badge</span>
                  Owner Full Legal Name
                </label>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <input
                    className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                    placeholder="Full Name"
                    required
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">person</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#0037b0]">call</span>
                  Contact Phone Number
                </label>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <input
                    className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">dialpad</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">mail</span>
                Administrative Owner Email &amp; Master Password
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <input
                    className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                    placeholder="owner@domain.com"
                    required
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">alternate_email</span>
                </div>
                <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                  <input
                    className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                    placeholder="••••••••••••"
                    required
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                  />
                  <span className="material-symbols-outlined text-[#747686] text-[18px]">key</span>
                </div>
              </div>
            </div>

            {/* Database Cluster Specs Callout */}
            <div className="p-3 bg-[#e5eeff] rounded-lg flex items-center gap-3 border border-[#dae2fd]">
              <div className="w-8 h-8 rounded-full bg-[#004f35] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">database</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#0b1c30] font-bold truncate">
                    MongoDB Atlas Multi-Tenant Pool
                  </span>
                  <span className="text-[10px] text-[#004f35] font-bold px-1.5 py-0.5 rounded bg-[#85f8c4]">
                    READY
                  </span>
                </div>
                <p className="text-[11px] text-[#565e74] truncate mt-0.5">
                  Dedicated shard with tenant isolation &amp; TLS-secured POS pipeline.
                </p>
              </div>
            </div>

            <button
              className="w-full mt-2 py-3 px-4 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>Register &amp; Provision Multi-Role Workspace</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="flex flex-col space-y-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">domain</span>
                Retail Tenant Code or Store ID
              </label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                <input
                  className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                  placeholder="GH-9840-01"
                  type="text"
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value)}
                />
                <span className="material-symbols-outlined text-[#747686] text-[18px]">tag</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">mail</span>
                Account Email
              </label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                <input
                  className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                  placeholder="owner@greenharvest.io"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <span className="material-symbols-outlined text-[#747686] text-[18px]">alternate_email</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#434655] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0037b0]">lock</span>
                Account Password / PIN
              </label>
              <div className="w-full bg-[#eff4ff] border border-[#dae2fd] rounded-lg p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 transition-all">
                <input
                  className="bg-transparent w-full text-[#0b1c30] text-[14px] outline-none placeholder:text-[#747686]"
                  placeholder="••••••••••••"
                  type="password"
                  value={loginPasskey}
                  onChange={(e) => setLoginPasskey(e.target.value)}
                />
                <span className="material-symbols-outlined text-[#747686] text-[18px]">visibility</span>
              </div>
            </div>

            <button
              className="w-full mt-2 py-3 px-4 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Authenticate &amp; Unlock Shop Console</span>
            </button>
          </form>
        )}
      </div>

      {/* Authenticated Session & Store Identity Card */}
      <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-[#1d4ed8] text-white flex items-center justify-center font-headline font-bold text-[18px] shadow-xs">
              GH
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#68dba9] rounded-full shadow-xs flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#002114] text-[10px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-semibold text-[15px] text-[#0b1c30] truncate">
                {shopName}
              </span>
              <span className="text-[10px] bg-[#dae2fd] text-[#3f465c] px-1.5 py-0.5 rounded-full font-bold">
                HQ-MAIN
              </span>
            </div>
            <span className="text-[12px] text-[#565e74] truncate">
              Owner: {ownerName} • ID: #EMP-001 • Tenant: {tenantCode}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeRole !== 'Owner' && activeRole !== 'Manager') {
              onShowToast('Only Shop Owner or Manager can provision new staff.');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="h-9 px-3 bg-[#dae2fd] hover:bg-[#bec6e0] text-[#131b2e] rounded-lg text-[12px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Role Privilege Architecture Cards */}
      <div className="w-full flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
              Security Architecture
            </span>
            <h3 className="font-headline font-semibold text-[16px] text-[#0b1c30]">
              Multi-Role Privileges (RBAC)
            </h3>
          </div>
          <span className="text-[12px] text-[#0037b0] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">policy</span>
            Tenant Isolation Active
          </span>
        </div>

        {/* 1. Owner Privilege Card */}
        <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#001551] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-[15px] text-[#0b1c30]">Shop Owner</h4>
                <span className="text-[11px] text-[#0037b0] font-semibold">Primary Administrative Authority</span>
              </div>
            </div>
            <span className="bg-[#001551] text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              1 Active
            </span>
          </div>
          <p className="text-[12px] text-[#434655] leading-relaxed">
            Unrestricted access to financial reports, profit calculations, employee credential provisioning, and AI product combinations.
          </p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">Provision employee accounts &amp; assign roles (Manager, Cashier, Helper)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">Access revenue, profit margins &amp; strategic AI recommendations</span>
            </div>
          </div>
        </div>

        {/* 2. Manager Privilege Card */}
        <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#dce1ff] text-[#001551] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-[15px] text-[#0b1c30]">Store Manager</h4>
                <span className="text-[11px] text-[#0037b0] font-semibold">Inventory &amp; Operations Clearance</span>
              </div>
            </div>
            <span className="bg-[#dce1ff] text-[#001551] text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              {staffList.filter((s) => s.role === 'Manager').length} Active
            </span>
          </div>
          <p className="text-[12px] text-[#434655] leading-relaxed">
            Full catalog lifecycle control (add, edit, sunset SKUs), minimum stock threshold definitions, and restock approval with supplier email editing.
          </p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">Manage catalog, modify stock &amp; generate QR packaging tags</span>
            </div>
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">Review &amp; approve restocking requests; modify supplier drafts</span>
            </div>
          </div>
        </div>

        {/* 3. Cashier Privilege Card */}
        <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#dae2fd] text-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-[15px] text-[#0b1c30]">POS Cashier</h4>
                <span className="text-[11px] text-[#565e74] font-semibold">Register &amp; Checkout Authority</span>
              </div>
            </div>
            <span className="bg-[#dae2fd] text-[#131b2e] text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              {staffList.filter((s) => s.role === 'Cashier').length} Active
            </span>
          </div>
          <p className="text-[12px] text-[#434655] leading-relaxed">
            Rapid barcode scanning, counter billing, stock availability validation, automatic inventory decrements, and return/refund processing.
          </p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">Record sales with immediate stock decrement; view sales trends</span>
            </div>
          </div>
        </div>

        {/* 4. Helper Privilege Card */}
        <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-[15px] text-[#0b1c30]">Floor Helper</h4>
                <span className="text-[11px] text-[#004f35] font-semibold">Floor Assist &amp; Restock Alerting</span>
              </div>
            </div>
            <span className="bg-[#85f8c4] text-[#002114] text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              {staffList.filter((s) => s.role === 'Helper').length} Active
            </span>
          </div>
          <p className="text-[12px] text-[#434655] leading-relaxed">
            Floor support staff enabled to review shelf levels, inspect sales trends, and raise restock alerts in the internal forum. Cannot modify catalog records.
          </p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004f35] text-[16px]">check</span>
              <span className="text-[12px] text-[#0b1c30] font-medium">View-only sales trends &amp; participate in internal restock forum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Staff Roster Table Section */}
      <div className="w-full bg-white rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-semibold">
              Roster &amp; Credentials
            </span>
            <h3 className="font-headline font-semibold text-[18px] text-[#0b1c30]">
              Shop Staff Directory ({staffList.length})
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {(['All', 'Manager', 'Cashier', 'Helper'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  roleFilter === r
                    ? 'bg-[#0037b0] text-white shadow-2xs'
                    : 'bg-[#e5eeff] text-[#565e74] hover:bg-[#dce9ff]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Members List */}
        <div className="flex flex-col space-y-2">
          {filteredStaff.map((staff) => {
            let roleBadgeClass = 'bg-[#dae2fd] text-[#131b2e]';
            let avatarBg = 'bg-[#565e74]';
            if (staff.role === 'Owner') {
              roleBadgeClass = 'bg-[#001551] text-white';
              avatarBg = 'bg-[#001551]';
            } else if (staff.role === 'Manager') {
              roleBadgeClass = 'bg-[#dce1ff] text-[#0039b5]';
              avatarBg = 'bg-[#0037b0]';
            } else if (staff.role === 'Helper') {
              roleBadgeClass = 'bg-[#85f8c4] text-[#002114]';
              avatarBg = 'bg-[#004f35]';
            }

            return (
              <div
                key={staff.id}
                className="p-3 rounded-lg bg-[#eff4ff] border border-[#dae2fd] flex flex-col space-y-2 hover:bg-[#e5eeff]/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                    >
                      {staff.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[#0b1c30] font-semibold">
                        {staff.name}
                      </span>
                      <span className="text-[12px] text-[#565e74]">{staff.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${roleBadgeClass}`}>
                      {staff.role}
                    </span>
                    {/* Switch to this user button */}
                    <button
                      onClick={() => {
                        onSwitchRole(staff.role);
                        onShowToast(`Switched active session to ${staff.name} (${staff.role}).`);
                      }}
                      title="Simulate login as this staff member"
                      className="px-2 py-0.5 bg-white border border-[#c4c5d7] rounded text-[10px] font-bold text-[#0037b0] hover:bg-[#dce1ff] cursor-pointer"
                    >
                      Log in as
                    </button>
                    {staff.role !== 'Owner' && (activeRole === 'Owner' || activeRole === 'Manager') && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Revoke access for ${staff.name}?`)) {
                            onRemoveStaff(staff.id);
                            onShowToast(`Staff member ${staff.name} removed from roster.`);
                          }
                        }}
                        className="text-[#ba1a1a] hover:text-[#93000a] p-0.5"
                        title="Remove employee"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 bg-white/90 px-2.5 py-1.5 rounded-md border border-[#dae2fd]/50">
                  <div className="flex items-center gap-1.5 text-[#565e74]">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="text-[12px]">Shift: {staff.shift}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      staff.status === 'On Duty' ? 'text-[#004f35]' : 'text-[#565e74]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        staff.status === 'On Duty'
                          ? 'bg-[#059669] animate-pulse'
                          : 'bg-[#747686]'
                      }`}
                    ></span>
                    {staff.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Member Trigger Banner */}
        <button
          onClick={() => {
            if (activeRole !== 'Owner' && activeRole !== 'Manager') {
              onShowToast('Only Shop Owner or Manager can provision new staff.');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="w-full py-2.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0037b0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Provision New Employee Credentials</span>
        </button>
      </div>

      {/* Interactive Provisioning Drawer / Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex flex-col justify-end p-safe animate-in fade-in duration-200">
          <div className="w-full max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl p-4 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#dce1ff] text-[#0037b0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-[17px] text-[#0b1c30]">
                    Create Employee Account
                  </h3>
                  <span className="text-[12px] text-[#565e74]">
                    Assign Role &amp; Shop Access Credentials
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#dae2fd] flex items-center justify-center text-[#434655]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCommitStaff} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Employee Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[14px] text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">Assigned Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) =>
                    setNewStaffRole(e.target.value as 'Manager' | 'Cashier' | 'Helper')
                  }
                  className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2.5 rounded-lg text-[14px] text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="Manager">Manager (Catalog Management &amp; Restock Approval)</option>
                  <option value="Cashier">Cashier (POS Checkout &amp; Auto-Stock Decrements)</option>
                  <option value="Helper">Helper (Sales Trends &amp; Floor Restock Flags)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Login Email</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="priya.s@greenharvest.io"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#0b1c30]">Initial Passkey</label>
                  <input
                    type="text"
                    value={newStaffPasskey}
                    onChange={(e) => setNewStaffPasskey(e.target.value)}
                    placeholder="Passcode#2024"
                    className="w-full bg-[#eff4ff] border border-[#dae2fd] p-2 rounded-lg text-[13px] text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Assigned Shift Schedule
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setSelectedShift('07:00 - 15:30 (Morning)')}
                    className={`p-2.5 rounded-lg text-center cursor-pointer transition-all border-2 ${
                      selectedShift === '07:00 - 15:30 (Morning)'
                        ? 'border-[#0037b0] bg-[#eff4ff]'
                        : 'border-transparent bg-[#f8f9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span className="text-[12px] block font-semibold text-[#0b1c30]">
                      Morning Shift
                    </span>
                    <span className="text-[11px] text-[#565e74]">07:00 - 15:30</span>
                  </div>
                  <div
                    onClick={() => setSelectedShift('14:30 - 23:00 (Evening)')}
                    className={`p-2.5 rounded-lg text-center cursor-pointer transition-all border-2 ${
                      selectedShift === '14:30 - 23:00 (Evening)'
                        ? 'border-[#0037b0] bg-[#eff4ff]'
                        : 'border-transparent bg-[#f8f9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span className="text-[12px] block font-semibold text-[#0b1c30]">
                      Evening Shift
                    </span>
                    <span className="text-[11px] text-[#565e74]">14:30 - 23:00</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 bg-[#eff4ff] hover:bg-[#dae2fd] text-[#0b1c30] rounded-lg text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#0037b0] hover:bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Deploy Employee Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
