import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  seller: string;
  stock: number;
  bnplEligible: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  kycStatus: string;
  kycVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  creditScore: number;
  creditLimit: number;
  remainingCredit?: number;
  totalDue?: number;
  documents: any[];
}

export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  verified: boolean;
  verificationDate?: string;
  totalSales: number;
  pendingSettlement: number;
  settlements: Settlement[];
}

export interface Settlement {
  id: string;
  merchantId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed';
  orders: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_reminder' | 'payment_success' | 'payment_failed' | 'plan_change' | 'late_fee';
  title: string;
  message: string;
  date: string;
  read: boolean;
  is_read?: boolean; // For compatibility
  sent_at?: string;  // For compatibility
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  type: 'payment' | 'refund' | 'late_fee';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  receipt?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  paymentPlan: 'full' | '3months' | '6months' | '12months';
  status: 'pending' | 'processing' | 'completed';
  date: string;
  installments?: {
    amount: number;
    frequency: string;
    remaining: number;
    totalInstallments: number;
    interestRate: number;
    firstPaymentDate: string;
    lateFee: number;
  };
  installment_info?: {
    totalInstallments: number;
    installments: {
      id: number;
      number: number;
      amount: number;
      dueDate: string;
      status: 'Pending' | 'Paid' | 'Overdue';
    }[];
  };
  eligibilityChecked: boolean;
  creditScoreUsed: number;
  outstandingBalance: number;
  transactions: Transaction[];
}

export interface AdminStats {
  stats: {
    total_revenue: number;
    total_outstanding: number;
    total_orders: number;
    total_users: number;
    total_merchants: number;
    active_plans: number;
    overdue_installments: number;
  };
  merchantRevenue: { merchant_name: string; total_revenue: number }[];
  revenueByPlan: { payment_plan: string; total_revenue: number; order_count: number }[];
  monthlyRevenue: { month_label: string; revenue: number }[];
}

interface AppContextType {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  fetchUserProfile: () => Promise<void>;
  uploadDocument: (type: string, url: string) => void;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;

