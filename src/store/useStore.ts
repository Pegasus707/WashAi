import { create } from 'zustand';

export type OrderStatus = 'Received' | 'Processing' | 'Ready' | 'Delivered';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderService {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  services: OrderService[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  time: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'VIP';
  joinDate: string;
}

export interface AppSettings {
  storeName: string;
  contactEmail: string;
  taxRate: number;
  currency: string;
  enableSmartPricing: boolean;
  autoReorderStock: boolean;
}

export type DeliveryStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Failed';

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  driverId: string | null;
  status: DeliveryStatus;
  type: 'Pickup' | 'Dropoff';
  timeWindow: string;
}

export interface Driver {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'On Break';
  activeDeliveries: number;
  rating: number;
}

interface StoreState {
  orders: Order[];
  customers: Customer[];
  settings: AppSettings;
  deliveries: Delivery[];
  drivers: Driver[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  assignDriver: (deliveryId: string, driverId: string) => void;
}

const initialOrders: Order[] = [
  { 
    id: "ORD-7281", customer: "Sarah Jenkins", 
    items: [{ name: "Shirts (Wash & Iron)", quantity: 5, price: 60, total: 300 }, { name: "Suits (Dry Clean)", quantity: 1, price: 450, total: 450 }], 
    services: [], subtotal: 750, tax: 60, total: 810, status: "Ready", paymentMethod: 'UPI', time: "10 mins ago" 
  },
  { 
    id: "ORD-7280", customer: "Michael Chen", 
    items: [{ name: "Bedsheets (Double)", quantity: 2, price: 150, total: 300 }], 
    services: [], subtotal: 340, tax: 27.2, total: 367.2, status: "Processing", paymentMethod: 'Cash', time: "1 hour ago" 
  },
  { 
    id: "ORD-7279", customer: "Emma Wilson", 
    items: [{ name: "Pants / Trousers", quantity: 4, price: 80, total: 320 }], 
    services: [{ name: "Express Delivery", price: 150 }], subtotal: 470, tax: 37.6, total: 507.6, status: "Received", paymentMethod: 'Card', time: "2 hours ago" 
  },
];

const initialCustomers: Customer[] = [
  { id: "CUST-001", name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "9876543210", totalOrders: 12, totalSpent: 18450, status: "VIP", joinDate: "Jan 12, 2026" },
  { id: "CUST-002", name: "Michael Chen", email: "m.chen@example.com", phone: "9876543211", totalOrders: 3, totalSpent: 2850, status: "Active", joinDate: "Mar 05, 2026" },
  { id: "CUST-003", name: "Emma Wilson", email: "emma.w@example.com", phone: "9876543212", totalOrders: 1, totalSpent: 507, status: "Active", joinDate: "Apr 20, 2026" },
  { id: "CUST-004", name: "David Miller", email: "dmiller88@example.com", phone: "9876543213", totalOrders: 0, totalSpent: 0, status: "Inactive", joinDate: "Dec 10, 2025" },
];

const initialSettings: AppSettings = {
  storeName: "WashAI Flagship Store",
  contactEmail: "admin@washai.com",
  taxRate: 8.0,
  currency: "INR (₹)",
  enableSmartPricing: true,
  autoReorderStock: false,
};

const initialDrivers: Driver[] = [
  { id: "DRV-01", name: "Marcus Johnson", status: "Online", activeDeliveries: 2, rating: 4.8 },
  { id: "DRV-02", name: "Elena Rodriguez", status: "Online", activeDeliveries: 1, rating: 4.9 },
  { id: "DRV-03", name: "Samir Patel", status: "Offline", activeDeliveries: 0, rating: 4.7 },
];

const initialDeliveries: Delivery[] = [
  { id: "DEL-4412", orderId: "ORD-7281", customerName: "Sarah Jenkins", address: "142 Tech Boulevard, Apt 4B", driverId: "DRV-01", status: "In Transit", type: "Dropoff", timeWindow: "2:00 PM - 4:00 PM" },
  { id: "DEL-4413", orderId: "ORD-7285", customerName: "Emma Wilson", address: "88 Valley Road, Building C", driverId: null, status: "Pending", type: "Pickup", timeWindow: "4:00 PM - 6:00 PM" },
  { id: "DEL-4414", orderId: "ORD-7280", customerName: "Michael Chen", address: "201 Innovation Way", driverId: "DRV-02", status: "Delivered", type: "Dropoff", timeWindow: "10:00 AM - 12:00 PM" },
];

export const useStore = create<StoreState>((set) => ({
  orders: initialOrders,
  customers: initialCustomers,
  settings: initialSettings,
  deliveries: initialDeliveries,
  drivers: initialDrivers,
  addOrder: (order) => set((state) => {
    const existingCustomerIndex = state.customers.findIndex(c => c.name.toLowerCase() === order.customer.toLowerCase());
    let newCustomers = [...state.customers];
    
    if (existingCustomerIndex >= 0) {
      newCustomers[existingCustomerIndex] = {
        ...newCustomers[existingCustomerIndex],
        totalOrders: newCustomers[existingCustomerIndex].totalOrders + 1,
        totalSpent: newCustomers[existingCustomerIndex].totalSpent + order.total
      };
    } else {
      newCustomers = [{
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: order.customer,
        email: "no-email@example.com",
        phone: "N/A",
        totalOrders: 1,
        totalSpent: order.total,
        status: 'Active',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      }, ...newCustomers];
    }

    return { 
      orders: [order, ...state.orders],
      customers: newCustomers
    };
  }),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
  })),
  deleteOrder: (id) => set((state) => ({ orders: state.orders.filter(o => o.id !== id) })),
  addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (customer) => set((state) => ({
    customers: state.customers.map((c) => c.id === customer.id ? customer : c)
  })),
  deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter(c => c.id !== id) })),
  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  updateDeliveryStatus: (id, status) => set((state) => {
    const delivery = state.deliveries.find(d => d.id === id);
    const isClosing = status === 'Delivered' || status === 'Failed';
    const driverId = delivery?.driverId;

    return {
      deliveries: state.deliveries.map(d => d.id === id ? { ...d, status } : d),
      drivers: state.drivers.map(drv => {
        if (isClosing && drv.id === driverId) {
          return { ...drv, activeDeliveries: Math.max(0, drv.activeDeliveries - 1) };
        }
        return drv;
      })
    };
  }),
  assignDriver: (deliveryId, driverId) => set((state) => {
    const delivery = state.deliveries.find(d => d.id === deliveryId);
    const oldDriverId = delivery?.driverId;
    const isAssigning = driverId !== null;

    return {
      deliveries: state.deliveries.map(d => d.id === deliveryId ? { ...d, driverId, status: isAssigning ? 'In Transit' : 'Pending' } : d),
      drivers: state.drivers.map(drv => {
        if (drv.id === driverId) {
          return { ...drv, activeDeliveries: drv.activeDeliveries + 1 };
        }
        if (drv.id === oldDriverId) {
          return { ...drv, activeDeliveries: Math.max(0, drv.activeDeliveries - 1) };
        }
        return drv;
      })
    };
  })
}));
