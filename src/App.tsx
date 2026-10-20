import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginGatewayScreen } from './components/screens/LoginGatewayScreen';
import { DbSchemaModal } from './components/screens/DbSchemaModal';
import { AuthStoreScreen } from './components/screens/AuthStoreScreen';
import { RestockSuppliersScreen } from './components/screens/RestockSuppliersScreen';
import { SkuDetailScreen } from './components/screens/SkuDetailScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { PosBillingScreen } from './components/screens/PosBillingScreen';
import { ForumScreen } from './components/screens/ForumScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import {
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_RESTOCK_ORDERS,
  INITIAL_REVIEWS_SKU_103,
  INITIAL_FORUM_POSTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECOMMENDATIONS
} from './data/mockData';
import {
  ProductItem,
  StaffMember,
  RestockOrder,
  CustomerReview,
  ForumPost,
  CartItem,
  SalesTransaction,
  ProductRecommendation,
  ShopProfile
} from './types';

export default function App() {
  // Authentication Gateway State: Opened first as requested!
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  // Shop Profile State
  const [currentShop, setCurrentShop] = useState<ShopProfile>({
    id: 'shop-01',
    name: 'GreenHarvest Supermarket',
    ownerName: 'Dr. Maya Chen',
    phone: '+91 98401 23456',
    email: 'owner@greenharvest.io',
    tenantCode: 'GH-9840-01',
    cluster: 'localhost:27017',
    databaseName: 'smart_inventory'
  });

  const [activeTab, setActiveTab] = useState<string>('auth-store');
  const [previousTab, setPreviousTab] = useState<string>('auth-store');
  const [selectedSkuForDetail, setSelectedSkuForDetail] = useState<string>('SKU-103');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDbSchemaOpen, setIsDbSchemaOpen] = useState(false);

  // Core App State
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [orders, setOrders] = useState<RestockOrder[]>(INITIAL_RESTOCK_ORDERS);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS_SKU_103);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [transactions, setTransactions] = useState<SalesTransaction[]>(INITIAL_TRANSACTIONS);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>(
    INITIAL_RECOMMENDATIONS
  );

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleRegisterShop = (newShop: ShopProfile, ownerUser: StaffMember) => {
    setCurrentShop(newShop);
    // Add owner if not existing
    setStaffList((prev) => [ownerUser, ...prev.filter((s) => s.role !== 'Owner')]);
    setCurrentUser(ownerUser);
    setActiveTab('auth-store');
  };

  const handleLoginSuccess = (user: StaffMember) => {
    setCurrentUser(user);
    // Route by role appropriately
    if (user.role === 'Cashier') {
      setActiveTab('pos-billing');
    } else if (user.role === 'Helper') {
      setActiveTab('forum');
    } else if (user.role === 'Manager') {
      setActiveTab('inventory');
    } else {
      setActiveTab('auth-store');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out of shop console. Returned to Gateway.');
  };

  const handleRoleChange = (role: StaffMember['role']) => {
    const targetUser = staffList.find((s) => s.role === role) || {
      id: `staff-${Date.now()}`,
      name: `Active ${role}`,
      email: `${role.toLowerCase()}@greenharvest.io`,
      role,
      shift: 'Flexible Shift',
      status: 'On Duty',
      initials: role.substring(0, 2).toUpperCase()
    };
    setCurrentUser(targetUser);
    showToast(`Switched active session to ${targetUser.name} (${targetUser.role}).`);
  };

  const handleTabChange = (tab: string) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProductDetail = (sku: string) => {
    setSelectedSkuForDetail(sku);
    setPreviousTab(activeTab);
    setActiveTab('sku-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setActiveTab(previousTab === 'sku-detail' ? 'inventory' : previousTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
  };

  const handleRemoveStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
  };

  const handleApprovePO = (newOrder: RestockOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleConfirmInwardStock = (poNumber: string, sku: string, units: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.poNumber === poNumber
          ? {
              ...o,
              status: 'Delivered & Confirmed',
              statusNote: `+${units} units received and credited to MongoDB`
            }
          : o
      )
    );

    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          const nextStock = p.currentStock + units;
          return {
            ...p,
            currentStock: nextStock,
            status: nextStock <= p.minThreshold ? 'critical' : 'healthy'
          };
        }
        return p;
      })
    );
  };

  const handleAddReview = (newReview: CustomerReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleAddForumPost = (newPost: ForumPost) => {
    setForumPosts((prev) => [newPost, ...prev]);
  };

  const handleAddReply = (
    postId: string,
    content: string,
    author: string,
    role: StaffMember['role']
  ) => {
    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextReplies = [
            ...(p.replies || []),
            {
              id: `rep-${Date.now()}`,
              author,
              role,
              content,
              timestamp: 'Just now'
            }
          ];
          return { ...p, replies: nextReplies };
        }
        return p;
      })
    );
  };

  const handleToggleResolve = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, resolved: !p.resolved } : p))
    );
  };

  const handleAddProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.sku === updated.sku ? updated : p)));
  };

  const handleRemoveProduct = (sku: string) => {
    setProducts((prev) => prev.filter((p) => p.sku !== sku));
  };

  const handleUpdateStock = (sku: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          const nextStock = Math.max(0, p.currentStock + delta);
          let nextStatus: 'critical' | 'low' | 'healthy' = 'healthy';
          if (nextStock <= p.minThreshold) {
            nextStatus = 'critical';
          } else if (nextStock <= p.minThreshold + 5) {
            nextStatus = 'low';
          }
          return {
            ...p,
            currentStock: nextStock,
            status: nextStatus
          };
        }
        return p;
      })
    );
  };

  const handleCompleteSale = (
    items: CartItem[],
    subtotal: number,
    gst: number,
    discount: number,
    total: number,
    paymentMethod: 'UPI' | 'Cash' | 'Card',
    cashierName: string
  ) => {
    const newTxn: SalesTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierName,
      items: items.map((c) => ({
        sku: c.product.sku,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity
      })),
      subtotal,
      gst,
      discount,
      total,
      paymentMethod,
      status: 'Completed'
    };
    setTransactions((prev) => [newTxn, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = items.find((ci) => ci.product.sku === p.sku);
        if (cartItem) {
          const nextStock = Math.max(0, p.currentStock - cartItem.quantity);
          let nextStatus: 'critical' | 'low' | 'healthy' = 'healthy';
          if (nextStock <= p.minThreshold) {
            nextStatus = 'critical';
          } else if (nextStock <= p.minThreshold + 5) {
            nextStatus = 'low';
          }
          return {
            ...p,
            currentStock: nextStock,
            salesLast30Days: (p.salesLast30Days || 0) + cartItem.quantity,
            status: nextStatus
          };
        }
        return p;
      })
    );
  };

  const handleRefundTransaction = (txnId: string) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn || txn.status === 'Refunded') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'Refunded' } : t))
    );

    setProducts((prev) =>
      prev.map((p) => {
        const returnedItem = txn.items.find((item) => item.sku === p.sku);
        if (returnedItem) {
          const restoredStock = p.currentStock + returnedItem.quantity;
          return {
            ...p,
            currentStock: restoredStock,
            salesLast30Days: Math.max(0, (p.salesLast30Days || 0) - returnedItem.quantity),
            status: restoredStock <= p.minThreshold ? 'critical' : 'healthy'
          };
        }
        return p;
      })
    );
  };

  const handleAddRecommendation = (rec: ProductRecommendation) => {
    setRecommendations((prev) => [rec, ...prev]);
  };

  const criticalSkusCount = products.filter((p) => p.status === 'critical').length;
  const currentDetailProduct = products.find((p) => p.sku === selectedSkuForDetail);

  // If NOT authenticated, show the Login / Register Gateway First!
  if (!currentUser) {
    return (
      <>
        <LoginGatewayScreen
          currentShop={currentShop}
          staffList={staffList}
          onRegisterShop={handleRegisterShop}
          onLoginSuccess={handleLoginSuccess}
          onOpenDbSchema={() => setIsDbSchemaOpen(true)}
          onShowToast={showToast}
        />
        <DbSchemaModal
          isOpen={isDbSchemaOpen}
          onClose={() => setIsDbSchemaOpen(false)}
          onShowToast={showToast}
        />
        {toastMessage && (
          <div className="fixed top-6 left-4 right-4 max-w-md mx-auto z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between border border-[#213145] animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">
                check_circle
              </span>
              <span className="text-[13px] font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/70 hover:text-white ml-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </>
    );
  }

  // Once authenticated: Render the full shop console with active role privileges
  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#dce1ff] selection:text-[#001551]">
      {/* Top Header */}
      <Header
        currentTab={activeTab}
        activeRole={currentUser.role}
        currentUser={currentUser}
        currentShop={currentShop}
        staffList={staffList}
        onRoleChange={handleRoleChange}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDbSchema={() => setIsDbSchemaOpen(true)}
        onLogout={handleLogout}
        notificationCount={criticalSkusCount}
      />

      {/* Main Content Viewport */}
      <main className="flex flex-col relative w-full pt-22 pb-24 px-4 bg-[#f8f9ff] flex-grow max-w-4xl mx-auto">
        {activeTab === 'auth-store' && (
          <AuthStoreScreen
            staffList={staffList}
            activeRole={currentUser.role}
            onAddStaff={handleAddStaff}
            onRemoveStaff={handleRemoveStaff}
            onSwitchRole={handleRoleChange}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'restock-suppliers' && (
          <RestockSuppliersScreen
            products={products}
            orders={orders}
            activeRole={currentUser.role}
            onApprovePO={handleApprovePO}
            onConfirmInwardStock={handleConfirmInwardStock}
            onSelectProductDetail={handleSelectProductDetail}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'sku-detail' && (
          <SkuDetailScreen
            product={currentDetailProduct}
            reviews={reviews}
            onAddReview={handleAddReview}
            onBack={handleBackFromDetail}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryScreen
            products={products}
            activeRole={currentUser.role}
            onSelectProduct={handleSelectProductDetail}
            onUpdateStock={handleUpdateStock}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onRemoveProduct={handleRemoveProduct}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'pos-billing' && (
          <PosBillingScreen
            products={products}
            activeRole={currentUser.role}
            transactions={transactions}
            recommendations={recommendations}
            onCompleteSale={handleCompleteSale}
            onRefundTransaction={handleRefundTransaction}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'forum' && (
          <ForumScreen
            posts={forumPosts}
            activeRole={currentUser.role}
            onAddPost={handleAddForumPost}
            onAddReply={handleAddReply}
            onToggleResolve={handleToggleResolve}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'analytics-ai' && (
          <AnalyticsScreen
            products={products}
            recommendations={recommendations}
            activeRole={currentUser.role}
            onAddRecommendation={handleAddRecommendation}
            onNavigateToRestock={() => handleTabChange('restock-suppliers')}
            onNavigateToPos={() => handleTabChange('pos-billing')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        criticalCount={criticalSkusCount}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-4 right-4 max-w-md mx-auto z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between border border-[#213145] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">
              check_circle
            </span>
            <span className="text-[13px] font-medium leading-tight">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white ml-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToRestock={() => handleTabChange('restock-suppliers')}
        onNavigateToDetail={() => handleSelectProductDetail('SKU-103')}
      />

      {/* Database Schema & Compass Modal */}
      <DbSchemaModal
        isOpen={isDbSchemaOpen}
        onClose={() => setIsDbSchemaOpen(false)}
        onShowToast={showToast}
      />
    </div>
  );
}
