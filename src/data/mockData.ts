import {
  ProductItem,
  StaffMember,
  RestockOrder,
  CustomerReview,
  ForumPost,
  SalesTransaction,
  ProductRecommendation
} from '../types';

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-102',
    sku: 'SKU-102',
    name: 'Organic Almond Milk 1L',
    category: 'Beverages & Dairy',
    price: 240,
    costPrice: 175,
    currentStock: 4,
    minThreshold: 15,
    suggestedRestock: 50,
    runDays: 14,
    batchNumber: '#M-2024-AM02 (Mfg: Sep 2024)',
    mfgDate: 'Sep 2024',
    fssai: '10020042001888',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLYt9TqM99FjEZPa-xY2gbw1hfjQE4VMEswOLgPVV7UTY3zA1awSkNWl2OsgQVIMX2RI8JwPi1dbo5HPoqZhGNrPNAZYUU4FLIx20UY6jcXaN1D7L_SVEGyYojBJm7fmQW0CqWjrOtkDCzG7v2qBRfUya83gTdUDglLeyvsRBeuB2LRnbW_WxSZD82K-LhGZaLNNFQRNPJnBcBKvQ1k0yg-vwiHPN52grYwX4yfJxHIDiYOx1A8Uo2BA',
    supplierName: 'GreenFarms Logistics',
    supplierEmail: 'orders@greenfarms.in',
    supplierPhone: '+91 98402 11223',
    supplierId: 'VEND-994',
    status: 'critical',
    unit: 'units',
    rating: 4.6,
    reviewCount: 142,
    salesLast30Days: 148
  },
  {
    id: 'prod-103',
    sku: 'SKU-103',
    name: 'Natural Honey 250g',
    category: 'Pantry & Sweeteners',
    price: 190,
    costPrice: 120,
    currentStock: 18,
    minThreshold: 10,
    suggestedRestock: 30,
    runDays: 20,
    batchNumber: '#M-2024-H09 (Mfg: Oct 2024)',
    mfgDate: 'Oct 2024',
    fssai: '10020042001928',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6dT1NxscPm63CA_-PtKC_--63OKW-6xUP59o2swHkhdSVAW7uRT9z-vm4uVxuCD3ilSx4jvss6RGbAaC4MJuk5oTivjJ-zbDJdHCbIx8bfjR3NztR4Atuj6sONsHnkyO-63yMfgwF1mFh0ytqYv5CPl9trATrhatGvkbV7FkbIZJBt6DRUJsp8o0Qd67JCmmlOy6CrHDMNaRF5KPKBXidIgfqv5z03DgGB5NMZaDYJyu4lBg1hPi6RA',
    supplierName: 'Apex Apiaries Direct',
    supplierEmail: 'procure@apexapiaries.com',
    supplierPhone: '+91 98401 88990',
    supplierId: 'VEND-712',
    status: 'healthy',
    unit: 'units',
    rating: 4.8,
    reviewCount: 328,
    salesLast30Days: 210
  },
  {
    id: 'prod-208',
    sku: 'SKU-208',
    name: 'Wildflower Honey 500g',
    category: 'Pantry & Sweeteners',
    price: 380,
    costPrice: 260,
    currentStock: 2,
    minThreshold: 12,
    suggestedRestock: 30,
    runDays: 8,
    batchNumber: '#M-2024-WH01 (Mfg: Aug 2024)',
    mfgDate: 'Aug 2024',
    fssai: '10020042001928',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ5BKpqeeItBUASk0HjZfUJ0YqIUhr_mjr4wdZNFwYVLQ_jz2TmEjzpISvyoUfirmXIKVZGvU9lKJEKo1LliUY9H3xx8kucFOyMBHKQtLziaDLo2MnQHwRuW5JxttvFlr9ZgglNBSDg3inpBKSUWn1Y-vsFgWCiXRUsiypXdyiuCOGziE4cnJufG0e7YQi9m3K1dTJxPY36gUcCA_ZO9GP0xnNYlKBCEGu1Fbhtb3nh5NGPP8MkLqjeg',
    supplierName: 'Himalayan Nectar Corp',
    supplierEmail: 'orders@himalayan-nectar.com',
    supplierPhone: '+91 98403 44556',
    supplierId: 'VEND-401',
    status: 'critical',
    unit: 'units',
    rating: 4.7,
    reviewCount: 89,
    salesLast30Days: 92
  },
  {
    id: 'prod-314',
    sku: 'SKU-314',
    name: 'Rolled Oats 1kg',
    category: 'Grains & Cereals',
    price: 220,
    costPrice: 150,
    currentStock: 5,
    minThreshold: 20,
    suggestedRestock: 100,
    runDays: 12,
    batchNumber: '#M-2024-RO04 (Mfg: Sep 2024)',
    mfgDate: 'Sep 2024',
    fssai: '10020042002155',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBr4uGcaQKmlsGTbHwGtxQowTNVxGDieezprPHErHMQVm-8ZOXALDUaWVph_ZkkQs9Udqfs31MPZj-xr0JNRb2deI2t66E7JCPs-W8opf-fsOYztR8KhftQmOBx_zQm3LaO6FfEgzY7SYCkN25_eijeT1paVV6Ehexs1OXtqf8OGyXYnLeQbjs-DXsltTsxD9aPLLoY6App51TaUnS6rgPvdUBmzoS2Yp1BjKptwBVIs-g3KwQvJ093Bw',
    supplierName: 'GrainCraft Mills',
    supplierEmail: 'supply@graincraftmills.in',
    supplierPhone: '+91 98404 77889',
    supplierId: 'VEND-209',
    status: 'low',
    unit: 'units',
    rating: 4.5,
    reviewCount: 215,
    salesLast30Days: 76
  },
  {
    id: 'prod-044',
    sku: 'SKU-044',
    name: 'Cold Pressed Olive Oil 500ml',
    category: 'Oils & Sauces',
    price: 550,
    costPrice: 400,
    currentStock: 48,
    minThreshold: 15,
    suggestedRestock: 40,
    runDays: 28,
    batchNumber: '#M-2024-OO12 (Mfg: Oct 2024)',
    mfgDate: 'Oct 2024',
    fssai: '10020042003310',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    supplierName: 'Mediterranean Exports',
    supplierEmail: 'orders@mediterranean-exports.com',
    supplierPhone: '+91 98405 11992',
    supplierId: 'VEND-810',
    status: 'healthy',
    unit: 'units',
    rating: 4.9,
    reviewCount: 174,
    salesLast30Days: 62
  },
  {
    id: 'prod-089',
    sku: 'SKU-089',
    name: 'Greek Yogurt Natural 400g',
    category: 'Beverages & Dairy',
    price: 120,
    costPrice: 85,
    currentStock: 32,
    minThreshold: 15,
    suggestedRestock: 40,
    runDays: 10,
    batchNumber: '#M-2024-GY03 (Mfg: Oct 2024)',
    mfgDate: 'Oct 2024',
    fssai: '10020042004122',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
    supplierName: 'DairyPure Direct',
    supplierEmail: 'orders@dairypure.in',
    supplierPhone: '+91 98406 33112',
    supplierId: 'VEND-655',
    status: 'healthy',
    unit: 'units',
    rating: 4.7,
    reviewCount: 98,
    salesLast30Days: 185
  },
  {
    id: 'prod-117',
    sku: 'SKU-117',
    name: 'Cold Brew Concentrate 1L',
    category: 'Beverages & Dairy',
    price: 290,
    costPrice: 200,
    currentStock: 14,
    minThreshold: 12,
    suggestedRestock: 25,
    runDays: 16,
    batchNumber: '#M-2024-CB09 (Mfg: Sep 2024)',
    mfgDate: 'Sep 2024',
    fssai: '10020042005882',
    imageUrl:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80',
    supplierName: 'RoastCraft Distro',
    supplierEmail: 'wholesale@roastcraft.io',
    supplierPhone: '+91 98407 66221',
    supplierId: 'VEND-319',
    status: 'healthy',
    unit: 'units',
    rating: 4.6,
    reviewCount: 64,
    salesLast30Days: 54
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-owner',
    name: 'Dr. Maya Chen',
    email: 'owner@greenharvest.io',
    role: 'Owner',
    shift: 'General Oversight',
    status: 'On Duty',
    initials: 'MC',
    phone: '+91 98401 23456'
  },
  {
    id: 'staff-1',
    name: 'Ananya Kapoor',
    email: 'ananya@greenharvest.io',
    role: 'Manager',
    shift: '07:00 - 15:30 (Morning)',
    status: 'On Duty',
    initials: 'AK',
    phone: '+91 98401 77112'
  },
  {
    id: 'staff-2',
    name: 'Rahul Joshi',
    email: 'pos.lane2@greenharvest.io',
    role: 'Cashier',
    shift: '08:30 - 17:00 (Terminal 02)',
    status: 'On Duty',
    initials: 'RJ',
    phone: '+91 98401 55331'
  },
  {
    id: 'staff-3',
    name: 'Siddharth Varma',
    email: 'floor.support@greenharvest.io',
    role: 'Helper',
    shift: '13:00 - 21:30 (Evening)',
    status: 'Break / Standby',
    initials: 'SV',
    phone: '+91 98401 99882'
  }
];

