import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Order, OrderItem, MealType, PresetMenu } from '../types.ts';
import { Minus, Plus, ShoppingCart, Calendar, Check, Package, Utensils, X, ChevronRight, User, Users, Phone, MapPin, Clock, ArrowDown, ChevronDown, Search } from 'lucide-react';
import { getCustomerByPhone } from '../services/db.ts';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerDashboardProps {
  menuItems: MenuItem[];
  presetMenus: PresetMenu[];
  onPlaceOrder: (order: Partial<Order>) => void;
  currentUser: { name: string; phone: string };
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ menuItems, presetMenus, onPlaceOrder, currentUser }) => {
  const [activeView, setActiveView] = useState<'packages' | 'alacarte'>('packages');
  const [activeCategory, setActiveCategory] = useState<string>('Sweet');
  const [cart, setCart] = useState<MenuItem[]>([]);

  const [selectedPreset, setSelectedPreset] = useState<PresetMenu | null>(null);
  const [presetOptions, setPresetOptions] = useState<Record<string, string>>({});
  const [showPackageForm, setShowPackageForm] = useState(false);
  const packageFormRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pax, setPax] = useState<number>(50);
  const [eventDate, setEventDate] = useState('');
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [showQuoteSuccess, setShowQuoteSuccess] = useState(false);

  useEffect(() => {
    if (currentUser.name) setCustomerName(currentUser.name);
    if (currentUser.phone) setCustomerPhone(currentUser.phone);
  }, [currentUser]);

  const handlePhoneBlur = async () => {
    if (customerPhone.length >= 10 && !customerName) {
      const name = await getCustomerByPhone(customerPhone);
      if (name) setCustomerName(name);
    }
  };

  const toggleItemInCart = (item: MenuItem) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      setCart(cart.filter(i => i.id !== item.id));
    } else {
      setCart([...cart, item]);
    }
  };

  const handleRequestQuoteCart = () => {
    if (cart.length === 0 || !customerName || !customerPhone || !eventDate || !address) {
      alert("Please fill in all details and add items to your menu.");
      return;
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      ...item,
      quantity: 1
    }));

    onPlaceOrder({
      customerName,
      customerPhone,
      eventDate,
      eventTime: '00:00',
      mealType,
      address,
      items: orderItems,
      guestCount: pax,
      status: 'Pending',
      totalEstimatedCost: 0
    });
    triggerSuccess();
  };

  const handleRequestQuotePackage = () => {
    if (!selectedPreset || !customerName || !customerPhone || !pax || !eventDate) {
      alert("Please fill in all required fields.");
      return;
    }
    const presetItem: OrderItem = {
      id: selectedPreset.id,
      name: selectedPreset.name,
      description: 'Preset Package',
      price: 0,
      category: 'Package',
      foodCategory: 'Package',
      quantity: pax,
      isPreset: true,
      selectedOptions: presetOptions
    };
    const totalCost = selectedPreset.pricePerHead * pax;
    onPlaceOrder({
      customerName,
      customerPhone,
      eventDate,
      eventTime: '00:00',
      mealType,
      address: address || 'Not Provided',
      items: [presetItem],
      guestCount: pax,
      totalEstimatedCost: 0, // Set to 0 so it appears as "Quote Not Submitted" for admin
      perHeadAmount: selectedPreset.pricePerHead, // Store the per head amount for reference
      status: 'Pending'
    });
    triggerSuccess();
    setSelectedPreset(null);
  };

  const triggerSuccess = () => {
    setShowQuoteSuccess(true);
    setTimeout(() => {
      setShowQuoteSuccess(false);
      setCart([]);
      if (!currentUser.name) setCustomerName('');
      if (!currentUser.phone) setCustomerPhone('');
      setAddress('');
      setEventDate('');
      setPax(50);
    }, 4000);
  }

  const openPresetModal = (preset: PresetMenu) => {
    setSelectedPreset(preset);
    const defaults: Record<string, string> = {};
    preset.options.forEach(opt => {
      if (opt.choices.length > 0) defaults[opt.label] = opt.choices[0];
    });
    setPresetOptions(defaults);
    setPax(50);
    setShowPackageForm(false);
  };

  const handleShowForm = () => {
    setShowPackageForm(true);
    setTimeout(() => {
      packageFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (showQuoteSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner"
          >
            <Check size={48} strokeWidth={3} />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-6 font-medium">Thank you, {customerName}. <br />We will contact you shortly.</p>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4 }} className="h-full bg-jms-green" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
      {/* Visual Header */}
      <div className="bg-jms-dark text-white relative overflow-hidden h-64 md:h-80 flex items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <img src="/hero_buffet.png" alt="Menu Header" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-jms-dark via-jms-dark/60 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
          >
            Plan Your Menu
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-200 text-lg max-w-xl mx-auto"
          >
            Choose from our curated packages or customize your own grand feast.
          </motion.p>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => setActiveView('packages')} className={`px-8 py-3 rounded-full font-bold transition flex items-center gap-2 transform hover:scale-105 shadow-lg ${activeView === 'packages' ? 'bg-jms-red text-white ring-2 ring-red-300' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'}`}>
              <Package size={20} /> Packages
            </button>
            <button onClick={() => setActiveView('alacarte')} className={`px-8 py-3 rounded-full font-bold transition flex items-center gap-2 transform hover:scale-105 shadow-lg ${activeView === 'alacarte' ? 'bg-jms-red text-white ring-2 ring-red-300' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'}`}>
              <Utensils size={20} /> Build Your Own
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {activeView === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-8 min-h-[400px] border border-gray-100"
            >
              {['Breakfast Packages', 'Lunch Packages', 'Dinner Packages'].map(type => {
                const pkgs = presetMenus.filter(p => type.toLowerCase().includes(p.category.toLowerCase()));
                if (pkgs.length === 0) return null;
                return (
                  <div key={type} className="mb-12 last:mb-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-10 w-1 bg-jms-red rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-800">{type}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {pkgs.map(p => (
                        <motion.div
                          key={p.id}
                          whileHover={{ y: -5 }}
                          onClick={() => openPresetModal(p)}
                          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer group"
                        >
                          <div className="h-32 bg-gray-100 relative overflow-hidden">
                            {/* Placeholder pattern or image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-jms-orange/20 to-jms-red/20 group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="absolute bottom-4 left-4 font-bold text-jms-dark bg-white/90 px-3 py-1 rounded-lg shadow-sm backdrop-blur-sm">
                              ₹ {p.pricePerHead} / head
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-xl font-bold text-gray-800 group-hover:text-jms-red transition-colors">{p.name}</h4>
                            </div>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.description || "A complete meal package."}</p>
                            <button className="w-full py-2 rounded-lg bg-gray-50 text-jms-dark font-bold group-hover:bg-jms-dark group-hover:text-white transition-colors">
                              View Details
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeView === 'alacarte' && (
            <motion.div
              key="alacarte"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Select Items</h2>

                {/* Category Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                  {['Sweet', 'Tiffen', 'Rice & Main Course', 'Side Dishes', 'Snacks', 'Beverages', 'Others'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition shadow-sm ${activeCategory === cat ? 'bg-jms-red text-white shadow-red-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Item List */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {menuItems.filter(item => item.foodCategory === activeCategory).map(item => {
                    const inCart = cart.find(c => c.id === item.id);
                    return (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        key={item.id}
                        className={`border rounded-2xl p-4 flex items-center justify-between transition ${inCart ? 'border-jms-green bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inCart ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {inCart ? <Check size={20} /> : <Utensils size={20} />}
                          </div>
                          <div>
                            <h3 className={`font-bold ${inCart ? 'text-green-800' : 'text-gray-900'}`}>{item.name}</h3>
                            {/* <p className="text-xs text-gray-500">{item.description}</p> */}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleItemInCart(item)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${inCart ? 'bg-white text-red-500 border border-red-100 hover:bg-red-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                        >
                          {inCart ? <Minus size={18} /> : <Plus size={18} />}
                        </button>
                      </motion.div>
                    );
                  })}
                  {menuItems.filter(item => item.foodCategory === activeCategory).length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                      <p>No items found in this category.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={24} className="text-jms-red" /> Your Selection</h2>
                    <span className="bg-jms-dark text-white text-xs font-bold px-2 py-1 rounded-full">{cart.length} items</span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <ShoppingCart size={32} />
                      </div>
                      <p className="text-gray-400 text-sm">Your menu is empty.</p>
                      <p className="text-gray-400 text-xs">Start adding items from the left.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                      {cart.map((i, idx) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{i.name}</span>
                          <button onClick={() => toggleItemInCart(i)} className="text-red-400 hover:text-red-600 bg-white p-1 rounded shadow-sm"><X size={14} /></button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Form fields simplified visually */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                      <h5 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-1"><Calendar size={12} /> Event Details</h5>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full mb-2 p-2.5 rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-blue-200 border"
                      />
                      <div className="flex gap-2">
                        <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="flex-1 p-2.5 rounded-lg border-gray-200 text-sm border bg-white">
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                        </select>
                        <input type="number" min="20" value={pax} onChange={e => setPax(Number(e.target.value))} className="w-20 p-2.5 rounded-lg border-gray-200 text-sm border" placeholder="Pax" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1"><User size={12} /> Your Info</h5>
                      <input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full mb-2 p-2.5 rounded-lg border-gray-200 text-sm border focus:ring-2 focus:ring-gray-200" />
                      <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} onBlur={handlePhoneBlur} className="w-full mb-2 p-2.5 rounded-lg border-gray-200 text-sm border focus:ring-2 focus:ring-gray-200" />
                      <textarea placeholder="Event Location" value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full p-2.5 rounded-lg border-gray-200 text-sm border focus:ring-2 focus:ring-gray-200"></textarea>
                    </div>

                    <button onClick={handleRequestQuoteCart} disabled={cart.length === 0} className="w-full bg-jms-dark hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95">
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPreset && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedPreset.name}</h3>
                  <p className="text-jms-green font-bold text-sm">₹ {selectedPreset.pricePerHead} / plate</p>
                </div>
                <button onClick={() => setSelectedPreset(null)} className="p-2 bg-white shadow-sm hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="mb-8">
                  <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Check size={16} className="text-green-500" /> Package Contents</h4>
                  <div className="space-y-4 mb-6">
                    {/* Fixed Items */}
                    {selectedPreset.fixedItems.map((item, i) => (
                      <div key={`fixed-${i}`} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 font-medium py-0.5">{item}</span>
                      </div>
                    ))}

                    {/* Customizable Options */}
                    {selectedPreset.options.map((option, idx) => {
                      const itemNumber = selectedPreset.fixedItems.length + idx + 1;
                      return (
                        <div key={`opt-${idx}`} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {itemNumber}
                          </span>
                          <div className="flex-1">
                            <span className="block text-gray-800 font-medium mb-2 py-0.5">
                              {option.label} <span className="text-gray-400 text-xs font-normal ml-1">(Choose one)</span>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {option.choices.map((c, ci) => (
                                <button
                                  key={ci}
                                  onClick={() => setPresetOptions({ ...presetOptions, [option.label]: c })}
                                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${presetOptions[option.label] === c ? 'bg-jms-dark text-white border-jms-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {showPackageForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} ref={packageFormRef} className="pt-6 border-t space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h5 className="text-xs font-bold text-blue-800 uppercase mb-3">Event Details</h5>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-blue-900/70 mb-1">Date</label>
                          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-2.5 rounded-lg border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 border" />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-900/70 mb-1">Guests</label>
                          <input type="number" value={pax} onChange={e => setPax(Number(e.target.value))} className="w-full p-2.5 rounded-lg border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 border" />
                        </div>
                      </div>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full Venue Address" rows={2} className="w-full p-2.5 rounded-lg border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 border"></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-600 uppercase mb-3">Your Info</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 rounded-lg border-gray-200 text-sm border" />
                        <input type="tel" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} onBlur={handlePhoneBlur} className="w-full p-2.5 rounded-lg border-gray-200 text-sm border" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="p-6 border-t bg-gray-50">
                {!showPackageForm ? (
                  <button onClick={handleShowForm} className="w-full bg-jms-dark text-white py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition">Proceed to Quote</button>
                ) : (
                  <button onClick={handleRequestQuotePackage} className="w-full bg-gradient-to-r from-jms-green to-green-600 text-white py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition">Confirm & Request</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};