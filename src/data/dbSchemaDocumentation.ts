export interface CollectionSchema {
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  indexes: string[];
  sampleDocument: Record<string, any>;
}

export const MONGO_DB_NAME = 'smart_inventory';

export const DATABASE_COLLECTIONS: CollectionSchema[] = [
  {
    name: 'shops',
    description: 'Stores retail shop entity, owner details, settings, and tenant isolation codes.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique document identifier' },
      { name: 'name', type: 'String', required: true, description: 'Store / Outlet legal name (e.g. GreenHarvest Supermarket)' },
      { name: 'ownerName', type: 'String', required: true, description: 'Full legal name of the registered shop owner' },
      { name: 'ownerEmail', type: 'String', required: true, description: 'Administrative email used for shop login' },
      { name: 'phone', type: 'String', required: true, description: 'Contact phone number with country code' },
      { name: 'tenantCode', type: 'String', required: true, description: 'Unique shop tenant code (e.g. GH-9840-01)' },
      { name: 'createdAt', type: 'Date', required: true, description: 'Timestamp of shop registration' }
    ],
    indexes: ['tenantCode (unique)', 'ownerEmail (unique)'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a801',
      name: 'GreenHarvest Supermarket',
      ownerName: 'Dr. Maya Chen',
      ownerEmail: 'owner@greenharvest.io',
      phone: '+91 98401 23456',
      tenantCode: 'GH-9840-01',
      createdAt: '2026-10-20T08:00:00.000Z'
    }
  },
  {
    name: 'users',
    description: 'Stores accounts for the Owner and all provisioned employees (Manager, Cashier, Helper).',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique user identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'name', type: 'String', required: true, description: 'Full name of employee' },
      { name: 'email', type: 'String', required: true, description: 'Login email address' },
      { name: 'passwordHash', type: 'String', required: true, description: 'Bcrypt hashed password or passkey' },
      { name: 'role', type: 'String', required: true, description: "Enum: 'Owner' | 'Manager' | 'Cashier' | 'Helper'" },
      { name: 'phone', type: 'String', required: false, description: 'Contact phone number' },
      { name: 'shift', type: 'String', required: false, description: 'Assigned shift schedule' },
      { name: 'status', type: 'String', required: true, description: "Enum: 'On Duty' | 'Break / Standby' | 'Off Duty'" },
      { name: 'createdAt', type: 'Date', required: true, description: 'Account creation timestamp' }
    ],
    indexes: ['email (unique)', 'shopId + role'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a802',
      shopId: 'GH-9840-01',
      name: 'Ananya Kapoor',
      email: 'ananya@greenharvest.io',
      passwordHash: '$2b$10$e8b...secureHash',
      role: 'Manager',
      phone: '+91 98401 77112',
      shift: '07:00 - 15:30 (Morning)',
      status: 'On Duty',
      createdAt: '2026-10-20T08:15:00.000Z'
    }
  },
  {
    name: 'products',
    description: 'Master catalog of all retail items, stock counts, minimum thresholds, and supplier associations.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique product document identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'sku', type: 'String', required: true, description: 'Unique SKU / Product code (e.g. SKU-103)' },
      { name: 'name', type: 'String', required: true, description: 'Product descriptive title' },
      { name: 'category', type: 'String', required: true, description: 'Catalog category (e.g. Beverages & Dairy, Pantry)' },
      { name: 'price', type: 'Number', required: true, description: 'Selling price (MRP) in INR' },
      { name: 'costPrice', type: 'Number', required: false, description: 'Wholesale cost price in INR' },
      { name: 'currentStock', type: 'Number', required: true, description: 'Current available on-shelf inventory count' },
      { name: 'minThreshold', type: 'Number', required: true, description: 'Safety stock threshold triggering auto-restock' },
      { name: 'suggestedRestock', type: 'Number', required: true, description: 'Default suggested replenishment batch volume' },
      { name: 'batchNumber', type: 'String', required: false, description: 'Packaging batch code' },
      { name: 'fssai', type: 'String', required: false, description: 'Regulatory food safety license number' },
      { name: 'supplierName', type: 'String', required: true, description: 'Name of primary fulfillment supplier' },
      { name: 'supplierEmail', type: 'String', required: true, description: 'Email address for automated PO transmission' },
      { name: 'supplierPhone', type: 'String', required: false, description: 'Supplier direct hotline' },
      { name: 'qrToken', type: 'String', required: true, description: 'Unique customer QR token string' }
    ],
    indexes: ['sku (unique per shopId)', 'shopId + category', 'currentStock + minThreshold'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a803',
      shopId: 'GH-9840-01',
      sku: 'SKU-103',
      name: 'Natural Honey 250g',
      category: 'Pantry & Sweeteners',
      price: 190,
      costPrice: 120,
      currentStock: 18,
      minThreshold: 10,
      suggestedRestock: 30,
      batchNumber: '#M-2024-H09 (Mfg: Oct 2024)',
      fssai: '10020042001928',
      supplierName: 'Apex Apiaries Direct',
      supplierEmail: 'procure@apexapiaries.com',
      supplierPhone: '+91 98401 88990',
      qrToken: 'SCAN-9842-MEPCO'
    }
  },
  {
    name: 'restock_orders',
    description: 'Tracks purchase orders generated from safety threshold breaches and inward dock confirmation.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique PO document identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'poNumber', type: 'String', required: true, description: 'PO identifier (e.g. PO-9042)' },
      { name: 'sku', type: 'String', required: true, description: 'Target SKU code' },
      { name: 'productName', type: 'String', required: true, description: 'Product title at time of order' },
      { name: 'supplier', type: 'String', required: true, description: 'Vendor company name' },
      { name: 'units', type: 'Number', required: true, description: 'Ordered quantity' },
      { name: 'status', type: 'String', required: true, description: "Enum: 'PO Email Sent' | 'Delivered & Confirmed' | 'Pending Supplier Dispatch' | 'Draft Rejected'" },
      { name: 'emailContent', type: 'String', required: false, description: 'Draft or sent email body' },
      { name: 'inwardConfirmedAt', type: 'Date', required: false, description: 'Timestamp when stock arrived at dock' }
    ],
    indexes: ['poNumber (unique)', 'shopId + status'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a804',
      shopId: 'GH-9840-01',
      poNumber: 'PO-9042',
      sku: 'SKU-044',
      productName: 'Cold Pressed Olive Oil 500ml',
      supplier: 'Mediterranean Exports',
      units: 40,
      status: 'Delivered & Confirmed',
      inwardConfirmedAt: '2026-10-20T10:45:00.000Z'
    }
  },
  {
    name: 'transactions',
    description: 'Permanent records of customer checkout transactions recorded by Cashiers.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique transaction identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'receiptNumber', type: 'String', required: true, description: 'Customer receipt ID (e.g. TXN-884910)' },
      { name: 'cashierName', type: 'String', required: true, description: 'Name of cashier who billed transaction' },
      { name: 'items', type: 'Array of Objects', required: true, description: 'List of items sold with sku, name, price, qty' },
      { name: 'subtotal', type: 'Number', required: true, description: 'Subtotal before tax & discounts' },
      { name: 'discount', type: 'Number', required: true, description: 'Applied promotional bundle discount' },
      { name: 'gst', type: 'Number', required: true, description: 'Calculated GST amount' },
      { name: 'total', type: 'Number', required: true, description: 'Final billed amount' },
      { name: 'paymentMethod', type: 'String', required: true, description: "Enum: 'UPI' | 'Cash' | 'Card'" },
      { name: 'status', type: 'String', required: true, description: "Enum: 'Completed' | 'Refunded'" },
      { name: 'createdAt', type: 'Date', required: true, description: 'Timestamp of checkout' }
    ],
    indexes: ['receiptNumber (unique)', 'shopId + createdAt', 'cashierName'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a805',
      shopId: 'GH-9840-01',
      receiptNumber: 'TXN-884910',
      cashierName: 'Rahul Joshi',
      items: [
        { sku: 'SKU-103', name: 'Natural Honey 250g', price: 190, quantity: 2 },
        { sku: 'SKU-314', name: 'Rolled Oats 1kg', price: 220, quantity: 1 }
      ],
      subtotal: 600,
      discount: 0,
      gst: 30,
      total: 630,
      paymentMethod: 'UPI',
      status: 'Completed',
      createdAt: '2026-10-20T11:20:00.000Z'
    }
  },
  {
    name: 'reviews',
    description: 'Verified customer ratings and reviews submitted via smartphone QR scan after OTP validation.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique review identifier' },
      { name: 'sku', type: 'String', required: true, description: 'Target product SKU' },
      { name: 'phoneLast4', type: 'String', required: true, description: 'Masked phone number of verified customer' },
      { name: 'rating', type: 'Number', required: true, description: '1-5 star score' },
      { name: 'tags', type: 'Array of Strings', required: true, description: 'Selected quality attributes (Freshness, Taste, etc.)' },
      { name: 'content', type: 'String', required: true, description: 'Written customer feedback' },
      { name: 'isQrVerified', type: 'Boolean', required: true, description: 'Whether SMS OTP gate was completed' },
      { name: 'createdAt', type: 'Date', required: true, description: 'Timestamp of submission' }
    ],
    indexes: ['sku + rating', 'createdAt'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a806',
      sku: 'SKU-103',
      phoneLast4: '3210',
      rating: 5,
      tags: ['Freshness', 'Taste'],
      content: 'Remarkable consistency. No crystallization around the rim and the natural wildflower aroma is evident.',
      isQrVerified: true,
      createdAt: '2026-10-20T09:30:00.000Z'
    }
  },
  {
    name: 'forum_posts',
    description: 'Internal shop bulletin where Owner, Manager, Cashier, and Helper communicate.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique post identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'author', type: 'String', required: true, description: 'Name of posting staff member' },
      { name: 'role', type: 'String', required: true, description: "Enum: 'Owner' | 'Manager' | 'Cashier' | 'Helper'" },
      { name: 'title', type: 'String', required: true, description: 'Thread headline' },
      { name: 'content', type: 'String', required: true, description: 'Post body' },
      { name: 'tag', type: 'String', required: true, description: "Enum: 'Restock Flag' | 'Floor Alert' | 'Shift Handover' | 'Customer Query'" },
      { name: 'resolved', type: 'Boolean', required: true, description: 'Whether the operational flag has been resolved' },
      { name: 'replies', type: 'Array of Objects', required: false, description: 'Nested thread responses' }
    ],
    indexes: ['shopId + tag', 'resolved'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a807',
      shopId: 'GH-9840-01',
      author: 'Siddharth Varma (Helper)',
      role: 'Helper',
      title: 'Aisle 2 Beverage Cooler: Almond milk down to last 4 cartons',
      content: 'Checked backroom storage and no buffer units remaining. Raised flag for urgent supplier shipment confirmation.',
      tag: 'Restock Flag',
      resolved: false,
      replies: [
        {
          author: 'Ananya Kapoor (Manager)',
          role: 'Manager',
          content: 'Confirmed Siddharth. Draft PO-9043 generated for 50 units.',
          timestamp: '10 mins ago'
        }
      ]
    }
  },
  {
    name: 'recommendations',
    description: 'AI-generated product combination bundles pairing high-velocity items with slow movers.',
    fields: [
      { name: '_id', type: 'ObjectId', required: true, description: 'Unique recommendation identifier' },
      { name: 'shopId', type: 'String', required: true, description: 'Associated shop tenant code' },
      { name: 'title', type: 'String', required: true, description: 'Bundle marketing title' },
      { name: 'leadSku', type: 'String', required: true, description: 'Anchor SKU (High velocity)' },
      { name: 'pairSku', type: 'String', required: true, description: 'Paired SKU (Slower velocity)' },
      { name: 'bundlePrice', type: 'Number', required: true, description: 'Combined discounted price' },
      { name: 'originalPrice', type: 'Number', required: true, description: 'Sum of individual MRPs' },
      { name: 'discountPercent', type: 'Number', required: true, description: 'Promotional discount percentage' },
      { name: 'rationale', type: 'String', required: true, description: 'AI business logic and affinity explanation' },
      { name: 'predictedSalesLift', type: 'String', required: true, description: 'Expected volume and profit lift' },
      { name: 'status', type: 'String', required: true, description: "Enum: 'Active' | 'Proposed' | 'Implemented'" }
    ],
    indexes: ['shopId + status'],
    sampleDocument: {
      _id: '6715f1a9e8b2c4d5e6f7a808',
      shopId: 'GH-9840-01',
      title: 'Morning Vitality Bundle',
      leadSku: 'SKU-103',
      pairSku: 'SKU-314',
      originalPrice: 410,
      bundlePrice: 360,
      discountPercent: 12,
      rationale: 'Natural Honey sells 210 units/mo while Rolled Oats has slowed to 76 units. Bundling generates cross-category pull.',
      predictedSalesLift: '+38% Oats Volume, +₹8,400 monthly margin',
      status: 'Active'
    }
  }
];