export const INITIAL_RESTOCK_ORDERS: RestockOrder[] = [
  {
    id: 'ro-1',
    poNumber: 'PO-9042',
    sku: 'SKU-044',
    productName: 'Cold Pressed Olive Oil 500ml',
    supplier: 'Mediterranean Exports',
    supplierEmail: 'orders@mediterranean-exports.com',
    units: 40,
    status: 'Delivered & Confirmed',
    timestamp: 'Today, 10:45 AM',
    statusNote: '+40 units credited to MongoDB'
  },
  {
    id: 'ro-2',
    poNumber: 'PO-9041',
    sku: 'SKU-089',
    productName: 'Greek Yogurt Natural 400g',
    supplier: 'DairyPure Direct',
    supplierEmail: 'orders@dairypure.in',
    units: 40,
    status: 'PO Email Sent',
    timestamp: 'Yesterday, 4:20 PM',
    statusNote: 'Supplier ACK Received'
  },
  {
    id: 'ro-3',
    poNumber: 'PO-9039',
    sku: 'SKU-117',
    productName: 'Cold Brew Concentrate 1L',
    supplier: 'RoastCraft Distro',
    supplierEmail: 'wholesale@roastcraft.io',
    units: 25,
    status: 'Pending Supplier Dispatch',
    timestamp: 'Yesterday, 11:15 AM',
    statusNote: 'ETA: Tomorrow Morning'
  }
];

