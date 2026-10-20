import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginGatewayScreen } from './components/screens/LoginGatewayScreen';
import { OwnerMembersScreen } from './components/screens/OwnerMembersScreen';
import { ManagerProductsScreen } from './components/screens/ManagerProductsScreen';
import { PosBillingScreen } from './components/screens/PosBillingScreen';
import { SalesTrendDashboard } from './components/screens/SalesTrendDashboard';
import { ForumScreen } from './components/screens/ForumScreen';
import { CustomerFeedbackModal } from './components/screens/CustomerFeedbackModal';
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
  CustomerReview,
  RoleType
} from './types';

export default function App() {
  // Load data from persistent local storage
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

  // Authentication & Active Session State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<string>('members');

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [feedbackModalProduct, setFeedbackModalProduct] = useState<ProductItem | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Persist data whenever state changes
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

  // Automatic restock verification: check if any product dropped to or below threshold
  const triggerThresholdRestockCheck = (
    currentProds: ProductItem[],
    currentReqs: RestockRequest[]
  ) => {
    const updatedReqs = [...currentReqs];
    let newlyCreated = 0;

    currentProds.forEach((prod) => {
      if (prod.availableStock <= prod.minThreshold) {
        const hasPending = updatedReqs.some(
          (r) => r.productId === prod.id && r.status === 'Pending'
        );
        if (!hasPending) {
          updatedReqs.unshift({
            id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            productName: prod.name,
            brand: prod.brand,
            currentStock: prod.availableStock,
            minThreshold: prod.minThreshold,
            requestedQuantity: prod.minThreshold,
            supplierName: prod.supplierName,
            supplierEmail: prod.supplierEmail,
            supplierPhone: prod.supplierPhone,
            status: 'Pending',
            createdAt: new Date().toISOString()
          });
          newlyCreated++;
        }
      }
    });

    if (newlyCreated > 0) {
      setRestockRequests(updatedReqs);
      showToast(
        `Restock Alert: ${newlyCreated} product(s) dropped below minimum threshold. Automated PO request generated for Manager.`
      );
    }
  };

  // Handlers for Shop Registration & User Login
  const handleRegisterShop = (newShop: ShopProfile, owner: UserAccount) => {
    setCurrentShop(newShop);
    const updatedUsers = [owner, ...users.filter((u) => u.email !== owner.email)];
    setUsers(updatedUsers);
    setCurrentUser(owner);
    setActiveTab('members');
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Route by role
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

  const handleRoleChange = (role: RoleType) => {
    const matching = users.find((u) => u.role === role);
    if (matching) {
      setCurrentUser(matching);
      showToast(`Switched active profile to ${matching.name} (${matching.role}).`);
      if (role === 'Helper' && (activeTab === 'inventory' || activeTab === 'billing' || activeTab === 'members')) {
        setActiveTab('dashboard');
      } else if (role === 'Cashier' && activeTab === 'members') {
        setActiveTab('billing');
      }
    } else {
      showToast(`No registered account found with role ${role}.`);
    }
  };

  // Owner Member Management Handlers
  const handleAddMember = (newMember: UserAccount) => {
    setUsers((prev) => [newMember, ...prev]);
  };

  const handleTerminateMember = (memberId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== memberId));
  };

  // Manager Product Management Handlers
  const handleAddProduct = (newProduct: ProductItem) => {
    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    // Check if new product was added with initial stock below threshold
    triggerThresholdRestockCheck(nextProducts, restockRequests);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setRestockRequests((prev) => prev.filter((r) => r.productId !== productId));
  };

  // Restock Approval: marks approved and opens supplier mail
  const handleApproveRestock = (request: RestockRequest) => {
    setRestockRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'Approved' } : r))
    );
  };

  // Cashier POS Billing Handlers: Updates DB stock and generates restock requests
  const handleCompleteSale = (
    items: SalesItem[],
    subtotal: number,
    tax: number,
    total: number,
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    cashierName: string,
    cashierEmail: string
  ) => {
    // 1. Record transaction in DB
    const receiptNum = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: SalesTransaction = {
      id: `txn-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierName,
      cashierEmail,
      items,
      subtotal,
      tax,
      total,
      paymentMethod
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // 2. Decrement available stock in DB
    const updatedProducts = products.map((p) => {
      const billed = items.find((i) => i.productId === p.id);
      if (billed) {
        return {
          ...p,
          availableStock: Math.max(0, p.availableStock - billed.quantity)
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    // 3. Automatically check if any product dropped below minimum threshold
    triggerThresholdRestockCheck(updatedProducts, restockRequests);
  };

  // Forum Handlers
  const handleAddForumPost = (post: ForumPost) => {
    setForumPosts((prev) => [post, ...prev]);
  };

  const handleAddReply = (
    postId: string,
    content: string,
    authorName: string,
    authorRole: RoleType
  ) => {
    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newReply = {
            id: `rep-${Date.now()}`,
            authorName,
            authorRole,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          return {
            ...p,
            replies: [...(p.replies || []), newReply]
          };
        }
        return p;
      })
    );
  };

  // Reviews
  const handleAddReview = (review: CustomerReview) => {
    setReviews((prev) => [review, ...prev]);
  };

  const criticalCount = products.filter((p) => p.availableStock <= p.minThreshold).length;

  // 1. IF NOT LOGGED IN: Open Login & Registration Gateway first!
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

  // 2. ONCE LOGGED IN: Render full shop management interface by role
  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#dce1ff] selection:text-[#001551]">
      {/* Top Header */}
      <Header
        currentTab={activeTab}
        activeRole={currentUser.role}
        currentUser={currentUser}
        currentShop={currentShop || {
          id: 'shop-01',
          name: 'My Retail Shop',
          ownerName: currentUser.name,
          phone: '',
          email: currentUser.email,
          createdAt: new Date().toISOString()
        }}
        staffList={users}
        onRoleChange={handleRoleChange}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLogout={handleLogout}
        notificationCount={criticalCount}
      />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-20 pb-24 px-4 bg-[#f8f9ff] flex-grow max-w-4xl mx-auto">
        {/* OWNER: Members Management */}
        {activeTab === 'members' && currentUser.role === 'Owner' && (
          <OwnerMembersScreen
            currentShop={currentShop || {
              id: 'shop-01',
              name: 'My Retail Shop',
              ownerName: currentUser.name,
              phone: '',
              email: currentUser.email,
              createdAt: new Date().toISOString()
            }}
            users={users}
            currentUser={currentUser}
            onAddMember={handleAddMember}
            onTerminateMember={handleTerminateMember}
            onShowToast={showToast}
          />
        )}

        {/* MANAGER / OWNER: Product Catalog & Restock Requests */}
        {(activeTab === 'inventory' || activeTab === 'restock') &&
          (currentUser.role === 'Manager' || currentUser.role === 'Owner') && (
            <ManagerProductsScreen
              products={products}
              restockRequests={restockRequests}
              currentShop={currentShop || {
                id: 'shop-01',
                name: 'My Retail Shop',
                ownerName: currentUser.name,
                phone: '',
                email: currentUser.email,
                createdAt: new Date().toISOString()
              }}
              activeRole={currentUser.role}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onApproveRestock={handleApproveRestock}
              onShowFeedbackPage={(product) => setFeedbackModalProduct(product)}
              onShowToast={showToast}
            />
          )}

        {/* CASHIER / OWNER: POS Billing Register */}
        {activeTab === 'billing' &&
          (currentUser.role === 'Cashier' || currentUser.role === 'Owner') && (
            <PosBillingScreen
              products={products}
              currentUser={currentUser}
              transactions={transactions}
              onCompleteSale={handleCompleteSale}
              onShowToast={showToast}
              onShowFeedbackPage={(product) => setFeedbackModalProduct(product)}
            />
          )}

        {/* ALL MEMBERS: Sales Trend Dashboard */}
        {activeTab === 'dashboard' && (
          <SalesTrendDashboard
            transactions={transactions}
            products={products}
            currentUser={currentUser}
          />
        )}

        {/* ALL MEMBERS: Discussion Forum */}
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

      {/* Dynamic Role Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        role={currentUser.role}
        criticalCount={criticalCount}
      />

      {/* Customer Packaging QR Feedback Modal */}
      {feedbackModalProduct && (
        <CustomerFeedbackModal
          product={feedbackModalProduct}
          reviews={reviews}
          onAddReview={handleAddReview}
          onClose={() => setFeedbackModalProduct(null)}
          onShowToast={showToast}
        />
      )}

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
