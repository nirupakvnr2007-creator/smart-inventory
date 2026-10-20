import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

interface DbSchema {
  shop: any | null;
  users: any[];
  products: any[];
  restockRequests: any[];
  transactions: any[];
  forumPosts: any[];
  reviews: any[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'smart_inventory_db.json');

function ensureDbFile(): DbSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const defaultDb: DbSchema = {
    shop: null,
    users: [],
    products: [],
    restockRequests: [],
    transactions: [],
    forumPosts: [],
    reviews: []
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB_FILE, resetting to default', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function writeDbFile(data: DbSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // 1. GET ALL DATA (Synchronizes all devices immediately)
  app.get('/api/data', (_req, res) => {
    const db = ensureDbFile();
    res.json(db);
  });

  // 2. SHOP ENDPOINT
  app.post('/api/shop', (req, res) => {
    const db = ensureDbFile();
    db.shop = req.body;
    writeDbFile(db);
    res.json({ success: true, shop: db.shop });
  });

  // 3. USERS ENDPOINTS
  app.post('/api/users', (req, res) => {
    const db = ensureDbFile();
    const newUser = req.body;
    const existingIndex = db.users.findIndex((u: any) => u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase());
    if (existingIndex >= 0) {
      db.users[existingIndex] = newUser;
    } else {
      db.users.unshift(newUser);
    }
    writeDbFile(db);
    res.json({ success: true, users: db.users });
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = ensureDbFile();
    db.users = db.users.filter((u: any) => u.id !== req.params.id);
    writeDbFile(db);
    res.json({ success: true, users: db.users });
  });

  // 4. PRODUCTS ENDPOINTS
  app.post('/api/products', (req, res) => {
    const db = ensureDbFile();
    const product = req.body;
    const existingIndex = db.products.findIndex((p: any) => p.id === product.id);
    if (existingIndex >= 0) {
      db.products[existingIndex] = product;
    } else {
      db.products.unshift(product);
    }

    // Check if added product is below minimum threshold
    if (product.availableStock <= product.minThreshold) {
      const hasPending = db.restockRequests.some(
        (r: any) => r.productId === product.id && r.status === 'Pending'
      );
      if (!hasPending) {
        db.restockRequests.unshift({
          id: `req-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          currentStock: product.availableStock,
          minThreshold: product.minThreshold,
          requestedQuantity: product.minThreshold,
          supplierName: product.supplierName,
          supplierEmail: product.supplierEmail,
          supplierPhone: product.supplierPhone,
          status: 'Pending',
          createdAt: new Date().toISOString()
        });
      }
    }

    writeDbFile(db);
    res.json({ success: true, products: db.products, restockRequests: db.restockRequests });
  });

  // Manager Edit Stock Endpoint
  app.put('/api/products/:id/stock', (req, res) => {
    const db = ensureDbFile();
    const { newStock } = req.body;
    const product = db.products.find((p: any) => p.id === req.params.id);
    if (product) {
      product.availableStock = Math.max(0, parseInt(newStock, 10) || 0);

      // Check if stock now resolves or triggers restock
      if (product.availableStock > product.minThreshold) {
        db.restockRequests = db.restockRequests.map((r: any) =>
          r.productId === product.id && r.status === 'Pending'
            ? { ...r, status: 'Approved' }
            : r
        );
      } else {
        const hasPending = db.restockRequests.some(
          (r: any) => r.productId === product.id && r.status === 'Pending'
        );
        if (!hasPending) {
          db.restockRequests.unshift({
            id: `req-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            currentStock: product.availableStock,
            minThreshold: product.minThreshold,
            requestedQuantity: product.minThreshold,
            supplierName: product.supplierName,
            supplierEmail: product.supplierEmail,
            supplierPhone: product.supplierPhone,
            status: 'Pending',
            createdAt: new Date().toISOString()
          });
        }
      }
      writeDbFile(db);
      res.json({ success: true, product, products: db.products, restockRequests: db.restockRequests });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = ensureDbFile();
    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    db.restockRequests = db.restockRequests.filter((r: any) => r.productId !== req.params.id);
    writeDbFile(db);
    res.json({ success: true, products: db.products });
  });

  // 5. RESTOCK REQUESTS ENDPOINTS
  app.put('/api/restock/:id', (req, res) => {
    const db = ensureDbFile();
    const { status } = req.body;
    db.restockRequests = db.restockRequests.map((r: any) =>
      r.id === req.params.id ? { ...r, status: status || 'Approved' } : r
    );
    writeDbFile(db);
    res.json({ success: true, restockRequests: db.restockRequests });
  });

  // 6. TRANSACTIONS / BILLING (WITH CUSTOMER PHONE NUMBER & STOCK DECREMENT)
  app.post('/api/transactions', (req, res) => {
    const db = ensureDbFile();
    const txn = req.body;

    // Save transaction
    db.transactions.unshift(txn);

    // Update product stock in DB
    if (Array.isArray(txn.items)) {
      txn.items.forEach((item: any) => {
        const product = db.products.find((p: any) => p.id === item.productId || p.sku === item.sku);
        if (product) {
          product.availableStock = Math.max(0, product.availableStock - (item.quantity || 1));

          // Check if threshold breached
          if (product.availableStock <= product.minThreshold) {
            const hasPending = db.restockRequests.some(
              (r: any) => r.productId === product.id && r.status === 'Pending'
            );
            if (!hasPending) {
              db.restockRequests.unshift({
                id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                productId: product.id,
                productName: product.name,
                brand: product.brand,
                currentStock: product.availableStock,
                minThreshold: product.minThreshold,
                requestedQuantity: product.minThreshold,
                supplierName: product.supplierName,
                supplierEmail: product.supplierEmail,
                supplierPhone: product.supplierPhone,
                status: 'Pending',
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      });
    }

    writeDbFile(db);
    res.json({
      success: true,
      transaction: txn,
      products: db.products,
      restockRequests: db.restockRequests,
      transactions: db.transactions
    });
  });

  // 7. VERIFY CUSTOMER PURCHASE FOR FEEDBACK
  // Checks if customer's mobile number exists in transactions for this product!
  app.post('/api/verify-purchase', (req, res) => {
    const { productId, customerPhone } = req.body;
    if (!productId || !customerPhone) {
      return res.status(400).json({ verified: false, message: 'Product ID and customer phone required' });
    }

    const cleanInputPhone = customerPhone.replace(/\D/g, '');
    const db = ensureDbFile();

    const matchedTxn = db.transactions.find((txn: any) => {
      const cleanTxnPhone = (txn.customerPhone || '').replace(/\D/g, '');
      const phoneMatches =
        cleanTxnPhone.length >= 7 &&
        (cleanTxnPhone.includes(cleanInputPhone) || cleanInputPhone.includes(cleanTxnPhone));

      const hasProduct = txn.items?.some((i: any) => i.productId === productId);
      return phoneMatches && hasProduct;
    });

    if (matchedTxn) {
      res.json({
        verified: true,
        receiptNumber: matchedTxn.receiptNumber,
        timestamp: matchedTxn.timestamp,
        customerPhone
      });
    } else {
      res.json({
        verified: false,
        message: 'No purchase record found for this mobile number for this product.'
      });
    }
  });

  // 8. REVIEWS ENDPOINT
  app.post('/api/reviews', (req, res) => {
    const db = ensureDbFile();
    const review = req.body;
    db.reviews.unshift(review);
    writeDbFile(db);
    res.json({ success: true, reviews: db.reviews });
  });

  // 9. FORUM ENDPOINTS
  app.post('/api/forum', (req, res) => {
    const db = ensureDbFile();
    const post = req.body;
    db.forumPosts.unshift(post);
    writeDbFile(db);
    res.json({ success: true, forumPosts: db.forumPosts });
  });

  app.post('/api/forum/:id/replies', (req, res) => {
    const db = ensureDbFile();
    const reply = req.body;
    db.forumPosts = db.forumPosts.map((p: any) => {
      if (p.id === req.params.id) {
        return {
          ...p,
          replies: [...(p.replies || []), reply]
        };
      }
      return p;
    });
    writeDbFile(db);
    res.json({ success: true, forumPosts: db.forumPosts });
  });

  // Mount Vite or static dist
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'))) {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Inventory server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
