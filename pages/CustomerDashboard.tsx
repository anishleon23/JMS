import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Order, OrderItem, MealType, PresetMenu } from '../types.ts';
import { Minus, Plus, ShoppingCart, Calendar, Check, Package, Utensils, X, ChevronRight, User, Users, Phone, MapPin, Clock, ArrowDown, ChevronDown } from 'lucide-react';
import { getCustomerByPhone } from '../services/db.ts';

interface CustomerDashboardProps {
  menuItems: MenuItem[];
  presetMenus: PresetMenu[];
  onPlaceOrder: (order: Partial<Order>) => void;
  currentUser: { name: string; phone: string };
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ menuItems, presetMenus, onPlaceOrder, currentUser }) => {
  const [activeView, setActiveView] = useState<'packages' | 'alacarte'>('packages');
  const [activeCategory, setActiveCategory] = useState<string>('Sweet'); // Default category
  const [cart, setCart] = useState<MenuItem[]>([]); // Cart is now just a list of items (no quantity)

  const [selectedPreset, setSelectedPreset] = useState<PresetMenu | null>(null);
  const [presetOptions, setPresetOptions] = useState<Record<string, string>>({});
  const [showPackageForm, setShowPackageForm] = useState(false);
  const packageFormRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pax, setPax] = useState<number>(50); // Default guest count
  const [eventDate, setEventDate] = useState('');
  // const [eventTime, setEventTime] = useState(''); // Removed Time
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

    // In "Build Your Own", cost is usually per head based on selection + pax, or raw item total.
    // Given the prompt "move number of person into event details", it implies a per-head model.
    // However, if we don't have prices for everything, we might just list them.
    // For now, let's assume it's a request for quote, so price estimation might happen on Admin side 
    // OR we calculate based on item prices * pax if items have per-head prices?
    // Usually A La Carte items have fixed prices or per-head prices. 
    // Let's pass the cart items. Since we removed quantity, we assume 1 "unit" per guest or just "Included".
    // We'll map them to OrderItems with quantity = pax (if per head) or just 1 (if reference).
    // Let's set quantity to 1 for the list, and let admin decide. 
    // actually, usually "Build Your Own" means "I want these items for 100 people".

    const orderItems: OrderItem[] = cart.map(item => ({
      ...item,
      quantity: 1 // Just a marker that this item is selected
    }));

    onPlaceOrder({
      customerName,
      customerPhone,
      eventDate,
      eventTime: '00:00', // Default or removed
      mealType,
      address,
      items: orderItems,
      guestCount: pax, // Important
      status: 'Pending',
      totalEstimatedCost: 0 // to be estimated by admin
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
      mealType, // Use selected meal type
      address: address || 'Not Provided',
      items: [presetItem],
      guestCount: pax,
      totalEstimatedCost: totalCost,
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
      // setEventTime(''); // Removed
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quote Requested!</h2>
          <p className="text-gray-600 mb-4">Thank you, {customerName}. Your request has been sent to JMS Catering.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <div className="bg-jms-dark text-white py-8 pb-16 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Our Menu</h1>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setActiveView('packages')} className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2 ${activeView === 'packages' ? 'bg-jms-red text-white' : 'bg-white/10 text-gray-300'}`}><Package size={18} /> Packages</button>
          <button onClick={() => setActiveView('alacarte')} className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2 ${activeView === 'alacarte' ? 'bg-jms-red text-white' : 'bg-white/10 text-gray-300'}`}><Utensils size={18} /> Build Your Own Menu</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {activeView === 'packages' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px]">
            {['Breakfast Packages', 'Lunch Packages', 'Dinner Packages'].map(type => {
              const pkgs = presetMenus.filter(p => type.toLowerCase().includes(p.category.toLowerCase()));
              if (pkgs.length === 0) return null;
              return (
                <div key={type} className="mb-10">
                  <h3 className="text-xl font-bold text-jms-dark mb-4 pl-2 border-l-4 border-jms-red">{type}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {pkgs.map(p => (
                      <div key={p.id} onClick={() => openPresetModal(p)} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-gray-800">{p.name}</h4>
                          <ChevronRight className="text-jms-orange" size={20} />
                        </div>
                        <p className="text-gray-500 text-sm">{p.description}</p>
                        <div className="bg-jms-green/10 mt-4 p-2 text-center text-jms-green font-bold text-sm rounded">Get Quote</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeView === 'alacarte' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Build Your Own Menu</h2>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {['Sweet', 'Tiffen', 'Rice & Main Course', 'Side Dishes', 'Snacks', 'Beverages', 'Others'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat ? 'bg-jms-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Vertical Item List */}
              <div className="space-y-3">
                {menuItems.filter(item => item.foodCategory === activeCategory).map(item => {
                  const inCart = cart.find(c => c.id === item.id);
                  return (
                    <div key={item.id} className="border border-gray-100 rounded-lg p-4 bg-white flex items-center justify-between hover:shadow-sm transition">
                      <div className="flex items-center gap-4">
                        {/* Placeholder for Item Image if needed */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Utensils size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleItemInCart(item)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${inCart ? 'bg-jms-red text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {inCart ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  );
                })}
                {menuItems.filter(item => item.category === activeCategory).length === 0 && (
                  <p className="text-center text-gray-400 py-10">No items found in this category.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShoppingCart size={24} /> Review</h2>
                {cart.length === 0 ? <p className="text-center py-4 text-gray-400">No items selected</p> : (
                  <div className="space-y-2 mb-4">
                    {cart.map((i, idx) => (<div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50"><span>{i.name}</span> <button onClick={() => toggleItemInCart(i)} className="text-red-400"><X size={14} /></button></div>))}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Event Details</h5>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Date *</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={e => {
                            const selectedDate = new Date(e.target.value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (selectedDate < today) {
                              alert("Event date cannot be in the past!");
                              return;
                            }
                            setEventDate(e.target.value);
                          }}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Meal Type *</label>
                        <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full p-2 border rounded text-sm">
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Number of Guests *</label>
                      <input type="number" min="20" value={pax} onChange={e => setPax(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Location *</label>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="w-full p-2 border rounded text-sm" rows={2}></textarea>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Contact Info</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Name *</label>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} onBlur={handlePhoneBlur} className="w-full p-2 border rounded text-sm" />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleRequestQuoteCart} className="w-full bg-jms-green text-white font-bold py-3 rounded-lg">Submit</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPreset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-800">{selectedPreset.name}</h3>
              <button onClick={() => setSelectedPreset(null)} className="p-2 bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">Included Menu</h4>
                <ul className="space-y-2 text-sm">
                  {selectedPreset.fixedItems.map((item, i) => (<li key={i} className="font-medium">• {item}</li>))}
                  {selectedPreset.options.map((option, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">• {option.label}:</span>
                      <select value={presetOptions[option.label] || ''} onChange={e => setPresetOptions({ ...presetOptions, [option.label]: e.target.value })} className="border rounded px-1 py-1 text-xs">
                        {option.choices.map((c, ci) => (<option key={ci} value={c}>{c}</option>))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
              {showPackageForm && (
                <div ref={packageFormRef} className="pt-6 border-t space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Event Details</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Event Date *</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={e => {
                            const selectedDate = new Date(e.target.value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (selectedDate < today) {
                              alert("Event date cannot be in the past!");
                              return;
                            }
                            setEventDate(e.target.value);
                          }}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Meal Type *</label>
                        <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full p-2 border rounded-lg text-sm">
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">Number of Guests *</label>
                      <input type="number" min="20" value={pax} onChange={e => setPax(Number(e.target.value))} placeholder="Minimum 20" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Location *</label>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete Address / Venue" rows={2} className="w-full p-2 border rounded-lg text-sm"></textarea>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Contact Info</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Name *</label>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} onBlur={handlePhoneBlur} className="w-full p-2 border rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Removed standalone guest count from here as it moved up */}
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              {!showPackageForm ? (
                <button onClick={handleShowForm} className="w-full bg-jms-dark text-white py-4 rounded-xl font-bold shadow-lg">Request Quote</button>
              ) : (
                <button onClick={handleRequestQuotePackage} className="w-full bg-jms-green text-white py-4 rounded-xl font-bold shadow-lg">Submit Request</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};