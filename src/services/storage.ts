import QRCode from 'qrcode';
import {
  ShopProfile,
  MemberAccount,
  Product,
  RestockRequest,
  SaleTransaction,
  ForumTopic,
  ProductFeedback
} from '../types';

const STORAGE_KEYS = {
  SHOP: 'smart_inventory_shop',
  MEMBERS: 'smart_inventory_members',
  PRODUCTS: 'smart_inventory_products',
  RESTOCK: 'smart_inventory_restock',
  SALES: 'smart_inventory_sales',
  FORUM: 'smart_inventory_forum',
  FEEDBACK: 'smart_inventory_feedback',
  CURRENT_USER: 'smart_inventory_session_user'
};

export const StorageService = {
  getShop(): ShopProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP);
    return raw ? JSON.parse(raw) : null;
  },

  saveShop(shop: ShopProfile): void {
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(shop));
  },

  getMembers(): MemberAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return raw ? JSON.parse(raw) : [];
  },

  saveMembers(members: MemberAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getRestockRequests(): RestockRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESTOCK);
    return raw ? JSON.parse(raw) : [];
  },

  saveRestockRequests(requests: RestockRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.RESTOCK, JSON.stringify(requests));
  },

  getSales(): SaleTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : [];
  },

  saveSales(sales: SaleTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getForumTopics(): ForumTopic[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FORUM);
    return raw ? JSON.parse(raw) : [];
  },

  saveForumTopics(topics: ForumTopic[]): void {
    localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(topics));
  },

  getFeedbacks(): ProductFeedback[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    return raw ? JSON.parse(raw) : [];
  },

  saveFeedbacks(feedbacks: ProductFeedback[]): void {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
  },

  getCurrentUser(): MemberAccount | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: MemberAccount | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  async generateProductQR(productId: string, productName: string, brand: string): Promise<string> {
    const payload = JSON.stringify({
      app: 'SmartInventory',
      id: productId,
      name: productName,
      brand: brand,
      feedbackUrl: `${window.location.origin}/?feedback=${productId}`
    });
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0037b0',
        light: '#ffffff'
      }
    });
  }
};
