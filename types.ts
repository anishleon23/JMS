export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST'
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Event Feast';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Veg or Non-Veg
  foodCategory: string; // Sweet, Tiffen, etc.
  imageUrl?: string;
}

export interface PresetOption {
  label: string; // e.g. "Sweet"
  choices: string[]; // e.g. ["Pal Payasam", "Paruppu Payasam"]
}

export interface PresetMenu {
  id: string;
  name: string;
  pricePerHead: number;
  description?: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Event'; // Added Category
  fixedItems: string[]; // Items that are always included
  options: PresetOption[]; // Items where customer must choose one
}

export interface OrderItem extends MenuItem {
  quantity: number;
  isPreset?: boolean;
  selectedOptions?: Record<string, string>; // e.g. { "Sweet": "Pal Payasam" }
}

export interface AdditionalCost {
  id: string;
  label: string;        // e.g., "Transport", "Service Person", "Decorations"
  amount: number;       // Cost for this item
  quantity?: number;    // Optional quantity (e.g., 3 service persons)
  description?: string; // Optional notes
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  eventDate: string; // ISO date string
  eventTime: string;
  address: string;
  mealType: MealType;
  items: OrderItem[];
  status: 'Pending' | 'Confirmed' | 'Completed';
  totalEstimatedCost: number;
  createdAt: number;
  perHeadAmount?: number;
  guestCount?: number;
  additionalCosts?: AdditionalCost[];
  billNumber?: string;
  completedAt?: number;
  paymentStatus?: 'Pending' | 'Partial' | 'Paid';
}

export interface User {
  username: string;
  role: UserRole;
  name?: string;
  phone?: string;
}