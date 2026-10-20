export type RoleType = 'Owner' | 'Manager' | 'Cashier' | 'Helper';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  shift: string;
  status: 'On Duty' | 'Break / Standby' | 'Off Duty';
  initials: string;
  phone?: string;
  pinCode?: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  currentStock: number;
  minThreshold: number;
  suggestedRestock: number;
  runDays: number;
  batchNumber?: string;
  mfgDate?: string;
  fssai?: string;
  imageUrl: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierId: string;
  status: 'critical' | 'low' | 'healthy';
  unit: string;
  rating?: number;
  reviewCount?: number;
  qrCodeUrl?: string;
  salesLast30Days?: number;
}

export interface RestockOrder {
  id: string;
  poNumber: string;
  sku: string;
  productName: string;
  supplier: string;
  supplierEmail: string;
  units: number;
  status: 'Delivered & Confirmed' | 'PO Email Sent' | 'Pending Supplier Dispatch' | 'Draft Rejected';
  timestamp: string;
  statusNote: string;
  emailContent?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  avatarUrl: string;
  rating: number;
  timestamp: string;
  content: string;
  tags: string[];
  isQrVerified: boolean;
  phoneLast4?: string;
  productSku?: string;
}

export interface ForumPost {
  id: string;
  author: string;
  role: RoleType;
  initials: string;
  timestamp: string;
  title: string;
  content: string;
  tag: 'Restock Flag' | 'Floor Alert' | 'Shift Handover' | 'Customer Query';
  resolved?: boolean;
  replies?: Array<{
    id: string;
    author: string;
    role: RoleType;
    content: string;
    timestamp: string;
  }>;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface SalesTransaction {
  id: string;
  timestamp: string;
  cashierName: string;
  items: Array<{
    sku: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  paymentMethod: 'UPI' | 'Cash' | 'Card';
  status: 'Completed' | 'Refunded';
}

export interface ProductRecommendation {
  id: string;
  title: string;
  leadSku: string;
  pairSku: string;
  bundlePrice: number;
  originalPrice: number;
  discountPercent: number;
  rationale: string;
  predictedSalesLift: string;
  status: 'Active' | 'Proposed' | 'Implemented';
}
