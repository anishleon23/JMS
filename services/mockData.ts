import { MenuItem, Order, PresetMenu } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Idly (2 pcs)', description: 'Steamed rice cakes served with sambar and chutney', price: 40, category: 'Veg', foodCategory: 'Tiffen' },
  { id: '2', name: 'Masala Dosa', description: 'Crispy fermented crepe stuffed with potato masala', price: 80, category: 'Veg', foodCategory: 'Tiffen' },
  { id: '3', name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with spices and chicken', price: 220, category: 'Non-Veg', foodCategory: 'Rice & Main Course' },
  { id: '4', name: 'Mutton Chukka', description: 'Spicy dry mutton curry', price: 280, category: 'Non-Veg', foodCategory: 'Side Dishes' },
  { id: '5', name: 'Veg Meals', description: 'Rice, Sambar, Rasam, Kootu, Poriyal, Curd, Sweet', price: 150, category: 'Veg', foodCategory: 'Rice & Main Course' },
  { id: '6', name: 'Fish Fry', description: 'Seer fish marinated in spices and fried', price: 250, category: 'Non-Veg', foodCategory: 'Side Dishes' },
  { id: '7', name: 'Pongal', description: 'Rice and lentil dish seasoned with cumin and pepper', price: 60, category: 'Veg', foodCategory: 'Tiffen' },
  { id: '8', name: 'Vada', description: 'Deep fried lentil donut', price: 25, category: 'Veg', foodCategory: 'Snacks' },
];

export const INITIAL_PRESET_MENUS: PresetMenu[] = [
  {
    id: 'pm-1',
    name: 'Traditional Wedding Feast',
    pricePerHead: 350,
    category: 'Lunch',
    description: 'A complete traditional banana leaf meal experience.',
    fixedItems: ['White Rice', 'Sambar', 'Rasam', 'Vatha Kuzhambu', 'Kootu', 'Poriyal', 'Appalam', 'Pickle', 'Curd'],
    options: [
      { label: 'Sweet', choices: ['Pal Payasam', 'Paruppu Payasam', 'Semiya Payasam'] },
      { label: 'Variety Rice', choices: ['Lemon Rice', 'Tamarind Rice', 'Vegetable Biryani'] }
    ]
  },
  {
    id: 'pm-2',
    name: 'Standard Dinner Buffet',
    pricePerHead: 250,
    category: 'Dinner',
    description: 'Perfect for receptions and evening parties.',
    fixedItems: ['Chapati', 'Veg Kurma', 'Idly', 'Sambar', 'Chutney'],
    options: [
      { label: 'Main Course', choices: ['Veg Pulao', 'Jeera Rice', 'Ghee Rice'] },
      { label: 'Starter', choices: ['Gobi 65', 'Veg Cutlet', 'Baby Corn Manchurian'] }
    ]
  },
  {
    id: 'pm-3',
    name: 'South Indian Breakfast',
    pricePerHead: 150,
    category: 'Breakfast',
    description: 'Start the day with authentic flavors.',
    fixedItems: ['Idly', 'Vada', 'Sambar', 'Coconut Chutney', 'Tomato Chutney', 'Coffee'],
    options: [
      { label: 'Special', choices: ['Pongal', 'Rava Kichadi'] },
      { label: 'Sweet', choices: ['Kesari', 'Sweet Pongal'] }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Rajesh Kumar',
    customerPhone: '9876543210',
    eventDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // 2 days from now
    eventTime: '12:00',
    address: '12, Anna Nagar Main Road, Chennai',
    mealType: 'Lunch',
    items: [
      { ...INITIAL_MENU_ITEMS[2], quantity: 50 },
      { ...INITIAL_MENU_ITEMS[5], quantity: 50 }
    ],
    status: 'Confirmed',
    totalEstimatedCost: 23500,
    createdAt: Date.now()
  },
  {
    id: 'ORD-002',
    customerName: 'Priya Sundar',
    customerPhone: '9876500000',
    eventDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), // 10 days ago
    eventTime: '07:00',
    address: 'Kattupakkam, Chennai',
    mealType: 'Breakfast',
    items: [
      { ...INITIAL_MENU_ITEMS[0], quantity: 100 }
    ],
    status: 'Completed',
    totalEstimatedCost: 4000,
    createdAt: Date.now() - 864000000
  }
];