  // Merchants
  merchants: Merchant[];
  addMerchant: (merchant: Omit<Merchant, 'id' | 'verified' | 'totalSales' | 'pendingSettlement' | 'settlements'>) => void;
  verifyMerchant: (merchantId: string) => void;
  settlements: Settlement[];
  processMerchantSettlement: (merchantId: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  fetchProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  createOrder: (paymentPlan: Order['paymentPlan']) => void;
  fetchOrders: () => Promise<void>;
  payInstallment: (installmentId: number) => Promise<void>;

  // Payments
  makePayment: (orderId: string, amount: number) => void;
  transactions: Transaction[];

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  fetchNotifications: () => Promise<void>;

  // User Role
  userRole: 'buyer' | 'seller' | 'admin';
  setUserRole: (role: 'buyer' | 'seller' | 'admin') => void;

  // Admin
  isAdmin: boolean;
  allUsers: User[];
  auditLogs: AuditLog[];
  adminStats: AdminStats | null;
  fetchAdminData: () => Promise<void>;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, rich in potassium and perfect for a healthy snack.',
    price: 2.99,
    category: 'Fruits',
    brand: 'FreshFarm',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop',
    seller: 'Fresh Farm Co.',
    stock: 150,
    bnplEligible: true
  },
  {
    id: '2',
    name: 'Fresh Milk',
    description: 'Farm fresh whole milk, pasteurized and packed with nutrients.',
    price: 3.49,
    category: 'Dairy',
    brand: 'DairyGold',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop',
    seller: 'Dairy Delights',
    stock: 80,
    bnplEligible: true
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread, perfect for sandwiches and toast.',
    price: 4.99,
    category: 'Bakery',
    brand: 'BreadCo',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop',
    seller: 'Artisan Bakery',
    stock: 45,
    bnplEligible: true
  },
  {
    id: '4',
    name: 'Free Range Eggs',
    description: 'Farm fresh free-range eggs, packed with protein and vitamins.',
    price: 5.99,
    category: 'Dairy',
    brand: 'HappyHens',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop',
    seller: 'Happy Hens Farm',
    stock: 120,
    bnplEligible: true
  },
  {
    id: '5',
    name: 'Organic Tomatoes',
    description: 'Vine-ripened organic tomatoes, perfect for salads and cooking.',
    price: 3.99,
    category: 'Vegetables',
    brand: 'GreenValley',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop',
    seller: 'Green Valley Farm',
    stock: 200,
    bnplEligible: true
  },
  {
    id: '6',
    name: 'Fresh Spinach',
    description: 'Crisp and fresh organic spinach, packed with iron and vitamins.',
    price: 2.49,
    category: 'Vegetables',
    brand: 'OrganicGreens',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=500&fit=crop',
    seller: 'Organic Greens',
    stock: 90,
    bnplEligible: true
  },
  {
    id: '7',
    name: 'Cheddar Cheese',
    description: 'Sharp aged cheddar cheese, perfect for snacking or cooking.',
    price: 6.99,
    category: 'Dairy',
    brand: 'CheeseWorks',
    image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&h=500&fit=crop',
    seller: 'Dairy Delights',
    stock: 60,
    bnplEligible: true
  },
  {
    id: '8',
    name: 'Red Apples',
    description: 'Crisp and sweet red apples, perfect for snacking or baking.',
    price: 4.49,
    category: 'Fruits',
    brand: 'OrchardFresh',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop',
    seller: 'Orchard Fresh',
    stock: 180,
    bnplEligible: true
  },
  // Electronics
  {
    id: '9',
    name: 'Dell XPS 15 Laptop',
    description: '15.6" laptop with Intel i7, 16GB RAM, 512GB SSD. Perfect for work and gaming.',
    price: 1299.99,
    category: 'Electronics',
    brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1759668358660-0d06064f0f84?w=500&h=500&fit=crop',
    seller: 'TechHub',
    stock: 25,
    bnplEligible: true
  },
  {
    id: '10',
    name: 'Samsung Galaxy S24',
    description: 'Latest smartphone with 256GB storage, 5G capable, stunning AMOLED display.',
    price: 899.99,
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1761645446921-27d641efa0b5?w=500&h=500&fit=crop',
    seller: 'TechHub',
    stock: 40,
    bnplEligible: true
  },
  {
    id: '11',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
    price: 349.99,
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
    seller: 'AudioWorld',
    stock: 60,
    bnplEligible: true
  },
  {
    id: '12',
    name: 'LG 55" 4K Smart TV',
    description: '55-inch 4K OLED TV with HDR, webOS, and built-in streaming apps.',
    price: 1499.99,
    category: 'Electronics',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop',
    seller: 'TechHub',
    stock: 20,
    bnplEligible: true
  },
  // Furniture
  {
    id: '13',
    name: 'Modern Gray Sofa',
    description: '3-seater comfortable sofa with washable covers. Perfect for living room.',
    price: 799.99,
    category: 'Furniture',
    brand: 'HomeComfort',
    image: 'https://images.unsplash.com/photo-1656869929510-216b4976f854?w=500&h=500&fit=crop',
    seller: 'Furniture Depot',
    stock: 15,
    bnplEligible: true
  },
  {
    id: '14',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh.',
    price: 299.99,
    category: 'Furniture',
    brand: 'ErgoMaster',
    image: 'https://images.unsplash.com/photo-1600065428205-b3fb0bd02b3b?w=500&h=500&fit=crop',
    seller: 'Office Plus',
    stock: 35,
    bnplEligible: true
  },
  {
    id: '15',
    name: 'Queen Size Platform Bed',
    description: 'Modern platform bed frame with storage drawers. Easy assembly.',
    price: 599.99,
    category: 'Furniture',
    brand: 'SleepWell',
    image: 'https://images.unsplash.com/photo-1640003145136-f998284e11de?w=500&h=500&fit=crop',
    seller: 'Furniture Depot',
    stock: 18,
    bnplEligible: true
  },
  // Clothing
  {
    id: '16',
    name: 'Men\'s Leather Jacket',
    description: 'Genuine leather jacket with classic style. Available in multiple sizes.',
    price: 249.99,
    category: 'Clothing',
    brand: 'UrbanStyle',
    image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&h=500&fit=crop',
    seller: 'Fashion Store',
    stock: 45,
    bnplEligible: true
  },
  {
    id: '17',
    name: 'Women\'s Slim Fit Jeans',
    description: 'Comfortable stretch denim jeans in classic blue. High-waisted fit.',
    price: 79.99,
    category: 'Clothing',
    brand: 'DenimCo',
    image: 'https://images.unsplash.com/photo-1609831190577-04538764f438?w=500&h=500&fit=crop',
    seller: 'Fashion Store',
    stock: 80,
    bnplEligible: true
  },
  {
    id: '18',
    name: 'Running Sneakers Pro',
    description: 'High-performance running shoes with cushioned sole and arch support.',
    price: 129.99,
    category: 'Clothing',
    brand: 'SportMax',
    image: 'https://images.unsplash.com/photo-1760302318631-a8d342cd4951?w=500&h=500&fit=crop',
    seller: 'Sports World',
    stock: 100,
    bnplEligible: true
  },
  // Appliances
  {
    id: '19',
    name: 'Smart Refrigerator',
    description: 'French door refrigerator with WiFi, touchscreen, and ice maker.',
    price: 1899.99,
    category: 'Appliances',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1758488438758-5e2eedf769ce?w=500&h=500&fit=crop',
    seller: 'Appliance Center',
    stock: 12,
    bnplEligible: true
  },
  {
    id: '20',
    name: 'Front Load Washing Machine',
    description: 'Energy-efficient washing machine with 15 wash cycles and steam clean.',
    price: 699.99,
    category: 'Appliances',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1624381987697-3f93d65ddeea?w=500&h=500&fit=crop',
    seller: 'Appliance Center',
    stock: 22,
    bnplEligible: true
  }
];

