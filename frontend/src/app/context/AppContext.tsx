import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==========================================
// Types
// ==========================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image_url: string;
  seller: string;
  stock: number;
  bnpl_eligible: boolean;
  merchant_id: number;
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
  zip_code: string;
  credit_limit: number;
  kyc_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  credit_score: number;
  remaining_credit: number;
  total_due: number;
  role?: string;
}

export interface Installment {
  id: number;
  number: number;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  paidAt: string | null;
}

export interface InstallmentPlan {
  planId: number;
  totalInstallments: number;
  interestRate: number;
  monthlyAmount: number;
  installments: Installment[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface Order {
  order_id: number;
  total_amount: number;
  outstanding_balance: number;
  payment_plan: string;
  status: string;
  created_at: string;
  credit_score_used: number;
  items: OrderItem[];
  installment_info: InstallmentPlan | null;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
}

export interface Merchant {
  id: number;
  name: string;
  type: string;
  contact_email: string;
  verified: boolean;
  total_sales: number;
  pending_settlement: number;
  created_at: string;
}

export interface AdminStats {
  stats: {
    total_users: number;
    total_merchants: number;
    total_orders: number;
    total_revenue: number;
    total_outstanding: number;
    overdue_installments: number;
    active_plans: number;
  };
  merchantRevenue: { merchant_name: string; total_orders: number; total_revenue: number }[];
  revenueByPlan: { payment_plan: string; order_count: number; total_revenue: number }[];
  monthlyRevenue: { month_label: string; revenue: number; order_count: number }[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  credit_limit: number;
  kyc_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  credit_score: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  table_name: string;
  action: string;
  record_id: number;
  changed_by: string;
  changed_at: string;
}

interface AppContextType {
  // Auth
  currentUser: User | null;
  userRole: string;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  loadingProducts: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  fetchOrders: () => Promise<void>;
  createOrder: (paymentPlan: string, paymentMethod?: string) => Promise<number | null>;

  // Installments
  payInstallment: (installmentId: number) => Promise<void>;

  // Profile
  updateUserProfile: (data: Partial<User>) => Promise<void>;

  // Notifications
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;

  // Admin
  adminStats: AdminStats | null;
  allUsers: AdminUser[];
  merchants: Merchant[];
  auditLogs: AuditLog[];
  fetchAdminData: () => Promise<void>;
  verifyMerchant: (merchantId: number) => Promise<void>;
  processMerchantSettlement: (merchantId: number) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

// ==========================================
// Context
// ==========================================

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('proyojon_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [userRole, setUserRole] = useState<string>(() =>
    localStorage.getItem('proyojon_role') || 'User'
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('proyojon_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('proyojon_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch profile + notifications on login
  useEffect(() => {
    if (currentUser?.id) {
      fetchUserProfile(currentUser.id);
      fetchNotifications();
      fetchOrders();
    }
  }, [currentUser?.id]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // API helpers
  // ==========================================

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const resp = await fetch(`${API}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // ==========================================
  // Auth
  // ==========================================

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { id, name, role } = data.user;
    const profile = await fetchUserProfile(id);
    const user = profile || { id, name, email, role } as any;
    setCurrentUser(user);
    setUserRole(role || 'User');
    localStorage.setItem('proyojon_user', JSON.stringify(user));
    localStorage.setItem('proyojon_role', role || 'User');
  };

  const loginAdmin = async (email: string, password: string) => {
    const data = await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { id, name, role } = data.user;
    const user = { id, name, email, role } as any;
    setCurrentUser(user);
    setUserRole(role || 'Admin');
    localStorage.setItem('proyojon_user', JSON.stringify(user));
    localStorage.setItem('proyojon_role', role || 'Admin');
  };

  const register = async (formData: RegisterData) => {
    await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      }),
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole('User');
    setOrders([]);
    setNotifications([]);
    setAdminStats(null);
    localStorage.removeItem('proyojon_user');
    localStorage.removeItem('proyojon_role');
  };

  // ==========================================
  // Products
  // ==========================================

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await apiFetch('/api/products');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ==========================================
  // Cart
  // ==========================================

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  // ==========================================
  // Orders
  // ==========================================

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const data = await apiFetch(`/api/orders?userId=${currentUser.id}`);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, [currentUser?.id]);

  const createOrder = async (paymentPlan: string, paymentMethod = 'Card'): Promise<number | null> => {
    if (!currentUser?.id || !cart.length) return null;
    const items = cart.map(item => ({
      productId: parseInt(item.id),
      quantity: item.quantity,
      unitPrice: item.price,
    }));
    const data = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUser.id, paymentPlan, items, paymentMethod }),
    });
    clearCart();
    await fetchOrders();
    await fetchUserProfile(currentUser.id);
    return data.orderId;
  };

  // ==========================================
  // Installments
  // ==========================================

  const payInstallment = async (installmentId: number) => {
    if (!currentUser?.id) return;
    await apiFetch(`/api/installments/${installmentId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ userId: currentUser.id }),
    });
    await fetchOrders();
    await fetchNotifications();
    await fetchUserProfile(currentUser.id);
  };

  // ==========================================
  // Profile
  // ==========================================

  const fetchUserProfile = async (userId: string | number): Promise<User | null> => {
    try {
      const data = await apiFetch(`/api/users/${userId}/profile`);
      const user = { ...data, id: data.id?.toString() };
      setCurrentUser(user);
      localStorage.setItem('proyojon_user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser?.id) return;
    await apiFetch(`/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updates.name,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        zipCode: (updates as any).zip_code,
      }),
    });
    await fetchUserProfile(currentUser.id);
  };

  // ==========================================
  // Notifications
  // ==========================================

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const data = await apiFetch(`/api/users/${currentUser.id}/notifications`);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [currentUser?.id]);

  const markNotificationAsRead = async (id: number) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  // ==========================================
  // Admin
  // ==========================================

  const fetchAdminData = useCallback(async () => {
    try {
      const [stats, users, merchantList, logs] = await Promise.all([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/merchants'),
        apiFetch('/api/admin/audit-logs'),
      ]);
      setAdminStats(stats);
      setAllUsers(users);
      setMerchants(merchantList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  }, []);

  const verifyMerchant = async (merchantId: number) => {
    await apiFetch(`/api/admin/merchants/${merchantId}/verify`, { method: 'POST' });
    await fetchAdminData();
  };

  const processMerchantSettlement = async (merchantId: number) => {
    await apiFetch(`/api/admin/merchants/${merchantId}/settle`, { method: 'POST' });
    await fetchAdminData();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userRole,
      login,
      loginAdmin,
      register,
      logout,
      products,
      fetchProducts,
      loadingProducts,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      fetchOrders,
      createOrder,
      payInstallment,
      updateUserProfile,
      notifications,
      fetchNotifications,
      markNotificationAsRead,
      adminStats,
      allUsers,
      merchants,
      auditLogs,
      fetchAdminData,
      verifyMerchant,
      processMerchantSettlement,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}