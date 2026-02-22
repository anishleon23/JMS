import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, Phone, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { getUserByPhone, addUser } from '../services/db';

interface LoginProps {
  onLogin: (role: UserRole, name: string, phone: string) => void;
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  /* State */
  const [step, setStep] = useState<'phone' | 'auth' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [authInput, setAuthInput] = useState(''); // Password or OTP
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<{ role: UserRole, name?: string, password?: string } | null>(null);

  /* Registration State */
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    // Check DB for user
    const user = await getUserByPhone(phone);

    if (user) {
      setFetchedUser({ role: user.role, name: user.name, password: user.password });
      setIsAdmin(user.role === UserRole.ADMIN);
      setStep('auth');
    } else {
      // User not found -> Offer Registration or Login as Guest
      // For this flow, let's assume unknown phone = potential new user
      // But we can also stick to the "OTP for guests" if we want.
      // Let's Guide to Registration if explicitly requested, OR 
      // if unknown, maybe show "Account not found. Sign Up?"
      // For simplicity matching the plan: 
      // User enters phone -> if known, login. If unknown -> Guest OTP (Customer).
      // BUT we need a button "New User? Sign Up" to switch to Register mode explicitly.
      setFetchedUser(null);
      setIsAdmin(false);
      setStep('auth');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!regName) {
      alert("Name is required");
      return;
    }

    // Check if user already exists
    const existing = await getUserByPhone(phone);
    if (existing) {
      alert("User already exists. Please login.");
      setStep('phone');
      return;
    }

    const newUser = {
      username: phone, // Use phone as username
      phone,
      name: regName,
      role: UserRole.CUSTOMER,
      password: regPassword
    };

    await addUser(newUser);
    alert("Registration Successful! Please login.");
    // Auto login? or go to phone step? 
    // Let's go to phone step to verify flow
    setStep('phone');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin && fetchedUser?.password) {
      // Admin Password Check from DB
      if (authInput === fetchedUser.password) {
        onLogin(UserRole.ADMIN, fetchedUser.name || 'Admin', phone);
      } else {
        alert('Incorrect Password');
      }
    } else if (fetchedUser?.password) {
      // Customer with Password
      if (authInput === fetchedUser.password) {
        onLogin(UserRole.CUSTOMER, fetchedUser.name || 'Customer', phone);
      } else {
        alert('Incorrect Password');
      }
    } else {
      // OTP Check (Simulated for Demo or Guests/Old Customers with no password)
      if (authInput === '1234') {
        const name = fetchedUser?.name || 'Customer';
        onLogin(UserRole.CUSTOMER, name, phone);
      } else {
        alert('Invalid OTP (Use 1234)');
      }
    }
  };

  const reset = () => {
    setStep('phone');
    setAuthInput('');
    setIsAdmin(false);
    setFetchedUser(null);
    setRegName('');
    setRegPassword('');
    setRegConfirmPassword('');
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
            <div className="space-y-6">
              <form onSubmit={handlePhoneSubmit}>
                <h2 className="text-center text-xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-center text-gray-500 text-sm">Enter your phone number to continue</p>

                <div className="my-6">
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
                      placeholder="Enter mobile number"
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jms-green hover:bg-green-700 transition">
                  Continue <ArrowRight size={16} className="ml-2" />
                </button>
              </form>

              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600">New to JMS Catering?</p>
                <button onClick={() => setStep('register')} className="text-jms-red font-bold hover:underline text-sm">Create an Account</button>
              </div>
            </div>
          ) : step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-center text-xl font-bold text-gray-800">Create Account</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded bg-gray-100" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full p-2 border rounded" placeholder="Your Name" required autoFocus />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="create password" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="repeat password" required />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={reset} className="flex-1 py-2 border rounded text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-jms-red text-white rounded font-bold">Sign Up</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <h2 className="text-center text-xl font-bold text-gray-800">
                {isAdmin ? 'Admin Verification' : 'Verify Identity'}
              </h2>
              <p className="text-center text-gray-500 text-sm">
                {/* Provide context on what to enter */}
                {fetchedUser?.password
                  ? `Welcome back, ${fetchedUser.name}`
                  : `OTP sent to ${phone}`}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {fetchedUser?.password ? 'Password' : 'Enter OTP'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {fetchedUser?.password ? <Lock className="h-5 w-5 text-gray-400" /> : <ShieldCheck className="h-5 w-5 text-gray-400" />}
                  </div>
                  <input
                    type={fetchedUser?.password ? "password" : "text"}
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    className="focus:ring-jms-red focus:border-jms-red block w-full pl-10 py-3 border-gray-300 rounded-md border"
                    placeholder={fetchedUser?.password ? "Enter password" : "1234"}
                    autoFocus
                  />
                </div>
                {!fetchedUser?.password && <p className="text-xs text-gray-400 mt-1">Demo OTP: 1234</p>}
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