const DEFAULT_USER: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main Street',
  city: 'New York',
  zipCode: '10001',
  kycStatus: 'Verified',
  kycVerified: true,
  emailVerified: true,
  phoneVerified: true,
  creditScore: 720,
  creditLimit: 50000,
  documents: []
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bnpl_current_user');
    if (saved && saved !== 'null') {
      try {
        const u = JSON.parse(saved);
        return {
          ...u,
          creditScore: u.creditScore !== undefined ? u.creditScore : (u.credit_score || 0),
          creditLimit: u.creditLimit !== undefined ? u.creditLimit : (Number(u.credit_limit) || 0),
          kycStatus: u.kycStatus || u.kyc_status || 'Pending',
          kycVerified: u.kycVerified !== undefined ? u.kycVerified : (u.kyc_status === 'Verified'),
          zipCode: u.zipCode || u.zip_code || '',
          id: u.id ? u.id.toString() : ''
        };
      } catch (e) {
        console.error("Error parsing saved user:", e);
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bnpl_products');
    if (saved) {
      const data = JSON.parse(saved);
      return data.map((p: any) => ({
        ...p,
        image: p.image || p.image_url,
        bnplEligible: p.bnplEligible !== undefined ? p.bnplEligible : p.bnpl_eligible
      }));
    }
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bnpl_cart');
    if (saved) {
      const data = JSON.parse(saved);
      return data.map((p: any) => ({
        ...p,
        image: p.image || p.image_url,
        bnplEligible: p.bnplEligible !== undefined ? p.bnplEligible : p.bnpl_eligible
      }));
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bnpl_orders');
    if (saved) {
      const data = JSON.parse(saved);
      return data.map((o: any) => ({
        ...o,
        items: (o.items || []).map((item: any) => ({
          ...item,
          image: item.image || item.image_url,
          bnplEligible: item.bnplEligible !== undefined ? item.bnplEligible : item.bnpl_eligible
        }))
      }));
    }
    return [];
  });

  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    const saved = localStorage.getItem('bnpl_merchants');
    return saved ? JSON.parse(saved) : [];
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem('bnpl_settlements');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bnpl_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('bnpl_notifications');
    if (saved) {
      const data = JSON.parse(saved);
      return data.map((n: any) => ({
        ...n,
        read: n.read !== undefined ? n.read : n.is_read,
        date: n.date || n.sent_at
      }));
    }
    return [];
  });

  const [allUsers] = useState<User[]>([DEFAULT_USER]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('bnpl_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const isAdmin = userRole === 'admin';

  // Persist data
  useEffect(() => {
    localStorage.setItem('bnpl_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bnpl_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bnpl_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bnpl_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bnpl_merchants', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('bnpl_settlements', JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem('bnpl_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bnpl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bnpl_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit log helper
  const addAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      action,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Unknown User',
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // User functions
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        const mappedUser: User = {
          ...user,
          creditScore: user.creditScore !== undefined ? user.creditScore : (user.credit_score || 0),
          creditLimit: user.creditLimit !== undefined ? user.creditLimit : (Number(user.credit_limit) || 0),
          kycStatus: user.kyc_status || user.kycStatus || 'Pending',
          zipCode: user.zip_code || user.zipCode || '',
          id: user.id.toString(),
          kycVerified: user.kyc_status === 'Verified' || user.kycVerified || false,
          emailVerified: user.email_verified || user.emailVerified || false,
          phoneVerified: user.phone_verified || user.phoneVerified || false,
          documents: user.documents || []
        };
        setCurrentUser(mappedUser);
        setUserRole(user.role?.toLowerCase() === 'admin' ? 'admin' : 'buyer');
        addAuditLog('LOGIN', `User ${mappedUser.name} logged in`);
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const admin = data.user;
        // Basic user object for admin
        const adminUser: User = {
          id: admin.id.toString(),
          name: admin.name,
          email: admin.email || email,
          phone: '',
          address: '',
          city: '',
          zipCode: '',
          kycStatus: 'Verified',
          kycVerified: true,
          emailVerified: true,
          phoneVerified: true,
          creditScore: 850,
          creditLimit: 100000,
          documents: []
        };
        setCurrentUser(adminUser);
        setUserRole('admin');
        addAuditLog('ADMIN_LOGIN', `Admin ${adminUser.name} logged in`);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Admin login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      throw err;
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        if (user) {
          const mappedUser: User = {
            ...user,
            creditScore: user.creditScore !== undefined ? user.creditScore : (user.credit_score || 500),
            creditLimit: user.creditLimit !== undefined ? user.creditLimit : (Number(user.credit_limit) || 50000),
            kycStatus: user.kyc_status || user.kycStatus || 'Pending',
            zipCode: user.zip_code || user.zipCode || '',
            id: user.id.toString(),
            kycVerified: user.kyc_status === 'Verified' || user.kycVerified || false,
            emailVerified: user.email_verified || user.emailVerified || false,
            phoneVerified: user.phone_verified || user.phoneVerified || false,
            documents: user.documents || []
          };
          setCurrentUser(mappedUser);
          setUserRole('buyer');
          addAuditLog('REGISTER', `User ${mappedUser.name} registered`);
        }
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      addAuditLog('UPDATE_PROFILE', `User ${currentUser.name} updated profile`);
    }
  };

  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API}/api/users/${currentUser.id}/profile`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(prev => prev ? {
          ...prev,
          ...data,
          creditScore: data.credit_score !== undefined ? data.credit_score : (data.creditScore || prev.creditScore),
          creditLimit: data.credit_limit !== undefined ? Number(data.credit_limit) : (data.creditLimit || prev.creditLimit),
          kycStatus: data.kyc_status || data.kycStatus || prev.kycStatus,
          zipCode: data.zip_code || data.zipCode || prev.zipCode,
          kycVerified: data.kyc_status === 'Verified' || data.kycVerified || prev.kycVerified
        } : null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  // Auto-sync profile on mount
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, []);

  const uploadDocument = (type: string, url: string) => {
    if (currentUser) {
      const doc = {
        id: Date.now().toString(),
        type,
        url,
        uploadedAt: new Date().toISOString()
      };
      const updated = {
        ...currentUser,
        documents: [...currentUser.documents, doc]
      };
      setCurrentUser(updated);
      addAuditLog('UPLOAD_DOCUMENT', `User ${currentUser.name} uploaded ${type}`);
    }
  };

  // Merchant functions
  const addMerchant = (merchant: Omit<Merchant, 'id' | 'verified' | 'totalSales' | 'pendingSettlement' | 'settlements'>) => {
    const newMerchant: Merchant = {
      ...merchant,
      id: Date.now().toString(),
      verified: false,
      totalSales: 0,
      pendingSettlement: 0,
      settlements: []
    };
    setMerchants(prev => [...prev, newMerchant]);
    addAuditLog('ADD_MERCHANT', `Merchant ${merchant.businessName} added`);
  };

  const verifyMerchant = (merchantId: string) => {
    setMerchants(prev =>
      prev.map(m =>
        m.id === merchantId
          ? { ...m, verified: true, verificationDate: new Date().toISOString() }
          : m
      )
    );
    addAuditLog('VERIFY_MERCHANT', `Merchant ${merchantId} verified`);
  };

  const processMerchantSettlement = (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (merchant && merchant.pendingSettlement > 0) {
      const settlement: Settlement = {
        id: Date.now().toString(),
        merchantId,
        amount: merchant.pendingSettlement,
        date: new Date().toISOString(),
        status: 'completed',
        orders: []
      };
      setSettlements(prev => [settlement, ...prev]);
      setMerchants(prev =>
        prev.map(m =>
          m.id === merchantId
            ? { ...m, pendingSettlement: 0, settlements: [settlement, ...m.settlements] }
            : m
        )
      );
      addAuditLog('PROCESS_SETTLEMENT', `Settlement of $${merchant.pendingSettlement} processed for merchant ${merchantId}`);
    }
  };

  // Product functions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          merchantId: (currentUser as any)?.merchant_id || 1
        })
      });
      if (res.ok) {
        toast.success(`Product ${product.name} added successfully`);
        await fetchProducts();
        addAuditLog('ADD_PRODUCT', `Product ${product.name} added`);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add product');
      }
    } catch (err: any) {
      console.error('Add product error:', err);
      toast.error(err.message);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        toast.success('Product updated successfully');
        await fetchProducts();
        addAuditLog('UPDATE_PRODUCT', `Product ${id} updated`);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update product');
      }
    } catch (err: any) {
      console.error('Update product error:', err);
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Product deleted successfully');
        await fetchProducts();
        addAuditLog('DELETE_PRODUCT', `Product ${id} deleted`);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Delete product error:', err);
      toast.error(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.map((p: any) => ({
          ...p,
          image: p.image || p.image_url,
          bnplEligible: p.bnplEligible !== undefined ? p.bnplEligible : p.bnpl_eligible
        })));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order functions
  const createOrder = (paymentPlan: Order['paymentPlan']) => {
    if (!currentUser) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Eligibility check based on credit score and order amount
    const eligibilityChecked = currentUser.creditScore >= 500 && total <= 5000;

    let installments;
    let installment_info;
    if (paymentPlan !== 'full' && currentUser.creditScore < 500) {
      toast.error('Credit score too low for BNPL. Minimum required: 500');
      return;
    }
    if (paymentPlan !== 'full') {
      const plans = {
        '3months': { count: 3, frequency: 'monthly', interestRate: 0 },
        '6months': { count: 6, frequency: 'monthly', interestRate: 5 },
        '12months': { count: 12, frequency: 'monthly', interestRate: 10 }
      };
      const plan = plans[paymentPlan];
      const interest = (total * plan.interestRate) / 100;
      const totalWithInterest = total + interest;
      const amountPerInstallment = totalWithInterest / plan.count;

      const individualInstallments = [];
      for (let i = 1; i <= plan.count; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        individualInstallments.push({
          id: Date.now() + i,
          number: i,
          amount: amountPerInstallment,
          dueDate: dueDate.toISOString(),
          status: 'Pending' as const
        });
      }

      installment_info = {
        totalInstallments: plan.count,
        installments: individualInstallments
      };

      const firstPaymentDate = new Date();
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

      installments = {
        amount: amountPerInstallment,
        frequency: plan.frequency,
        remaining: plan.count,
        totalInstallments: plan.count,
        interestRate: plan.interestRate,
        firstPaymentDate: firstPaymentDate.toISOString(),
        lateFee: 25
      };
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: currentUser.id,
      items: cart.map(item => ({
        ...item,
        image: item.image || (item as any).image_url,
      })),
      total,
      paymentPlan,
      status: 'pending',
      date: new Date().toISOString(),
      installments,
      installment_info,
      eligibilityChecked,
      creditScoreUsed: currentUser.creditScore,
      outstandingBalance: installments ? installments.amount * installments.remaining : 0,
      transactions: []
    };

    // Create initial transaction
    const initialTransaction: Transaction = {
      id: Date.now().toString(),
      orderId: newOrder.id,
      amount: paymentPlan === 'full' ? total : installments!.amount,
      type: 'payment',
      status: 'completed',
      date: new Date().toISOString(),
      paymentMethod: 'Credit Card',
      receipt: `RCPT-${Date.now()}`
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [initialTransaction, ...prev]);
    addAuditLog('CREATE_ORDER', `Order ${newOrder.id} created for $${total}`);

    // Add success notification
    addNotification({
      userId: currentUser.id,
      type: 'payment_success',
      title: 'Order Placed Successfully',
      message: `Your order #${newOrder.id} has been placed successfully.`
    });

    clearCart();
  };

  const fetchOrders = async () => {
    // For now, orders are managed via localStorage and state
    // This function can be used later to fetch from a real backend
    const saved = localStorage.getItem('bnpl_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  };

  const fetchAdminData = async () => {
    // Generate mock admin stats based on current state
    const stats: AdminStats = {
      stats: {
        total_revenue: orders.reduce((sum, o) => sum + o.total, 0),
        total_outstanding: orders.reduce((sum, o) => sum + (o.outstandingBalance || 0), 0),
        total_orders: orders.length,
        total_users: allUsers.length,
        total_merchants: merchants.length,
        active_plans: orders.filter(o => o.paymentPlan !== 'full').length,
        overdue_installments: 0 // Mock value
      },
      merchantRevenue: merchants.map(m => ({
        merchant_name: m.businessName,
        total_revenue: m.totalSales
      })),
      revenueByPlan: [
        { payment_plan: 'full', total_revenue: orders.filter(o => o.paymentPlan === 'full').reduce((s, o) => s + o.total, 0), order_count: orders.filter(o => o.paymentPlan === 'full').length },
        { payment_plan: '3months', total_revenue: orders.filter(o => o.paymentPlan === '3months').reduce((s, o) => s + o.total, 0), order_count: orders.filter(o => o.paymentPlan === '3months').length },
        { payment_plan: '6months', total_revenue: orders.filter(o => o.paymentPlan === '6months').reduce((s, o) => s + o.total, 0), order_count: orders.filter(o => o.paymentPlan === '6months').length },
        { payment_plan: '12months', total_revenue: orders.filter(o => o.paymentPlan === '12months').reduce((s, o) => s + o.total, 0), order_count: orders.filter(o => o.paymentPlan === '12months').length },
      ],
      monthlyRevenue: [
        { month_label: 'Jan', revenue: 4000 },
        { month_label: 'Feb', revenue: 3000 },
        { month_label: 'Mar', revenue: 5000 },
      ]
    };
    setAdminStats(stats);
  };

  const payInstallment = async (installmentId: number) => {
    setOrders(prev =>
      prev.map(order => {
        if (!order.installment_info) return order;

        const instIndex = order.installment_info.installments.findIndex(i => i.id === installmentId);
        if (instIndex === -1) return order;

        const installment = order.installment_info.installments[instIndex];
        if (installment.status === 'Paid') return order;

        const newInstallments = [...order.installment_info.installments];
        newInstallments[instIndex] = { ...installment, status: 'Paid' };

        const newOutstanding = Math.max(0, order.outstandingBalance - installment.amount);

        return {
          ...order,
          outstandingBalance: newOutstanding,
          installment_info: {
            ...order.installment_info,
            installments: newInstallments
          }
        };
      })
    );

    addAuditLog('PAY_INSTALLMENT', `Installment ${installmentId} marked as paid`);
  };

  // Payment functions
  const makePayment = (orderId: string, amount: number) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      orderId,
      amount,
      type: 'payment',
      status: 'completed',
      date: new Date().toISOString(),
      paymentMethod: 'Credit Card',
      receipt: `RCPT-${Date.now()}`
    };

    setTransactions(prev => [transaction, ...prev]);

    // Update order outstanding balance
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, outstandingBalance: Math.max(0, order.outstandingBalance - amount) }
          : order
      )
    );

    addAuditLog('MAKE_PAYMENT', `Payment of $${amount} made for order ${orderId}`);

    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of $${amount.toFixed(2)} has been processed successfully.`
      });
    }
  };

  const fetchNotifications = async () => {
    // Already handled by state and localStorage, but keeping for consistency
    const saved = localStorage.getItem('bnpl_notifications');
    if (saved) {
      const data = JSON.parse(saved);
      setNotifications(data.map((n: any) => ({
        ...n,
        read: n.read !== undefined ? n.read : n.is_read,
        date: n.date || n.sent_at
      })));
    }
  };

  // Notification functions
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUserProfile,
        fetchUserProfile,
        uploadDocument,
        login,
        loginAdmin,
        register,
        merchants,
        addMerchant,
        verifyMerchant,
        settlements,
        processMerchantSettlement,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        fetchProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        createOrder,
        makePayment,
        transactions,
        notifications,
        markNotificationAsRead,
        addNotification,
        fetchNotifications,
        userRole,
        setUserRole,
        isAdmin,
        allUsers,
        auditLogs,
        adminStats,
        fetchAdminData,
        fetchOrders,
        payInstallment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}