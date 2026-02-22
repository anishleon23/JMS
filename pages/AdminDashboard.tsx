import React, { useState } from 'react';
import { MenuItem, Order, PresetMenu, AdditionalCost, OrderItem } from '../types';
import { Plus, Trash2, Calendar as CalendarIcon, FileText, IndianRupee, Package, Utensils, X, BarChart2, Check, Edit2, Clock, User, Phone, MapPin } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface AdminDashboardProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  presetMenus: PresetMenu[];
  onAddPresetMenu: (menu: PresetMenu) => void;
  onDeletePresetMenu: (id: string) => void;
  viewMode: 'overview' | 'management';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  menuItems,
  onAddMenuItem,
  onDeleteMenuItem,
  orders,
  onUpdateOrder,
  presetMenus,
  onAddPresetMenu,
  onDeletePresetMenu,
  viewMode
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'packages' | 'calendar'>('calendar');
  const [filterType, setFilterType] = useState<'All' | 'Pending' | 'Month' | 'Future'>('All'); // New Filter State
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null); // To scroll to specific order
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Quote Estimation State
  const [estimatingOrder, setEstimatingOrder] = useState<string | null>(null);
  const [perHeadAmount, setPerHeadAmount] = useState<number>(0);
  const [guestCount, setGuestCount] = useState<number>(0);

  // Additional Costs State
  const [additionalCosts, setAdditionalCosts] = useState<Record<string, AdditionalCost[]>>({});
  const [newCostType, setNewCostType] = useState<string>('Transportation');
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostAmount, setNewCostAmount] = useState<number>(0);
  const [newCostQuantity, setNewCostQuantity] = useState<number>(1);
  const [newCostDescription, setNewCostDescription] = useState('');


  // Menu Form State
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ category: 'Veg', foodCategory: 'Sweet' });

  // Preset Form State
  const [newPreset, setNewPreset] = useState<{
    name: string;
    price: string;
    description: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Event';
    fixedItems: string[];
    options: { label: string; choices: string[] }[];
  }>({
    name: '',
    price: '',
    description: '',
    category: 'Lunch',
    fixedItems: [],
    options: []
  });

  const [tempFixedItem, setTempFixedItem] = useState('');
  const [tempOptionLabel, setTempOptionLabel] = useState('');
  const [tempOptionChoices, setTempOptionChoices] = useState(''); // Comma separated

  // --- Order Details Modal State ---
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // --- Handlers for A La Carte Menu ---
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description || '',
      price: Number(newItem.price),
      category: newItem.category || 'Veg',
      foodCategory: newItem.foodCategory || 'Sweet',
      imageUrl: newItem.imageUrl
    };
    onAddMenuItem(item);
    setNewItem({ category: 'Veg', name: '', description: '', price: 0 });
  };

  // --- Handlers for Preset Menu ---
  const addFixedItemToPreset = () => {
    if (tempFixedItem.trim()) {
      setNewPreset(prev => ({ ...prev, fixedItems: [...prev.fixedItems, tempFixedItem.trim()] }));
      setTempFixedItem('');
    }
  };

  const removeFixedItemFromPreset = (index: number) => {
    setNewPreset(prev => ({ ...prev, fixedItems: prev.fixedItems.filter((_, i) => i !== index) }));
  };

  const addOptionGroupToPreset = () => {
    if (tempOptionLabel.trim() && tempOptionChoices.trim()) {
      const choices = tempOptionChoices.split(',').map(s => s.trim()).filter(s => s.length > 0);
      setNewPreset(prev => ({
        ...prev,
        options: [...prev.options, { label: tempOptionLabel.trim(), choices }]
      }));
      setTempOptionLabel('');
      setTempOptionChoices('');
    }
  };

  const removeOptionGroupFromPreset = (index: number) => {
    setNewPreset(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const handleCreatePreset = () => {
    if (!newPreset.name || !newPreset.price) return;

    const preset: PresetMenu = {
      id: `pm-${Date.now()}`,
      name: newPreset.name,
      pricePerHead: Number(newPreset.price),
      description: newPreset.description,
      category: newPreset.category,
      fixedItems: newPreset.fixedItems,
      options: newPreset.options
    };

    onAddPresetMenu(preset);
    // Reset
    setNewPreset({ name: '', price: '', description: '', category: 'Lunch', fixedItems: [], options: [] });
  };

  const handleEditPrice = (order: Order) => {
    setEditingOrder(order.id);
    setEditPrice(order.totalEstimatedCost);
  };

  const savePrice = (order: Order) => {
    onUpdateOrder({ ...order, totalEstimatedCost: editPrice });
    setEditingOrder(null);
  };

  const acceptOrder = (order: Order) => {
    onUpdateOrder({ ...order, status: 'Confirmed' });
  };

  // --- Quote Estimation Handlers ---

  // Custom manual override for total cost
  const [manualTotalCost, setManualTotalCost] = useState<number | null>(null);

  const startEstimating = (order: Order) => {
    setEstimatingOrder(order.id);
    setPerHeadAmount(order.perHeadAmount || 0); // Default to 0, admin sets it
    setGuestCount(order.guestCount || 0);
    setManualTotalCost(order.totalEstimatedCost > 0 ? order.totalEstimatedCost : null);

    setAdditionalCosts(prev => ({
      ...prev,
      [order.id]: order.additionalCosts || []
    }));
  };

  const calculateEstimate = (orderId: string) => {
    const baseCost = perHeadAmount * guestCount;
    const costs = additionalCosts[orderId] || [];
    const additionalTotal = costs.reduce((sum, cost) => {
      return sum + (cost.amount * (cost.quantity || 1));
    }, 0);
    return baseCost + additionalTotal;
  };

  const finalTotalEstimate = (orderId: string) => {
    // If manual override is set (even if 0, admin might want 0), use it. 
    // BUT we only use it if it was explicitly typed. 
    // Let's rely on the input field value.
    if (manualTotalCost !== null) return manualTotalCost;
    return calculateEstimate(orderId);
  }

  const submitQuote = (order: Order) => {
    try {
      // Logic: If user edited the Total field manually, use that.
      // If they were editing Per Head, calculate it.
      // We can use the current displayed total as the truth.

      // Determine if we should use calculated or manual
      // For simplicity, we can pass the final value from the render logic to here, 
      // or re-derive. 
      // If manualTotalCost is set, use it. Else calculate.

      const total = manualTotalCost !== null ? manualTotalCost : calculateEstimate(order.id);

      const updatedOrder = {
        ...order,
        perHeadAmount,
        guestCount,
        additionalCosts: additionalCosts[order.id] || [],
        totalEstimatedCost: total
      };

      onUpdateOrder(updatedOrder);
      setEstimatingOrder(null);
      setManualTotalCost(null);
    } catch (error) {
      console.error('Error in submitQuote:', error);
      alert('Failed to submit quote. See console for details.');
    }
  };

  const addAdditionalCost = (orderId: string) => {
    // Determine the label based on type
    const finalLabel = newCostType === 'Other' ? newCostLabel : newCostType;

    // Validate: if Other is selected, custom label is required
    if (newCostType === 'Other' && !newCostLabel.trim()) {
      alert('Please enter a label for the additional cost');
      return;
    }

    if (newCostAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newCost: AdditionalCost = {
      id: Date.now().toString(),
      label: finalLabel,
      amount: newCostAmount,
      quantity: newCostQuantity,
      description: newCostDescription
    };

    setAdditionalCosts(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newCost]
    }));

    // Reset form
    setNewCostType('Transportation');
    setNewCostLabel('');
    setNewCostAmount(0);
    setNewCostQuantity(1);
    setNewCostDescription('');
  };

  const removeAdditionalCost = (orderId: string, costId: string) => {
    setAdditionalCosts(prev => ({
      ...prev,
      [orderId]: (prev[orderId] || []).filter(c => c.id !== costId)
    }));
  };

  const completeOrder = (order: Order) => {
    const billNumber = `JMS-${format(new Date(), 'yyyyMMdd')}-${orders.length + 1}`;
    onUpdateOrder({
      ...order,
      status: 'Completed',
      completedAt: Date.now(),
      billNumber,
      paymentStatus: 'Pending'
    });
  };



  // --- PDF Generation ---
  const downloadOrderPDF = async (order: Order, type: 'Quote' | 'Bill' = 'Quote') => {
    const doc = new jsPDF();

    // Helper to load image and get dimensions
    const getImageProperties = (url: string): Promise<{ data: string, width: number, height: number } | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve({ data: canvas.toDataURL('image/png'), width: img.width, height: img.height });
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });
    };

    const logoProps = await getImageProperties('/jms_logo.png');

    // --- Helper: Add Border ---
    const addBorder = () => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287); // Page Border

      // Decorative inner border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(7, 7, 203, 7);
      doc.line(7, 285, 203, 285);
      doc.line(7, 7, 7, 285);
      doc.line(203, 7, 203, 285);
    };
    addBorder();

    // --- Header Section ---
    // Logo (Left) - Maintain Aspect Ratio
    if (logoProps) {
      const maxWidth = 50;
      const maxHeight = 25;
      const ratio = Math.min(maxWidth / logoProps.width, maxHeight / logoProps.height);
      const w = logoProps.width * ratio;
      const h = logoProps.height * ratio;
      doc.addImage(logoProps.data, 'PNG', 15, 10, w, h);
    } else {
      // Fallback
      doc.setFontSize(20);
      doc.setTextColor(229, 57, 53);
      doc.text("JMS CATERING", 15, 25);
    }

    // Contact Details (Right)
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("J.Mohan Singh", 195, 15, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("9840364388", 195, 22, { align: 'right' });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("jmscatering.in", 195, 28, { align: 'right' });

    // --- Title Section ---
    doc.setFont("times", "roman");
    doc.setTextColor(102, 51, 153); // Purple color
    doc.setFontSize(22);
    doc.text("Menu", 105, 45, { align: 'center' }); // Changed from "Reception Menu"

    doc.setFontSize(18);
    // Date & Meal Type
    doc.text(`(${format(new Date(order.eventDate), 'dd/MM/yy')}) - ${order.mealType}`, 105, 55, { align: 'center' });

    // Customer Details - LEFT ALIGNED
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Customer: ${order.customerName}`, 15, 65); // Left align
    doc.setFont("helvetica", "normal");
    doc.text(`Contact: ${order.customerPhone}`, 15, 72); // Left align

    // --- Watermark ---
    const addWatermark = () => {
      doc.saveGraphicsState();
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(120);
      doc.setFont("times", "italic");
      doc.text("JMS", 105, 180, { align: 'center', angle: 45 });
      doc.restoreGraphicsState();
    };
    addWatermark();

    let y = 85;

    // --- Welcome Drinks ---
    const beverages = order.items.filter(i => i.foodCategory === 'Beverages' || i.category === 'Beverages');
    const beverageIds = new Set(beverages.map(b => b.id));

    if (beverages.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 128, 0); // Green
      doc.setFontSize(12);
      doc.text("Welcome Drinks:", 15, y);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const beverageNames = beverages.map(b => b.name).join(" or ");
      doc.text(beverageNames, 55, y);
      y += 15;
    }

    // --- Group Items ---
    const remainingItems = order.items.filter(i => !beverageIds.has(i.id));

    // Categories
    const nonVegItems = remainingItems.filter(i => i.category === 'Non-Veg');
    const vegItems = remainingItems.filter(i => i.category === 'Veg');
    const otherItems = remainingItems.filter(i => i.category !== 'Non-Veg' && i.category !== 'Veg');

    // Drawing Helper
    const drawItemList = (title: string, items: OrderItem[], xPos: number, startY: number, count?: number) => {
      let currentY = startY;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 128, 0); // Green
      doc.setFontSize(12);
      doc.text(title, xPos, currentY);

      if (count) {
        doc.text(`${count} nos`, xPos + 180, currentY, { align: 'right' });
      }

      currentY += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      items.forEach((item, index) => {
        // Look up preset definition
        const presetDef = presetMenus.find(p => p.name === item.name);
        const hasContents = (presetDef && presetDef.fixedItems && presetDef.fixedItems.length > 0) || (item.selectedOptions && Object.keys(item.selectedOptions).length > 0);

        // Check page break
        if (currentY > 270) {
          doc.addPage();
          addBorder();
          addWatermark();
          currentY = 20;
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
        }

        if (hasContents) {
          // Render as Sub-heading
          doc.setFont("helvetica", "bold");
          // Add cost if per head amount or price exists
          // "add the cost of food as well" -> User wants to see the rate here likely.
          const rateText = order.perHeadAmount ? `(Rate: ₹${order.perHeadAmount})` : (item.price > 0 ? `(₹${item.price})` : '');
          doc.text(`${item.name} ${rateText}`, xPos + 5, currentY);
          doc.setFont("helvetica", "normal");
          currentY += 7;

          let subIndex = 1;

          // 1. Fixed Items
          if (presetDef && presetDef.fixedItems) {
            doc.setFontSize(11); // Standard size for items
            doc.setTextColor(0, 0, 0);

            presetDef.fixedItems.forEach(fi => {
              if (currentY > 275) { doc.addPage(); addBorder(); addWatermark(); currentY = 20; }
              doc.text(`${subIndex}. ${fi}`, xPos + 12, currentY);
              currentY += 6;
              subIndex++;
            });
          }

          // 2. Selected Options
          if (item.selectedOptions) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            Object.entries(item.selectedOptions).forEach(([optName, optVal]) => {
              if (currentY > 275) { doc.addPage(); addBorder(); addWatermark(); currentY = 20; }
              doc.text(`${subIndex}. ${optVal}`, xPos + 12, currentY);
              currentY += 6;
              subIndex++;
            });
          }

          // Add some spacing after a block
          currentY += 5;

        } else {
          // Standard Item (A La Carte or simple)
          // Just numbered list
          doc.text(`${index + 1}.  ${item.name}`, xPos + 5, currentY);
          currentY += 7;
        }
      });
      return currentY;
    };

    let maxY = y;

    // Dynamic Heading Logic based on Meal Type or Standard
    // User asked "make breakfast 1 as heading".
    // If separate lists, we use explicit headings.

    const mealHeading = order.mealType ? order.mealType : "Menu";

    if (nonVegItems.length > 0) {
      // e.g. "Non Veg Dinner" or "Non Veg Breakfast"
      const title = `Non Veg ${mealHeading}`;
      maxY = drawItemList(title, nonVegItems, 15, y, order.guestCount);
      y = maxY + 10;
    }

    if (vegItems.length > 0) {
      // If we have NonVeg items previously, this is the "Veg" section.
      // If ONLY Veg items exist, this is the main section.
      const title = nonVegItems.length > 0 ? "Veg" : `Veg ${mealHeading}`;
      // For mixed, showing 1300 for NonVeg and (undefined/200?) for Veg is tricky without specific split data.
      // I will leave Veg count empty if mixed, as we don't have separate "Veg Guest Count" in data model yet.

      maxY = drawItemList(title, vegItems, 15, y, nonVegItems.length === 0 ? order.guestCount : undefined);
      y = maxY + 10;
    }

    if (otherItems.length > 0) {
      // "Remove the word other item". Merge into "Breakfast" or similar?
      // If no other items printed yet, this is the main list.
      if (nonVegItems.length === 0 && vegItems.length === 0) {
        maxY = drawItemList(`${mealHeading}`, otherItems, 15, y, order.guestCount);
      } else {
        // We have others AND Veg/NonVeg. Append to the previous list visually?
        // Or just list them under "Special Items" or similar?
        // "make breakfast 1 as heading" -> maybe "Breakfast" covering these?
        // If I just print them with the heading "Breakfast" (if mealType is Breakfast)...
        maxY = drawItemList(`${mealHeading}`, otherItems, 15, y);
      }
      y = maxY + 10;
    }

    // --- Additional Costs ---
    if (order.additionalCosts && order.additionalCosts.length > 0) {
      // Check page break
      if (y > 250) {
        doc.addPage();
        addBorder();
        addWatermark();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 128, 0);
      doc.setFontSize(12);
      doc.text("Additional Charges", 15, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      order.additionalCosts.forEach(cost => {
        const costLabel = cost.label === 'Other' && cost.description ? cost.description : cost.label; // Use desc if 'Other'
        const qty = cost.quantity || 1;
        const itemTotal = cost.amount * qty;

        doc.text(`${costLabel} (${qty > 1 ? qty + ' x ' : ''}₹${cost.amount})`, 20, y);
        doc.text(`₹ ${itemTotal.toLocaleString()}`, 195, y, { align: 'right' });
        y += 7;
      });
      y += 5;
    }

    // --- Overall Cost ---
    let finalY = 250;

    if (y < 240) {
      finalY = Math.max(y + 10, 240);
    } else {
      doc.addPage();
      addBorder();
      finalY = 240;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(229, 57, 53);
    // Right aligned at 195
    doc.text(`Total Cost: ${order.totalEstimatedCost.toLocaleString()} /-`, 195, finalY, { align: 'right' });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    // Left aligned footer?
    // "29, P.G.Avenue..." centered in sample, but user edited to left? 
    // Request says "add customer name ... to left end". 
    // "make it right aligned" referred to Total Cost.
    // Footer: standard center is usually best for address.
    // I will stick to CENTER for address based on professional looking, unless user edit "left" was intentional for address too.
    // User edit: `doc.text("29,...", 105, 275, { align: 'left' });` 
    // If x=105 and align='left', it starts at center and goes right. That looks weird.
    // I will Center it at 105.
    doc.text("29, P.G.Avenue, Kattuapakkam, Chennai 56", 105, 275, { align: 'center' });

    doc.save(`${order.customerName}_${format(new Date(order.eventDate), 'dd-MM-yyyy')}_Quote.pdf`);
  };


  // --- Insights Calculation ---
  const calculateInsights = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalEstimatedCost || 0), 0);
    const monthlyRevenue = monthlyOrders.reduce((acc, curr) => acc + (curr.totalEstimatedCost || 0), 0);

    // Group by month for chart (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === m && od.getFullYear() === y;
      }).length;
      last6Months.push({ month: format(d, 'MMM'), count });
    }

    const pendingQuotes = orders.filter(o => !o.totalEstimatedCost || o.totalEstimatedCost === 0).length;

    // Upcoming Orders (Future dates)
    const upcomingOrders = orders
      .filter(o => new Date(o.eventDate) >= new Date())
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    // Current Month Orders List
    const currentMonthOrdersList = monthlyOrders.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    return { totalOrders: orders.length, monthlyOrders: monthlyOrders.length, totalRevenue, monthlyRevenue, last6Months, pendingQuotes, upcomingOrders, currentMonthOrdersList };
  };

  const insights = calculateInsights();

  const renderOrder = (order: Order) => {
    const isEstimating = estimatingOrder === order.id;
    const orderCosts = additionalCosts[order.id] || order.additionalCosts || [];

    return (
      <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-jms-red text-white p-3 rounded-lg text-center min-w-[60px]">
              <span className="block text-xs uppercase font-bold">{format(new Date(order.eventDate), 'MMM')}</span>
              <span className="block text-2xl font-bold leading-none">{format(new Date(order.eventDate), 'dd')}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{order.customerName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                {order.eventTime} • {order.mealType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${order.status === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              order.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}>
              {order.status}
            </span>

            {order.status === 'Pending' && (
              <button
                onClick={() => acceptOrder(order)}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                title="Accept Order"
              >
                <Check size={18} />
              </button>
            )}

            {order.status === 'Confirmed' && (
              <button
                onClick={() => completeOrder(order)}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                title="Mark as Completed"
              >
                Complete
              </button>
            )}

            <button
              onClick={() => downloadOrderPDF(order)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition"
              title="Download Quote PDF"
            >
              <FileText size={20} />
            </button>

            {order.status === 'Completed' && (
              <button
                onClick={() => downloadOrderPDF(order, 'Bill')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 transition font-medium text-sm"
                title="Download Bill PDF"
              >
                <FileText size={20} /> Bill
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Delivery & Order Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivery Details</h4>
              <p className="text-gray-800">{order.address}</p>
              <p className="text-gray-600 mt-1">Phone: {order.customerPhone}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h4>
              <div className="space-y-1">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x {item.quantity}</span>
                    <span className="font-medium">₹ {item.price * item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && <p className="text-xs text-gray-500 italic">+ {order.items.length - 3} more items...</p>}
              </div>
            </div>
          </div>

          {/* Quote Estimation Section */}
          {order.status !== 'Completed' && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quote Estimation</h4>
                {!isEstimating && (
                  <button
                    onClick={() => startEstimating(order)}
                    className="text-sm bg-jms-orange text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition"
                  >
                    {order.perHeadAmount ? 'Edit Quote' : 'Create Quote'}
                  </button>
                )}
              </div>

              {isEstimating ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {/* Per Head Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Per Head Amount (₹)</label>
                      <input
                        type="number"
                        value={perHeadAmount}
                        onChange={e => setPerHeadAmount(Number(e.target.value))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Guest Count</label>
                      <input
                        type="number"
                        value={guestCount}
                        onChange={e => setGuestCount(Number(e.target.value))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  {perHeadAmount > 0 && guestCount > 0 && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-gray-700">Base Cost: <span className="font-bold text-blue-700">₹ {(perHeadAmount * guestCount).toLocaleString()}</span></p>
                    </div>
                  )}

                  {/* Additional Costs */}
                  <div className="border-t pt-3">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2">Additional Costs</h5>

                    {/* Add New Cost Form */}
                    <div className="space-y-2 mb-3">
                      <div className="grid grid-cols-12 gap-2">
                        <select
                          value={newCostType}
                          onChange={e => setNewCostType(e.target.value)}
                          className="col-span-4 p-2 border rounded text-sm focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        >
                          <option value="Transportation">Transportation</option>
                          <option value="Service Staff">Service Staff</option>
                          <option value="Equipment Rental">Equipment Rental</option>
                          <option value="Decoration">Decoration</option>
                          <option value="Other">Other (Custom)</option>
                        </select>
                        <input
                          type="number"
                          value={newCostAmount || ''}
                          onChange={e => setNewCostAmount(Number(e.target.value))}
                          placeholder="Amount"
                          className="col-span-3 p-2 border rounded text-sm focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        />
                        <input
                          type="number"
                          value={newCostQuantity}
                          onChange={e => setNewCostQuantity(Number(e.target.value))}
                          placeholder="Qty"
                          className="col-span-2 p-2 border rounded text-sm focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        />
                        <input
                          type="text"
                          value={newCostDescription}
                          onChange={e => setNewCostDescription(e.target.value)}
                          placeholder="Notes"
                          className="col-span-2 p-2 border rounded text-sm focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        />
                        <button
                          onClick={() => addAdditionalCost(order.id)}
                          className="col-span-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {newCostType === 'Other' && (
                        <input
                          type="text"
                          value={newCostLabel}
                          onChange={e => setNewCostLabel(e.target.value)}
                          placeholder="Enter custom label (e.g., DJ Service)"
                          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-jms-orange focus:outline-none"
                        />
                      )}
                    </div>

                    {/* List of Additional Costs */}
                    {orderCosts.length > 0 && (
                      <div className="space-y-2">
                        {orderCosts.map((cost) => (
                          <div key={cost.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                            <div className="flex-1">
                              <span className="font-medium">{cost.label}</span>
                              {cost.description && <span className="text-gray-500 text-xs ml-2">({cost.description})</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{cost.quantity || 1} × ₹{cost.amount}</span>
                              <span className="font-bold text-gray-800">₹{cost.amount * (cost.quantity || 1)}</span>
                              <button
                                onClick={() => removeAdditionalCost(order.id, cost.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Estimate */}
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">Total Estimate:</span>
                      <span className="text-xl font-bold text-green-700">₹ {calculateEstimate(order.id).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitQuote(order)}
                      className="flex-1 bg-jms-green text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Submit Quote
                    </button>
                    <button
                      onClick={() => setEstimatingOrder(null)}
                      className="px-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {order.perHeadAmount && order.guestCount && (
                    <div className="text-sm">
                      <span className="text-gray-600">Per Head: ₹{order.perHeadAmount} × {order.guestCount} guests = </span>
                      <span className="font-bold">₹{(order.perHeadAmount * order.guestCount).toLocaleString()}</span>
                    </div>
                  )}
                  {order.additionalCosts && order.additionalCosts.length > 0 && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Additional Costs:</p>
                      {order.additionalCosts.map((cost) => (
                        <div key={cost.id} className="flex justify-between pl-3">
                          <span className="text-gray-700">{cost.label} {cost.quantity && cost.quantity > 1 ? `(×${cost.quantity})` : ''}</span>
                          <span className="font-medium">₹{cost.amount * (cost.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t flex justify-between items-center font-bold text-jms-red">
                    <span>Total Estimate</span>
                    <span>₹ {order.totalEstimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Order Summary */}
          {order.status === 'Completed' && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-blue-900">Bill Information</h4>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Bill #{order.billNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <span className="ml-2 font-medium">{order.completedAt ? format(new Date(order.completedAt), 'dd/MM/yyyy') : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment:</span>
                    <span className={`ml-2 font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' :
                      order.paymentStatus === 'Partial' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>{order.paymentStatus || 'Pending'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Final Amount:</span>
                    <span className="text-xl font-bold text-blue-700">₹ {order.totalEstimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'overview') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
        <div className="space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div onClick={() => { setActiveTab('calendar'); setFilterType('All'); }} className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition">
              <p className="text-gray-500 text-sm font-bold uppercase">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{insights.totalOrders}</p>
            </div>
            <div onClick={() => { setActiveTab('calendar'); setFilterType('Month'); }} className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition">
              <p className="text-gray-500 text-sm font-bold uppercase">This Month Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{insights.monthlyOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-jms-orange">
              <p className="text-gray-500 text-sm font-bold uppercase">Total Revenue (Est)</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹ {insights.totalRevenue.toLocaleString()}</p>
            </div>
            <div onClick={() => { setActiveTab('calendar'); setFilterType('Pending'); }} className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition">
              <p className="text-gray-500 text-sm font-bold uppercase">Pending Quotes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{insights.pendingQuotes}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-jms-red">
              <p className="text-gray-500 text-sm font-bold uppercase">This Month Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹ {insights.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upcoming Orders Section */}
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CalendarIcon size={20} className="text-jms-red" /> Upcoming Orders
              </h3>
              {insights.upcomingOrders.length > 0 ? (
                <div className="space-y-4">
                  {insights.upcomingOrders.slice(0, 5).map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderForDetails(order)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{format(new Date(order.eventDate), 'dd MMM yyyy')} • {order.mealType}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                  {insights.upcomingOrders.length > 5 && (
                    <button onClick={() => { setActiveTab('calendar'); setFilterType('Future'); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full text-center mt-2">
                      View All Upcoming
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">No upcoming orders.</p>
              )}
            </div>

            {/* Current Month Orders Section */}
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-600" /> Current Month Orders
              </h3>
              {insights.currentMonthOrdersList.length > 0 ? (
                <div className="space-y-4">
                  {insights.currentMonthOrdersList.slice(0, 5).map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderForDetails(order)}
                      className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{format(new Date(order.eventDate), 'dd MMM')} • {order.guestCount} Pax</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">₹ {order.totalEstimatedCost.toLocaleString()}</p>
                        <span className={`text-xs ${order.status === 'Completed' ? 'text-green-600' : 'text-orange-600'}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {insights.currentMonthOrdersList.length > 5 && (
                    <button onClick={() => { setActiveTab('calendar'); setFilterType('Month'); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full text-center mt-2">
                      View All
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">No orders for this month.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Order Volume (Last 6 Months)</h3>
            <div className="flex items-end gap-4 h-64">
              {insights.last6Months.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-blue-100 rounded-t-lg transition hover:bg-blue-200 relative group"
                    style={{ height: `${m.count > 0 ? (m.count / Math.max(...insights.last6Months.map(x => x.count))) * 100 : 0}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                      {m.count} Orders
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Menu & Orders</h1>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-center">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'menu' ? 'bg-jms-red text-white' : 'bg-white text-gray-600 border'}`}
          >
            <Utensils size={18} /> A La Carte
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'packages' ? 'bg-jms-red text-white' : 'bg-white text-gray-600 border'}`}
          >
            <Package size={18} /> Packages
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-jms-red text-white' : 'bg-white text-gray-600 border'}`}
          >
            <CalendarIcon size={18} /> Orders
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Order Details #{selectedOrderForDetails.id}</h2>
              <button onClick={() => setSelectedOrderForDetails(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={18} /> Customer</h3>
                  <p className="text-lg font-semibold">{selectedOrderForDetails.customerName}</p>
                  <p className="text-gray-600 flex items-center gap-1"><Phone size={14} /> {selectedOrderForDetails.customerPhone}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><CalendarIcon size={18} /> Event</h3>
                  <p>{format(new Date(selectedOrderForDetails.eventDate), 'dd MMMM yyyy')}</p>
                  <p className="text-gray-600">{selectedOrderForDetails.eventTime} • {selectedOrderForDetails.mealType}</p>
                  <p className="text-gray-600 mt-1 flex items-start gap-1"><MapPin size={14} className="mt-1 flex-shrink-0" /> {selectedOrderForDetails.address}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Utensils size={18} /> Menu Items</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="space-y-3">
                    {selectedOrderForDetails.items.map((item, idx) => (
                      <li key={idx} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <span className="font-semibold">{idx + 1}. {item.name}</span>
                          <span className="text-sm bg-gray-200 px-2 py-0.5 rounded text-gray-700">x{item.quantity}</span>
                        </div>
                        {item.isPreset && item.selectedOptions && (
                          <ul className="pl-6 mt-1 space-y-1 text-sm text-gray-600 list-disc">
                            {item.fixedItems?.map((f, i) => <li key={`fix-${i}`}>{f}</li>)}
                            {Object.entries(item.selectedOptions).map(([key, val]) => (
                              <li key={key}><span className="font-medium">{key}:</span> {val}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800 font-bold uppercase">Current Status</p>
                  <p className="text-blue-900 font-medium">{selectedOrderForDetails.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-800 font-bold uppercase">Total Estimated Cost</p>
                  <p className="text-2xl font-bold text-blue-900">₹ {selectedOrderForDetails.totalEstimatedCost.toLocaleString()}</p>
                </div>
              </div>

              {selectedOrderForDetails.status === 'Pending' && (selectedOrderForDetails.totalEstimatedCost === 0 || !selectedOrderForDetails.totalEstimatedCost) && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      startEstimating(selectedOrderForDetails);
                      setSelectedOrderForDetails(null);
                      setActiveTab('calendar');
                    }}
                    className="bg-jms-red text-white py-2 px-6 rounded-lg font-bold hover:bg-jms-dark transition shadow-lg"
                  >
                    Create Quote Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Estimation Modal */}
      {estimatingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Create Quote</h2>
              <button onClick={() => setEstimatingOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Left Side: Order Details Summary */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-full overflow-y-auto max-h-[600px] custom-scrollbar">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Order Summary</h3>
                {orders.find(o => o.id === estimatingOrder) && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Customer</p>
                      <p className="font-medium">{orders.find(o => o.id === estimatingOrder)?.customerName}</p>
                      <p className="text-sm text-gray-600">{orders.find(o => o.id === estimatingOrder)?.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Event Details</p>
                      <p className="text-sm">{format(new Date(orders.find(o => o.id === estimatingOrder)!.eventDate), 'dd MMM yyyy')} • {orders.find(o => o.id === estimatingOrder)?.eventTime}</p>
                      <p className="text-sm mt-1">{orders.find(o => o.id === estimatingOrder)?.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-2">Menu</p>
                      <ul className="text-sm space-y-2">
                        {orders.find(o => o.id === estimatingOrder)?.items.map((item, idx) => (
                          <li key={idx} className="border-l-2 border-jms-red pl-2">
                            <p className="font-semibold">{item.name}</p>
                            {item.isPreset && item.selectedOptions && (
                              <p className="text-xs text-gray-600 mt-1">
                                {Object.values(item.selectedOptions).join(', ')}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Cost Editing */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count (Pax)</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Head (₹)</label>
                  <input
                    type="number"
                    value={perHeadAmount}
                    onChange={(e) => {
                      setPerHeadAmount(Number(e.target.value));
                      setManualTotalCost(null); // Reset manual override if per head changes
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">Base Cost: ₹ {(perHeadAmount * guestCount).toLocaleString()}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-gray-700">Additional Costs</p>
                  </div>
                  {/* Additional Cost List */}
                  <div className="space-y-2 mb-4 bg-gray-50 p-2 rounded">
                    {(additionalCosts[estimatingOrder] || []).map((cost, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-center">
                        <span>{cost.label} {cost.quantity && cost.quantity > 1 ? `(x${cost.quantity})` : ''}</span>
                        <div className="flex items-center gap-2">
                          <span>₹ {cost.amount * (cost.quantity || 1)}</span>
                          <button
                            onClick={() => {
                              setAdditionalCosts(prev => ({
                                ...prev,
                                [estimatingOrder]: prev[estimatingOrder].filter((_, i) => i !== idx)
                              }));
                              setManualTotalCost(null);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!additionalCosts[estimatingOrder] || additionalCosts[estimatingOrder].length === 0) && (
                      <p className="text-xs text-gray-400 italic text-center">No additional costs added.</p>
                    )}
                  </div>

                  {/* Add Cost Form */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={newCostType}
                      onChange={(e) => { setNewCostType(e.target.value); setNewCostLabel(e.target.value === 'Other' ? '' : e.target.value); }}
                      className="p-2 text-sm border rounded"
                    >
                      <option value="Transportation">Transportation</option>
                      <option value="Service Staff">Service Staff</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Water/Beverages">Water/Beverages</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Other">Other (Custom)</option>
                    </select>
                    <input
                      type="number"
                      value={newCostAmount}
                      onChange={(e) => setNewCostAmount(Number(e.target.value))}
                      placeholder="Cost per unit"
                      className="p-2 text-sm border rounded"
                    />
                  </div>
                  {newCostType === 'Other' && (
                    <input
                      type="text"
                      value={newCostLabel}
                      onChange={(e) => setNewCostLabel(e.target.value)}
                      placeholder="Cost Name (e.g. Generator)"
                      className="w-full p-2 text-sm border rounded mb-2"
                    />
                  )}
                  <button
                    onClick={() => {
                      if (!newCostLabel || newCostAmount <= 0) return;
                      setAdditionalCosts(prev => ({
                        ...prev,
                        [estimatingOrder]: [...(prev[estimatingOrder] || []), {
                          id: Date.now().toString(),
                          label: newCostLabel,
                          amount: newCostAmount,
                          type: 'fixed', // Simple fixed for now
                          quantity: 1
                        }]
                      }));
                      setNewCostAmount(0);
                      // Keep label if standard, clear if custom? Keep it simple.
                      setManualTotalCost(null);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 rounded"
                  >
                    + Add Cost
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-blue-800 font-bold uppercase mb-1">Total Estimated Cost</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-900">₹</span>
                    <input
                      type="number"
                      value={finalTotalEstimate(estimatingOrder)}
                      onChange={(e) => setManualTotalCost(Number(e.target.value))}
                      className="text-2xl font-bold text-blue-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-600 focus:outline-none w-full"
                    />
                  </div>
                  {manualTotalCost !== null && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ Manual override active</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEstimatingOrder(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button
                    onClick={() => submitQuote(orders.find(o => o.id === estimatingOrder)!)}
                    className="flex-1 bg-jms-red text-white py-3 rounded-lg font-bold hover:bg-jms-dark transition shadow-lg"
                  >
                    Submit Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Menu Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name || ''}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newItem.description || ''}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={newItem.price || ''}
                      onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Type</label>
                      <select
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                      >
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Food Category</label>
                      <select
                        value={newItem.foodCategory}
                        onChange={e => setNewItem({ ...newItem, foodCategory: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                      >
                        <option value="Sweet">Sweet</option>
                        <option value="Tiffen">Tiffen</option>
                        <option value="Rice & Main Course">Rice & Main Course</option>
                        <option value="Side Dishes">Side Dishes</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddItem}
                  className="w-full bg-jms-green hover:bg-green-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Item List */}
          <div className="md:col-span-2 space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow border-l-4 flex justify-between items-center group hover:shadow-md transition" style={{ borderColor: item.category === 'Veg' ? '#43A047' : '#E53935' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.category === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {item.foodCategory}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                  <p className="font-semibold text-gray-900 mt-1">₹ {item.price}</p>
                </div>
                <button
                  onClick={() => onDeleteMenuItem(item.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Package Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Create Preset Menu</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Package Name"
                  value={newPreset.name}
                  onChange={e => setNewPreset({ ...newPreset, name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                />
                <select
                  value={newPreset.category}
                  onChange={e => setNewPreset({ ...newPreset, category: e.target.value as any })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Event">Event</option>
                </select>
                <input
                  type="number"
                  placeholder="Price Per Head (₹)"
                  value={newPreset.price}
                  onChange={e => setNewPreset({ ...newPreset, price: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                />
                <textarea
                  placeholder="Short Description"
                  value={newPreset.description}
                  onChange={e => setNewPreset({ ...newPreset, description: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:outline-none"
                  rows={2}
                />

                {/* Fixed Items Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Items</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tempFixedItem}
                      onChange={e => setTempFixedItem(e.target.value)}
                      placeholder="e.g. White Rice"
                      className="flex-1 p-2 border rounded text-sm"
                    />
                    <button onClick={addFixedItemToPreset} className="bg-gray-200 hover:bg-gray-300 p-2 rounded"><Plus size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPreset.fixedItems.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                        {item} <button onClick={() => removeFixedItemFromPreset(idx)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Options Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options (Choice)</label>
                  <div className="space-y-2 mb-2">
                    <input
                      type="text"
                      value={tempOptionLabel}
                      onChange={e => setTempOptionLabel(e.target.value)}
                      placeholder="Group Name (e.g. Sweet)"
                      className="w-full p-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={tempOptionChoices}
                      onChange={e => setTempOptionChoices(e.target.value)}
                      placeholder="Choices (comma separated)"
                      className="w-full p-2 border rounded text-sm"
                    />
                    <button onClick={addOptionGroupToPreset} className="w-full bg-gray-200 hover:bg-gray-300 py-1 rounded text-sm">Add Option Group</button>
                  </div>
                  <div className="space-y-2">
                    {newPreset.options.map((opt, idx) => (
                      <div key={idx} className="bg-yellow-50 p-2 rounded text-xs border border-yellow-100 relative">
                        <button onClick={() => removeOptionGroupFromPreset(idx)} className="absolute top-1 right-1 text-red-400"><X size={12} /></button>
                        <p className="font-bold">{opt.label}</p>
                        <p className="text-gray-600">{opt.choices.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreatePreset}
                  className="w-full bg-jms-green hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Create Package
                </button>
              </div>
            </div>
          </div>

          {/* Packages List */}
          <div className="md:col-span-2 space-y-4">
            {presetMenus.map(preset => (
              <div key={preset.id} className="bg-white p-6 rounded-xl shadow border-l-4 border-jms-orange flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-gray-800">{preset.name}</h3>
                    <span className="bg-jms-orange text-white text-xs px-2 py-1 rounded-full font-bold uppercase">{preset.category}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{preset.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Fixed Items</span>
                      <p className="text-sm text-gray-700 mt-1">{preset.fixedItems.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Customizable</span>
                      <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
                        {preset.options.map((opt, i) => (
                          <li key={i}>{opt.label}: {opt.choices.length} choices</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="font-bold text-xl text-jms-red mt-4">₹ {preset.pricePerHead} <span className="text-sm text-gray-400 font-normal">/ head</span></p>
                </div>
                <div className="flex items-start">
                  <button
                    onClick={() => onDeletePresetMenu(preset.id)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex gap-2">
              {['All', 'Pending', 'Month', 'Future'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === f ? 'bg-jms-dark text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f === 'All' ? 'All Orders' : f === 'Pending' ? 'Pending Quotes' : f === 'Month' ? 'This Month' : 'Upcoming'}
                </button>
              ))}
            </div>
            {filterType !== 'All' && (
              <button onClick={() => setFilterType('All')} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear Filter</button>
            )}
          </div>

          {/* Filter Logic */}
          {(() => {
            let filteredOrders = orders;
            if (filterType === 'Pending') {
              filteredOrders = orders.filter(o => !o.totalEstimatedCost || o.totalEstimatedCost === 0);
            } else if (filterType === 'Month') {
              const now = new Date();
              filteredOrders = orders.filter(o => {
                const d = new Date(o.eventDate);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              });
            } else if (filterType === 'Future') {
              filteredOrders = orders.filter(o => new Date(o.eventDate) >= new Date());
            }

            // Scroll to highlighted order
            if (highlightOrderId) {
              setTimeout(() => {
                const el = document.getElementById(`order-${highlightOrderId}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('ring-4', 'ring-jms-red', 'ring-opacity-50');
                  setTimeout(() => el.classList.remove('ring-4', 'ring-jms-red', 'ring-opacity-50'), 2000);
                  setHighlightOrderId(null);
                }
              }, 100);
            }

            if (filteredOrders.length === 0) {
              return (
                <div className="text-center py-20 bg-white rounded-xl shadow">
                  <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">No orders found for this filter.</p>
                  <button onClick={() => setFilterType('All')} className="mt-4 text-jms-red font-bold hover:underline">View All Orders</button>
                </div>
              );
            }

            return (
              <div className="space-y-8">
                {/* Group by Pending / Confirmed / Completed if 'All' or specific filter needs separation, 
                     but for simplicity in filtered view, we list them directly or group visually.
                     Let's keep the Pending vs Submitted split but apply filter to both lists. 
                 */}

                {/* Pending Quotes Section (if relevant to filter) */}
                {(filterType === 'All' || filterType === 'Pending') && filteredOrders.some(o => !o.totalEstimatedCost || o.totalEstimatedCost === 0) && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 sticky top-20 z-10">
                      <h3 className="font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={18} /> Quote Not Submitted
                      </h3>
                    </div>
                    {filteredOrders
                      .filter(o => !o.totalEstimatedCost || o.totalEstimatedCost === 0)
                      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                      .map(order => (
                        <div id={`order-${order.id}`} key={order.id}>
                          {renderOrder(order)}
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Submitted / confirmed Section */}
                {(filterType !== 'Pending') && filteredOrders.some(o => o.totalEstimatedCost > 0) && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4 sticky top-20 z-10">
                      <h3 className="font-bold text-green-800 uppercase tracking-wider flex items-center gap-2">
                        <Check size={18} /> Orders & Quotes
                      </h3>
                    </div>
                    {filteredOrders
                      .filter(o => o.totalEstimatedCost > 0)
                      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                      .map(order => (
                        <div id={`order-${order.id}`} key={order.id}>
                          {renderOrder(order)}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};