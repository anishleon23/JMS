import { db } from '../lib/firebase.ts';
import { collection, getDocs, addDoc, doc, query, where, deleteDoc, updateDoc, limit } from 'firebase/firestore';
import { MenuItem, Order, PresetMenu } from '../types.ts';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_PRESET_MENUS } from './mockData.ts';

// Helper to load from localStorage with fallback
const loadFromStorage = <T>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

// Helper to save to localStorage
const saveToStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize mutable state from storage (or defaults)
let mockMenuItems: MenuItem[] = loadFromStorage('jms_menuItems', INITIAL_MENU_ITEMS);
let mockPresetMenus: PresetMenu[] = loadFromStorage('jms_presetMenus', INITIAL_PRESET_MENUS);
let mockOrders: Order[] = loadFromStorage('jms_orders', INITIAL_ORDERS);

export const getMenuItems = async (): Promise<MenuItem[]> => {
  if (db) {
    try {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
    } catch (e) {
      console.error("Error fetching menu from Firebase", e);
      // Reload from storage to ensure we have the latest if firebase fails or is not config
      mockMenuItems = loadFromStorage('jms_menuItems', INITIAL_MENU_ITEMS);
      return mockMenuItems;
    }
  }
  // Always refresh from storage in mock mode to handle cross-component updates
  mockMenuItems = loadFromStorage('jms_menuItems', INITIAL_MENU_ITEMS);
  return Promise.resolve(mockMenuItems);
};

export const addMenuItem = async (item: MenuItem): Promise<MenuItem> => {
  if (db) {
    try {
      const { id, ...data } = item;
      const docRef = await addDoc(collection(db, "menuItems"), data);
      return { ...item, id: docRef.id };
    } catch (e) { console.error(e); }
  }
  const newItem = { ...item, id: item.id || Date.now().toString() };
  mockMenuItems.push(newItem);
  saveToStorage('jms_menuItems', mockMenuItems);
  return Promise.resolve(newItem);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, "menuItems", id));
      return;
    } catch (e) { console.error(e); }
  }
  mockMenuItems = mockMenuItems.filter(i => i.id !== id);
  saveToStorage('jms_menuItems', mockMenuItems);
};

export const getPresetMenus = async (): Promise<PresetMenu[]> => {
  if (db) {
    try {
      const querySnapshot = await getDocs(collection(db, "presetMenus"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PresetMenu));
    } catch (e) { return mockPresetMenus; }
  }
  mockPresetMenus = loadFromStorage('jms_presetMenus', INITIAL_PRESET_MENUS);
  return Promise.resolve(mockPresetMenus);
};

export const addPresetMenu = async (item: PresetMenu): Promise<PresetMenu> => {
  if (db) {
    try {
      const { id, ...data } = item;
      const docRef = await addDoc(collection(db, "presetMenus"), data);
      return { ...item, id: docRef.id };
    } catch (e) { console.error(e); }
  }
  const newItem = { ...item, id: item.id || Date.now().toString() };
  mockPresetMenus.push(newItem);
  saveToStorage('jms_presetMenus', mockPresetMenus);
  return Promise.resolve(newItem);
};

export const deletePresetMenu = async (id: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, "presetMenus", id));
      return;
    } catch (e) { console.error(e); }
  }
  mockPresetMenus = mockPresetMenus.filter(i => i.id !== id);
  saveToStorage('jms_presetMenus', mockPresetMenus);
};

export const getOrders = async (): Promise<Order[]> => {
  if (db) {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (e) { return mockOrders; }
  }
  mockOrders = loadFromStorage('jms_orders', INITIAL_ORDERS);
  return Promise.resolve(mockOrders);
};

export const addOrder = async (order: Order): Promise<Order> => {
  if (db) {
    try {
      const { id, ...orderData } = order;
      const docRef = await addDoc(collection(db, "orders"), orderData);
      return { ...order, id: docRef.id };
    } catch (e) { console.error(e); }
  }
  mockOrders.push(order);
  saveToStorage('jms_orders', mockOrders);
  return Promise.resolve(order);
};

export const updateOrder = async (order: Order): Promise<Order> => {
  if (db) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...orderData } = order;
      await updateDoc(doc(db, "orders", id), orderData as any);
      return order;
    } catch (e) {
      console.error("Error updating order in Firebase, falling back to local:", e);
    }
  }
  mockOrders = mockOrders.map(o => o.id === order.id ? order : o);
  saveToStorage('jms_orders', mockOrders);
  return Promise.resolve(order);
};

export const getCustomerByPhone = async (phone: string): Promise<string | null> => {
  if (!phone) return null;
  if (db) {
    try {
      const q = query(collection(db, "orders"), where("customerPhone", "==", phone), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return snapshot.docs[0].data().customerName || null;
    } catch (e) { console.error(e); }
  } else {
    // Also check localStorage orders to find if customer exists
    const storedOrders: Order[] = loadFromStorage('jms_orders', INITIAL_ORDERS);
    const order = storedOrders.find(o => o.customerPhone === phone);
    if (order) return order.customerName;
  }
  return null;
}