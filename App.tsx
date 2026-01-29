import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { UserRole, MenuItem, Order, PresetMenu } from './types.ts';
import {
  getMenuItems,
  getPresetMenus,
  getOrders,
  addOrder as addOrderService,
  addMenuItem as addMenuItemService,
  deleteMenuItem as deleteMenuItemService,
  addPresetMenu as addPresetMenuService,
  deletePresetMenu as deletePresetMenuService,
  updateOrder as updateOrderService
} from './services/db.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [currentUser, setCurrentUser] = useState<{ name: string, phone: string }>({ name: '', phone: '' });

  // App State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [presetMenus, setPresetMenus] = useState<PresetMenu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const items = await getMenuItems();
      const presets = await getPresetMenus();
      const initialOrders = await getOrders();
      setMenuItems(items || []);
      setPresetMenus(presets || []);
      setOrders(initialOrders || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Simple Router Logic
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role: UserRole, name: string, phone: string) => {
    setUserRole(role);
    setCurrentUser({ name, phone });
    if (role === UserRole.ADMIN) {
      handleNavigate('admin-dashboard');
    } else {
      handleNavigate('customer-history');
    }
  };

  const handleLogout = () => {
    setUserRole(UserRole.GUEST);
    setCurrentUser({ name: '', phone: '' });
    handleNavigate('home');
  };

  const handlePlaceOrder = async (newOrderData: Partial<Order>) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      createdAt: Date.now(),
      customerName: newOrderData.customerName!,
      customerPhone: newOrderData.customerPhone!,
      eventDate: newOrderData.eventDate!,
      eventTime: newOrderData.eventTime!,
      address: newOrderData.address!,
      mealType: newOrderData.mealType!,
      items: newOrderData.items!,
      status: 'Pending',
      totalEstimatedCost: newOrderData.totalEstimatedCost!
    };

    const savedOrder = await addOrderService(newOrder);
    setOrders(prev => [...prev, savedOrder]);
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    console.log('App: handleUpdateOrder called for:', updatedOrder.id);
    const saved = await updateOrderService(updatedOrder);
    console.log('App: Order saved, updating state');
    setOrders(prev => prev.map(o => o.id === saved.id ? saved : o));
  };

  const handleAddMenuItem = async (item: MenuItem) => {
    const savedItem = await addMenuItemService(item);
    setMenuItems(prev => [...prev, savedItem]);
  };

  const handleDeleteMenuItem = async (id: string) => {
    await deleteMenuItemService(id);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddPresetMenu = async (item: PresetMenu) => {
    const savedItem = await addPresetMenuService(item);
    setPresetMenus(prev => [...prev, savedItem]);
  };

  const handleDeletePresetMenu = async (id: string) => {
    await deletePresetMenuService(id);
    setPresetMenus(prev => prev.filter(i => i.id !== id));
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-jms-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading Kitchen...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} userRole={userRole} />;
      case 'login':
        return <Login onLogin={handleLogin} onClose={() => handleNavigate('home')} />;
      case 'admin-dashboard':
        if (userRole !== UserRole.ADMIN) return <Home onNavigate={handleNavigate} userRole={userRole} />;
        return (
          <AdminDashboard
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            presetMenus={presetMenus}
            onAddPresetMenu={handleAddPresetMenu}
            onDeletePresetMenu={handleDeletePresetMenu}
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            viewMode="overview"
          />
        );
      case 'admin-menu':
        if (userRole !== UserRole.ADMIN) return <Home onNavigate={handleNavigate} userRole={userRole} />;
        return (
          <AdminDashboard
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            presetMenus={presetMenus}
            onAddPresetMenu={handleAddPresetMenu}
            onDeletePresetMenu={handleDeletePresetMenu}
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            viewMode="management"
          />
        );
      case 'customer-menu':
        return (
          <CustomerDashboard
            menuItems={menuItems}
            presetMenus={presetMenus}
            onPlaceOrder={handlePlaceOrder}
            currentUser={currentUser}
          />
        );
      case 'customer-history':
        if (userRole !== UserRole.CUSTOMER) return <Login onLogin={handleLogin} onClose={() => handleNavigate('home')} />;
        return (
          <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">My Quote Requests</h2>
              {orders.filter(o => o.customerPhone === currentUser.phone).length === 0 ? (
                <p>No active requests found.</p>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.customerPhone === currentUser.phone).map(o => (
                    <div key={o.id} className="bg-white p-6 rounded shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">Request #{o.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded font-bold ${o.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Event Details</p>
                          <p>{new Date(o.eventDate).toLocaleDateString()} at {o.eventTime}</p>
                          <p className="text-sm truncate">{o.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Summary</p>
                          <ul className="list-disc list-inside text-sm">
                            {o.items.map((i, idx) => (
                              <li key={idx}>
                                {i.name} (Qty: {i.quantity})
                                {i.isPreset && i.selectedOptions && (
                                  <ul className="pl-4 list-none text-xs text-gray-600">
                                    {Object.entries(i.selectedOptions).map(([key, val]) => (
                                      <li key={key}>- {key}: {val}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                          <p className="font-bold mt-2 text-jms-red">Est. Cost: ₹ {o.totalEstimatedCost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <Home onNavigate={handleNavigate} userRole={userRole} />;
    }
  };

  return (
    <div className="font-sans text-slate-900">
      {currentPage !== 'login' && (
        <Navbar
          userRole={userRole}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      )}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}