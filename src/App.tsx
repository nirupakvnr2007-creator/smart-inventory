import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginGatewayScreen } from './components/screens/LoginGatewayScreen';
import { OwnerMembersScreen } from './components/screens/OwnerMembersScreen';
import { ManagerProductsScreen } from './components/screens/ManagerProductsScreen';
import { PosBillingScreen } from './components/screens/PosBillingScreen';
import { SalesTrendDashboard } from './components/screens/SalesTrendDashboard';
import { ForumScreen } from './components/screens/ForumScreen';
import { PublicCustomerFeedbackScreen } from './components/screens/PublicCustomerFeedbackScreen';
import {
  fetchServerData,
  apiSaveShop,
  apiSaveUser,
  apiDeleteUser,
  apiSaveProduct,
  apiUpdateProductStock,
  apiDeleteProduct,
  apiSaveTransaction,
  apiUpdateRestockStatus,
  apiSaveForumPost,
  apiSaveReply,
  apiSaveReview
} from './services/api';
import {
  loadStoredData,
  saveShop,
  saveUsers,
  saveProducts,
  saveRestockRequests,
  saveTransactions,
  saveForumPosts,
  saveReviews
} from './utils/storage';
import {
  ProductItem,
  UserAccount,
  ShopProfile,
  RestockRequest,
  SalesTransaction,
  SalesItem,
  ForumPost,
  CustomerReview
} from './types';