export const INITIAL_REVIEWS_SKU_103: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Pooja Sharma',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJS2RKAQvmnttk8QsgrfgAmDDwLYckXX7xDuofa8XqeihldHKADibzoYuFjRq_Q2cjjerxsVWpDNCmjCBycQQc-HfIgKnGTBV9_srAuSiBik_fk_WtlyRq47svex5lgG5cVqpsoJV0R4ydzO0rwJaVGeTaQ-qp82j1xYj8QJfIS8R4nQfj5OEZuMvfgKFU49wdAJLGowd650kpEIUNW7Xw7eaYR-jrACPK-G6wlXuYDHQG6XX4kf-2yQ',
    rating: 5,
    timestamp: 'Verified Buyer • 2 hours ago',
    content:
      'Remarkable consistency. No crystallization around the rim and the natural wildflower aroma is evident. Very happy with the Mepco quick QR audit system.',
    tags: ['Freshness', 'Taste'],
    isQrVerified: true,
    phoneLast4: '3210',
    productSku: 'SKU-103'
  },
  {
    id: 'rev-2',
    author: 'Arjun Nair',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqkOHZD1Lr57dlVkQKLtHb5UXVjGLX_KHXaDB1UUJVNsfVd4Egl_kf8IGUWcLylygTTAAgB2YA9J46TOJiw6VpJ4x1XcYg82W-9ug9AQZZZslw-GC4yz4yDmlLJcK_ccc5ZqYJwRM2jYCND_4-0LYXTdj9cRjOKxAJAwE_0CbNKh-SRzF6sjYBDiUInOmR_FlvCKp5n112D10oRRQ_ubahKHSzKknoAxmtmjMKEHAmc38_uVymYjBuA',
    rating: 4,
    timestamp: 'Verified Buyer • Yesterday',
    content:
      'Solid product at ₹190. Sturdy packaging with leakproof induction seal. Batch details on packaging matched the scanner accurately.',
    tags: ['Packaging Quality', 'Value for Money'],
    isQrVerified: true,
    phoneLast4: '9840',
    productSku: 'SKU-103'
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'forum-1',
    author: 'Siddharth Varma',
    role: 'Helper',
    initials: 'SV',
    timestamp: '15 mins ago',
    title: 'Aisle 2 Beverage Cooler: Almond milk down to last 4 cartons',
    content:
      'Checked backroom storage and no buffer units remaining. Raised flag for urgent supplier shipment confirmation.',
    tag: 'Restock Flag',
    resolved: false,
    replies: [
      {
        id: 'rep-1',
        author: 'Ananya Kapoor',
        role: 'Manager',
        content:
          'Confirmed Siddharth. Draft PO-9043 generated for 50 units. Reaching out to GreenFarms now.',
        timestamp: '10 mins ago'
      }
    ]
  },
  {
    id: 'forum-2',
    author: 'Ananya Kapoor',
    role: 'Manager',
    initials: 'AK',
    timestamp: '40 mins ago',
    title: 'Approved PO-9043 for GreenFarms Logistics (50 Units Almond Milk)',
    content:
      'Automated PO sent via verified SMTP. Expected dock intake tomorrow 09:00. Bay 4 cleared.',
    tag: 'Floor Alert',
    resolved: true,
    replies: [
      {
        id: 'rep-2',
        author: 'Dr. Maya Chen',
        role: 'Owner',
        content: 'Good initiative. Let us monitor weekend morning traffic closely.',
        timestamp: '25 mins ago'
      }
    ]
  },
  {
    id: 'forum-3',
    author: 'Rahul Joshi',
    role: 'Cashier',
    initials: 'RJ',
    timestamp: '2 hours ago',
    title: 'Honey batch QR tags scanned smoothly at POS counter',
    content:
      'Customers scanning shelf QR tokens for batch freshness certificates. Good feedback on the digital seal check.',
    tag: 'Customer Query',
    resolved: true
  }
];

