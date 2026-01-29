import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, Phone, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Logo } from '../components/Logo';

interface LoginProps {
  onLogin: (role: UserRole, name: string, phone: string) => void;
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  const [step, setStep] = useState<'phone' | 'auth'>('phone');
  const [phone, setPhone] = useState('');
  const [authInput, setAuthInput] = useState(''); // Password or OTP
  const [isAdmin, setIsAdmin] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    // Check if it's the admin number
    if (phone === '9840364388') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setStep('auth');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      // Admin Password Check
      if (authInput === 'admin') {
        onLogin(UserRole.ADMIN, 'J. Mohan Singh', phone);
      } else {
        alert('Incorrect Password');
      }
    } else {
      // OTP Check (Simulated)
      if (authInput === '1234') {
        onLogin(UserRole.CUSTOMER, 'Customer', phone);
      } else {
        alert('Invalid OTP (Use 1234)');
      }
    }
  };

  const reset = () => {
    setStep('phone');
    setAuthInput('');
    setIsAdmin(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://picsum.photos/id/292/1920/1080')] bg-cover bg-center">
      <div className="absolute inset-0 bg-jms-dark/80 backdrop-blur-sm"></div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border-t-4 border-jms-red relative">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-6">
            <Logo className="h-16" />
          </div>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <h2 className="text-center text-xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-center text-gray-500 text-sm">Enter your phone number to continue</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Phone className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="focus:ring-jms-red focus:border-jms-red block w-full pl-10 py-3 border-gray-300 rounded-md border"
                    placeholder="9840364388"
                    autoFocus
                   />
                </div>
              </div>

              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jms-green hover:bg-green-700 transition">
                Continue <ArrowRight size={16} className="ml-2" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-6">
               <h2 className="text-center text-xl font-bold text-gray-800">
                 {isAdmin ? 'Admin Verification' : 'Verify OTP'}
               </h2>
               <p className="text-center text-gray-500 text-sm">
                 {isAdmin ? 'Enter your admin password' : `OTP sent to ${phone}`}
               </p>

               <div>
                 <label className="block text-sm font-medium text-gray-700">
                   {isAdmin ? 'Password' : 'Enter OTP'}
                 </label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isAdmin ? <Lock className="h-5 w-5 text-gray-400" /> : <ShieldCheck className="h-5 w-5 text-gray-400" />}
                    </div>
                    <input
                     type={isAdmin ? "password" : "text"}
                     value={authInput}
                     onChange={(e) => setAuthInput(e.target.value)}
                     className="focus:ring-jms-red focus:border-jms-red block w-full pl-10 py-3 border-gray-300 rounded-md border"
                     placeholder={isAdmin ? "********" : "1234"}
                     autoFocus
                    />
                 </div>
                 {!isAdmin && <p className="text-xs text-gray-400 mt-1">Demo OTP: 1234</p>}
               </div>

               <div className="flex gap-3">
                 <button type="button" onClick={reset} className="flex-1 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">
                   Back
                 </button>
                 <button type="submit" className="flex-1 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jms-green hover:bg-green-700">
                   {isAdmin ? 'Login' : 'Verify'}
                 </button>
               </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
             JMS Catering Secure Login
          </div>
        </div>
      </div>
    </div>
  );
};