export default function App() {
  // Load initial fallback from local storage
  const [initialData] = useState(() => loadStoredData());

  const [currentShop, setCurrentShop] = useState<ShopProfile | null>(initialData.shop);
  const [users, setUsers] = useState<UserAccount[]>(initialData.users);
  const [products, setProducts] = useState<ProductItem[]>(initialData.products);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>(
    initialData.restockRequests
  );
  const [transactions, setTransactions] = useState<SalesTransaction[]>(
    initialData.transactions
  );
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialData.forumPosts);
  const [reviews, setReviews] = useState<CustomerReview[]>(initialData.reviews);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<string>('members');

  // Modals & Public Feedback Route
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeFeedbackProductId, setActiveFeedbackProductId] = useState<string | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Multi-device synchronization: Fetch server data on mount and periodically
  const syncWithServer = useCallback(async () => {
    const serverData = await fetchServerData();
    if (serverData) {
      if (serverData.shop) setCurrentShop(serverData.shop);
      if (Array.isArray(serverData.users)) setUsers(serverData.users);
      if (Array.isArray(serverData.products)) setProducts(serverData.products);
      if (Array.isArray(serverData.restockRequests)) setRestockRequests(serverData.restockRequests);
      if (Array.isArray(serverData.transactions)) setTransactions(serverData.transactions);
      if (Array.isArray(serverData.forumPosts)) setForumPosts(serverData.forumPosts);
      if (Array.isArray(serverData.reviews)) setReviews(serverData.reviews);
    }
  }, []);

  useEffect(() => {
    syncWithServer();
    // Sync every 8 seconds for multi-device live data
    const interval = setInterval(syncWithServer, 8000);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Check URL query parameters for QR code scanning (?feedback=<productId>)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const feedbackId = params.get('feedback');
      if (feedbackId) {
        setActiveFeedbackProductId(feedbackId);
      }
    }
  }, []);

  // Sync to local storage backup
  useEffect(() => {
    saveShop(currentShop);
  }, [currentShop]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveRestockRequests(restockRequests);
  }, [restockRequests]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveForumPosts(forumPosts);
  }, [forumPosts]);

  useEffect(() => {
    saveReviews(reviews);
  }, [reviews]);

  // Handle Shop Registration & User Login
  const handleRegisterShop = async (newShop: ShopProfile, owner: UserAccount) => {
    setCurrentShop(newShop);
    const updatedUsers = [owner, ...users.filter((u) => u.email !== owner.email)];
    setUsers(updatedUsers);
    setCurrentUser(owner);
    setActiveTab('members');

    // Save to server database immediately
    await apiSaveShop(newShop);
    await apiSaveUser(owner);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Route to appropriate initial screen based on assigned role
    switch (user.role) {
      case 'Helper':
        setActiveTab('dashboard');
        break;
      case 'Cashier':
        setActiveTab('billing');
        break;
      case 'Manager':
        setActiveTab('inventory');
        break;
      case 'Owner':
      default:
        setActiveTab('members');
        break;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of shop account.');
  };

  // Owner Member Management Handlers
  const handleAddMember = async (newMember: UserAccount) => {
    setUsers((prev) => [newMember, ...prev]);
    await apiSaveUser(newMember);
  };

  const handleTerminateMember = async (memberId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== memberId));
    await apiDeleteUser(memberId);
  };

  // Manager Product Management Handlers
  const handleAddProduct = async (newProduct: ProductItem) => {
    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    await apiSaveProduct(newProduct);
  };

  const handleRemoveProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setRestockRequests((prev) => prev.filter((r) => r.productId !== productId));
    await apiDeleteProduct(productId);
  };

  // Manager Stock Edit Handler (Feature: Option for manager to edit stock upon approval or anytime)
  const handleUpdateStock = async (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, availableStock: newStock } : p))
    );

    // If stock now exceeds threshold, resolve pending restock requests
    setRestockRequests((prev) =>
      prev.map((r) => {
        if (r.productId === productId && newStock > r.minThreshold) {
          return { ...r, status: 'Approved' };
        }
        return r;
      })
    );

    await apiUpdateProductStock(productId, newStock);
  };

  // Restock Approval Handler: marks approved and opens supplier mail
  const handleApproveRestock = async (request: RestockRequest) => {
    setRestockRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'Approved' } : r))
    );
    await apiUpdateRestockStatus(request.id, 'Approved');
  };

  // Cashier POS Billing Handler: records customer phone number and updates DB stock
  const handleCompleteSale = async (
    items: SalesItem[],
    subtotal: number,
    tax: number,
    total: number,
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    customerPhone: string,
    cashierName: string,
    cashierEmail: string
  ) => {
    const receiptNum = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: SalesTransaction = {
      id: `txn-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierName,
      cashierEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      paymentMethod
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Decrement available stock in local state
    const updatedProducts = products.map((p) => {
      const billed = items.find((i) => i.productId === p.id || i.sku === p.sku);
      if (billed) {
        return {
          ...p,
          availableStock: Math.max(0, p.availableStock - billed.quantity)
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    // Save transaction and decrement stock on server database
    await apiSaveTransaction(newTxn);
    syncWithServer();
  };

  // Forum Handlers
  const handleAddForumPost = async (post: ForumPost) => {
    setForumPosts((prev) => [post, ...prev]);
    await apiSaveForumPost(post);
  };

  const handleAddReply = async (
    postId: string,
    content: string,
    authorName: string,
    authorRole: UserAccount['role']
  ) => {
    const newReply = {
      id: `rep-${Date.now()}`,
      authorName,
      authorRole,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            replies: [...(p.replies || []), newReply]
          };
        }
        return p;
      })
    );

    await apiSaveReply(postId, newReply);
  };

  // Customer Reviews Handlers
  const handleAddReview = async (review: CustomerReview) => {
    setReviews((prev) => [review, ...prev]);
    await apiSaveReview(review);
  };

  const handleCloseFeedbackPage = () => {
    setActiveFeedbackProductId(null);
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const criticalCount = products.filter((p) => p.availableStock <= p.minThreshold).length;

  // 1. PUBLIC ROUTE: Customer scans packaging QR code or opens ?feedback=<productId>
  if (activeFeedbackProductId) {
    return (
      <PublicCustomerFeedbackScreen
        productId={activeFeedbackProductId}
        products={products}
        shop={currentShop}
        transactions={transactions}
        reviews={reviews}
        onAddReview={handleAddReview}
        onClose={handleCloseFeedbackPage}
        onShowToast={showToast}
      />
    );
  }

  // 2. AUTHENTICATION GATEWAY: If not signed in, show Login & Register first!
  if (!currentUser) {
    return (
      <>
        <LoginGatewayScreen
          currentShop={currentShop}
          users={users}
          onRegisterShop={handleRegisterShop}
          onLoginSuccess={handleLoginSuccess}
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

  // 3. AUTHENTICATED SHOP CONSOLE: Strictly by user's assigned role
  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#dce1ff] selection:text-[#001551]">
      {/* Top Header (Strictly without profile switching) */}
      <Header
        currentTab={activeTab}
        activeRole={currentUser.role}
        currentUser={currentUser}
        currentShop={
          currentShop || {
            id: 'shop-01',
            name: 'My Retail Shop',
            ownerName: currentUser.name,
            phone: '',
            email: currentUser.email,
            createdAt: new Date().toISOString()
          }
        }
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLogout={handleLogout}
        notificationCount={criticalCount}
      />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-20 pb-24 px-4 bg-[#f8f9ff] flex-grow max-w-4xl mx-auto">
        {/* OWNER: Members Management */}
        {activeTab === 'members' && currentUser.role === 'Owner' && (
          <OwnerMembersScreen
            currentShop={
              currentShop || {
                id: 'shop-01',
                name: 'My Retail Shop',
                ownerName: currentUser.name,
                phone: '',
                email: currentUser.email,
                createdAt: new Date().toISOString()
              }
            }
            users={users}
            currentUser={currentUser}
            onAddMember={handleAddMember}
            onTerminateMember={handleTerminateMember}
            onShowToast={showToast}
          />
        )}

        {/* MANAGER / OWNER: Product Catalog, Stock Editing, Packaging QR & Restock */}
        {(activeTab === 'inventory' || activeTab === 'restock') &&
          (currentUser.role === 'Manager' || currentUser.role === 'Owner') && (
            <ManagerProductsScreen
              products={products}
              restockRequests={restockRequests}
              currentShop={
                currentShop || {
                  id: 'shop-01',
                  name: 'My Retail Shop',
                  ownerName: currentUser.name,
                  phone: '',
                  email: currentUser.email,
                  createdAt: new Date().toISOString()
                }
              }
              activeRole={currentUser.role}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onUpdateStock={handleUpdateStock}
              onApproveRestock={handleApproveRestock}
              onShowFeedbackPage={(product) => setActiveFeedbackProductId(product.id)}
              onShowToast={showToast}
            />
          )}

        {/* CASHIER / OWNER: POS Billing Register with Mandatory Customer Phone Number */}
        {activeTab === 'billing' &&
          (currentUser.role === 'Cashier' || currentUser.role === 'Owner') && (
            <PosBillingScreen
              products={products}
              currentUser={currentUser}
              transactions={transactions}
              onCompleteSale={handleCompleteSale}
              onShowToast={showToast}
              onShowFeedbackPage={(product) => setActiveFeedbackProductId(product.id)}
            />
          )}

        {/* ALL SHOP MEMBERS: Sales Trend Dashboard */}
        {activeTab === 'dashboard' && (
          <SalesTrendDashboard
            transactions={transactions}
            products={products}
            currentUser={currentUser}
          />
        )}

        {/* ALL SHOP MEMBERS: Team Discussion Forum */}
        {activeTab === 'forum' && (
          <ForumScreen
            posts={forumPosts}
            currentUser={currentUser}
            onAddPost={handleAddForumPost}
            onAddReply={handleAddReply}
            onToggleResolve={() => {}}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Role Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        role={currentUser.role}
        criticalCount={criticalCount}
      />

      {/* Restock Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        restockRequests={restockRequests}
        products={products}
        onNavigateToRestock={() => {
          if (currentUser.role === 'Manager' || currentUser.role === 'Owner') {
            setActiveTab('restock');
          } else {
            showToast('Restock requests are managed by the Store Manager.');
          }
        }}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between border border-[#213145] animate-in fade-in slide-in-from-top-2 duration-200">
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
    </div>
  );
}
