import {
  ShopProfile,
  UserAccount,
  ProductItem,
  RestockRequest,
  SalesTransaction,
  ForumPost,
  CustomerReview
} from '../types';

const STORAGE_KEYS = {
  SHOP: 'smart_inventory_shop',
  USERS: 'smart_inventory_users',
  PRODUCTS: 'smart_inventory_products',
  RESTOCK: 'smart_inventory_restock',
  TRANSACTIONS: 'smart_inventory_transactions',
  FORUM: 'smart_inventory_forum',
  REVIEWS: 'smart_inventory_reviews'
};

export function loadStoredData() {
  const shopJson = localStorage.getItem(STORAGE_KEYS.SHOP);
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  const productsJson = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  const restockJson = localStorage.getItem(STORAGE_KEYS.RESTOCK);
  const transactionsJson = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const forumJson = localStorage.getItem(STORAGE_KEYS.FORUM);
  const reviewsJson = localStorage.getItem(STORAGE_KEYS.REVIEWS);

  return {
    shop: shopJson ? (JSON.parse(shopJson) as ShopProfile) : null,
    users: usersJson ? (JSON.parse(usersJson) as UserAccount[]) : [],
    products: productsJson ? (JSON.parse(productsJson) as ProductItem[]) : [],
    restockRequests: restockJson ? (JSON.parse(restockJson) as RestockRequest[]) : [],
    transactions: transactionsJson ? (JSON.parse(transactionsJson) as SalesTransaction[]) : [],
    forumPosts: forumJson ? (JSON.parse(forumJson) as ForumPost[]) : [],
    reviews: reviewsJson ? (JSON.parse(reviewsJson) as CustomerReview[]) : []
  };
}

export function saveShop(shop: ShopProfile | null) {
  if (shop) {
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(shop));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SHOP);
  }
}

export function saveUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function saveProducts(products: ProductItem[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function saveRestockRequests(requests: RestockRequest[]) {
  localStorage.setItem(STORAGE_KEYS.RESTOCK, JSON.stringify(requests));
}

export function saveTransactions(transactions: SalesTransaction[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function saveForumPosts(posts: ForumPost[]) {
  localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts));
}

export function saveReviews(reviews: CustomerReview[]) {
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
