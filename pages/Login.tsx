import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, Phone, ArrowRight, ShieldCheck, X, Mail, KeyRound } from 'lucide-react';
import { Logo } from '../components/Logo';
import { getUserByPhone, addUser } from '../services/db';
import { sendPasswordReset } from '../lib/firebase';

interface LoginProps {
  onLogin: (role: UserRole, name: string, phone: string, email?: string) => void;
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  /* State */
  const [step, setStep] = useState<'phone' | 'auth' | 'register' | 'forgot'>('phone');
  const [phone, setPhone] = useState('');
  const [authInput, setAuthInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<{ role: UserRole, name?: string, email?: string, password?: string } | null>(null);

  /* Registration State */
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  /* Forgot Password State */
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    const user = await getUserByPhone(phone);

    if (user) {
      setFetchedUser({ role: user.role, name: user.name, email: user.email, password: user.password });
      setIsAdmin(user.role === UserRole.ADMIN);
      setStep('auth');
    } else {
      setFetchedUser(null);
      setIsAdmin(false);
      setStep('auth');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) { alert('Name is required'); return; }
    if (!regEmail) { alert('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { alert('Please enter a valid email address'); return; }
    if (regPassword !== regConfirmPassword) { alert('Passwords do not match'); return; }
    if (regPassword.length < 4) { alert('Password must be at least 4 characters'); return; }

    const existing = await getUserByPhone(phone);
    if (existing) {
      alert('User already exists. Please login.');
      setStep('phone');
      return;
    }

    const newUser = {
      username: phone,
      phone,
      name: regName,
      email: regEmail,
      role: UserRole.CUSTOMER,
      password: regPassword,
    };

    await addUser(newUser);
    alert('Registration Successful! Please login.');
    reset();
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin && fetchedUser?.password) {
      if (authInput === fetchedUser.password) {
        onLogin(UserRole.ADMIN, fetchedUser.name || 'Admin', phone, fetchedUser.email);
      } else {
        alert('Incorrect Password');
      }
    } else if (fetchedUser?.password) {
      if (authInput === fetchedUser.password) {
        onLogin(UserRole.CUSTOMER, fetchedUser.name || 'Customer', phone, fetchedUser.email);
      } else {
        alert('Incorrect Password');
      }
    } else {
      if (authInput === '1234') {
        onLogin(UserRole.CUSTOMER, fetchedUser?.name || 'Customer', phone, fetchedUser?.email);
      } else {
        alert('Invalid OTP (Use 1234)');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    setForgotLoading(true);

    const result = await sendPasswordReset(forgotEmail);

    if (result.success) {
      setForgotMessage({
        text: `✅ Reset link sent to ${forgotEmail}. Please check your inbox (and spam folder).`,
        type: 'success',
      });
    } else {
      setForgotMessage({ text: result.error || 'Something went wrong.', type: 'error' });
    }
    setForgotLoading(false);
  };

  const reset = () => {
    setStep('phone');
    setAuthInput('');
    setIsAdmin(false);
    setFetchedUser(null);
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setForgotEmail('');
    setForgotMessage(null);
  };

  const inputClass = 'focus:ring-jms-red focus:border-jms-red block w-full py-3 border-gray-300 rounded-md border';

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

          {/* ── PHONE STEP ─────────────────────────────────── */}
          {step === 'phone' && (
            <div className="space-y-6">
              <form onSubmit={handlePhoneSubmit}>
                <h2 className="text-center text-xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-center text-gray-500 text-sm mb-6">Enter your phone number to continue</p>

                <div className="my-4">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClass} pl-10`}
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
                <button onClick={() => setStep('register')} className="text-jms-red font-bold hover:underline text-sm">
                  Create an Account
                </button>
              </div>
            </div>
          )}

          {/* ── REGISTER STEP ──────────────────────────────── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-center text-xl font-bold text-gray-800">Create Account</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 p-2.5 border rounded bg-gray-50 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                  placeholder="Your Name" required autoFocus />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 p-2.5 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                    placeholder="you@example.com" required />
                </div>
                <p className="text-xs text-gray-400 mt-1">Used for password reset if you forget your password.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 p-2.5 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                    placeholder="Create password (min 4 chars)" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-9 p-2.5 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                    placeholder="Repeat password" required />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={reset} className="flex-1 py-2.5 border rounded text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-jms-red text-white rounded font-bold hover:bg-jms-dark transition">Sign Up</button>
              </div>
            </form>
          )}

          {/* ── AUTH STEP ──────────────────────────────────── */}
          {step === 'auth' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <h2 className="text-center text-xl font-bold text-gray-800">
                {isAdmin ? 'Admin Verification' : 'Verify Identity'}
              </h2>
              <p className="text-center text-gray-500 text-sm">
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
                    type={fetchedUser?.password ? 'password' : 'text'}
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder={fetchedUser?.password ? 'Enter password' : '1234'}
                    autoFocus
                  />
                </div>
                {!fetchedUser?.password && <p className="text-xs text-gray-400 mt-1">Demo OTP: 1234</p>}
              </div>

              {/* Forgot Password link — only show when user has a password */}
              {fetchedUser?.password && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(''); setForgotMessage(null); setStep('forgot'); }}
                    className="text-xs text-jms-red hover:underline font-medium flex items-center gap-1 ml-auto"
                  >
                    <KeyRound size={12} /> Forgot Password?
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={reset} className="flex-1 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition">
                  Back
                </button>
                <button type="submit" className="flex-1 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jms-green hover:bg-green-700 transition">
                  {isAdmin ? 'Login' : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {/* ── FORGOT PASSWORD STEP ───────────────────────── */}
          {step === 'forgot' && (
            <div className="space-y-4">
              <h2 className="text-center text-xl font-bold text-gray-800">Reset Password</h2>
              <p className="text-center text-gray-500 text-sm">
                Enter the email address you registered with. We'll send you a reset link.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 p-2.5 border rounded-md focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {forgotMessage && (
                  <div className={`p-3 rounded-md text-sm ${forgotMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {forgotMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-jms-red text-white font-bold rounded-md hover:bg-jms-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="text-center border-t pt-4">
                <button onClick={() => setStep('auth')} className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
                  ← Back to Login
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            JMS Catering Secure Login
          </div>
        </div>
      </div>
    </div>
  );
};