import React from 'react';
import { UserRole } from '../types.ts';
import { Logo } from './Logo.tsx';
import { LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  userRole: UserRole;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, onNavigate, currentPage, onOpenProfile }) => {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo className="h-10 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">JMS Catering</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('home')} className={`${currentPage === 'home' ? 'text-jms-red' : 'text-gray-500'} hover:text-gray-900 font-medium`}>Home</button>
            <button onClick={() => { onNavigate('home'); setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-gray-500 hover:text-gray-900 font-medium">Menu</button>
            <button onClick={() => { onNavigate('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-gray-500 hover:text-gray-900 font-medium">About Us</button>

            {userRole === UserRole.ADMIN && (
              <>
                <button onClick={() => onNavigate('admin-dashboard')} className={`${currentPage === 'admin-dashboard' ? 'text-jms-red' : 'text-gray-500'} hover:text-gray-900 font-medium`}>Dashboard</button>
                <button onClick={() => onNavigate('admin-menu')} className={`${currentPage === 'admin-menu' ? 'text-jms-red' : 'text-gray-500'} hover:text-gray-900 font-medium`}>Manage Menu</button>
              </>
            )}

            {userRole === UserRole.CUSTOMER && (
              <button onClick={() => onNavigate('customer-menu')} className={`${currentPage === 'customer-menu' ? 'text-jms-red' : 'text-gray-500'} hover:text-gray-900 font-medium`}>Order Food</button>
            )}

            <div className="flex items-center gap-2">
              {userRole === UserRole.GUEST ? (
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-jms-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                >
                  Login
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Profile Button */}
                  <button
                    onClick={onOpenProfile}
                    className="p-2 text-gray-500 hover:text-jms-red hover:bg-gray-100 rounded-full transition"
                    title="My Profile"
                  >
                    <UserIcon size={20} />
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};