export const INITIAL_TRANSACTIONS: SalesTransaction[] = [
  {
    id: 'TXN-884910',
    timestamp: 'Today, 11:20 AM',
    cashierName: 'Rahul Joshi',
    items: [
      { sku: 'SKU-103', name: 'Natural Honey 250g', price: 190, quantity: 2 },
      { sku: 'SKU-314', name: 'Rolled Oats 1kg', price: 220, quantity: 1 }
    ],
    subtotal: 600,
    gst: 30,
    discount: 0,
    total: 630,
    paymentMethod: 'UPI',
    status: 'Completed'
  },
  {
    id: 'TXN-884909',
    timestamp: 'Today, 10:45 AM',
    cashierName: 'Rahul Joshi',
    items: [
      { sku: 'SKU-089', name: 'Greek Yogurt Natural 400g', price: 120, quantity: 3 }
    ],
    subtotal: 360,
    gst: 18,
    discount: 0,
    total: 378,
    paymentMethod: 'Card',
    status: 'Completed'
  },
  {
    id: 'TXN-884890',
    timestamp: 'Today, 09:15 AM',
    cashierName: 'Rahul Joshi',
    items: [
      { sku: 'SKU-102', name: 'Organic Almond Milk 1L', price: 240, quantity: 1 },
      { sku: 'SKU-103', name: 'Natural Honey 250g', price: 190, quantity: 1 }
    ],
    subtotal: 430,
    gst: 22,
    discount: 40,
    total: 412,
    paymentMethod: 'Cash',
    status: 'Completed'
  }
];

export const INITIAL_RECOMMENDATIONS: ProductRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Morning Vitality Bundle',
    leadSku: 'SKU-103', // Natural Honey (High mover)
    pairSku: 'SKU-314', // Rolled Oats (Underperforming/Slow mover)
    originalPrice: 410,
    bundlePrice: 360,
    discountPercent: 12,
    rationale:
      'Natural Honey sells 210 units/mo while Rolled Oats has slowed to 76 units. Analysis shows 42% of honey shoppers also browse breakfast cereal aisles. Bundling generates cross-category pull.',
    predictedSalesLift: '+38% Oats Volume, +₹8,400 monthly margin',
    status: 'Active'
  },
  {
    id: 'rec-2',
    title: 'Barista Wellness Pair',
    leadSku: 'SKU-102', // Almond Milk (High velocity)
    pairSku: 'SKU-117', // Cold Brew Concentrate (Moderate)
    originalPrice: 530,
    bundlePrice: 480,
    discountPercent: 10,
    rationale:
      'Plant milk and cold brew concentrate share a 68% cart co-occurrence during weekend mornings. Promoted pairing increases basket size from ₹240 to ₹480.',
    predictedSalesLift: '+24% Cold Brew Turnover, 18-day inventory clearance',
    status: 'Proposed'
  }
];
