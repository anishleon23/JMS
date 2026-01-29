import React from 'react';
import { UserRole } from '../types.ts';
import { Logo } from './Logo.tsx';
import { LogOut, User as UserIcon, Menu, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  userRole: UserRole;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, onNavigate, currentPage }) => {

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo className="h-16" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-gray-700 hover:text-jms-red font-medium transition ${currentPage === 'home' ? 'text-jms-red' : ''}`}
            >
              Home
            </button>

            {(userRole === UserRole.GUEST || userRole === UserRole.CUSTOMER) && (
              <button
                onClick={() => onNavigate('customer-menu')}
                className={`text-gray-700 hover:text-jms-red font-medium transition flex items-center gap-1 ${currentPage === 'customer-menu' ? 'text-jms-red' : ''}`}
              >
                <ShoppingBag size={18} />
                Order Food
              </button>
            )}

            {userRole === UserRole.GUEST && (
              <a
                href="#contact"
                onClick={handleContactClick}
                className="text-gray-700 hover:text-jms-red font-medium transition"
              >
                Contact
              </a>
            )}

            {userRole === UserRole.ADMIN && (
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`text-gray-700 hover:text-jms-red font-medium ${currentPage === 'admin-dashboard' ? 'text-jms-red' : ''}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('admin-menu')}
                  className={`text-gray-700 hover:text-jms-red font-medium ${currentPage === 'admin-menu' ? 'text-jms-red' : ''}`}
                >
                  Manage Menu
                </button>
              </>
            )}

            {userRole === UserRole.CUSTOMER && (
              <button
                onClick={() => onNavigate('customer-history')}
                className={`text-gray-700 hover:text-jms-red font-medium ${currentPage === 'customer-history' ? 'text-jms-red' : ''}`}
              >
                My History
              </button>
            )}

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              {userRole === UserRole.GUEST ? (
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <UserIcon size={18} />
                  Login
                </button>
              ) : (
                <button
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <Menu className="text-gray-600 h-8 w-8" />
          </div>
        </div>
      </div>
    </nav>
  );
};