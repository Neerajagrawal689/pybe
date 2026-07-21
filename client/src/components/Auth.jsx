import React, { useState } from 'react';
import { User, Lock, Mail, Brain, Shield, UserPlus, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Auth = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    // For login, only send email and password
    const payload = isLogin 
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password, role: form.role };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError(null);
    setForm({ ...form, password: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-md w-full bg-[#16231f] rounded-2xl shadow-2xl overflow-hidden text-[#f8f4ec] my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a9b8b1] hover:text-[#d8f07c] transition-colors p-1"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-[#d8f07c]" />
              <div className="flex flex-col">
                <strong className="text-2xl font-extrabold leading-none tracking-tight">PyBe</strong>
                <span className="text-[#b9c7bf] text-xs">Scenario-first Python</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-center text-[#b9c7bf] mb-8 text-sm">
            {isLogin ? 'Enter your details to access your dashboard' : 'Join PyBe to start learning Python'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-900/30 text-red-200 rounded-lg text-sm text-center border border-red-800/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username only for Signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#b9c7bf] mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-[#53615c]" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="pl-10 w-full bg-[#24342f] border border-[#385149] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d8f07c] transition-colors placeholder:text-[#53615c]"
                    placeholder="johndoe"
                  />
                </div>
              </div>
            )}

            {/* Email for both Login & Signup */}
            <div>
              <label className="block text-sm font-medium text-[#b9c7bf] mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#53615c]" />
                </div>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 w-full bg-[#24342f] border border-[#385149] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d8f07c] transition-colors placeholder:text-[#53615c]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b9c7bf] mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#53615c]" />
                </div>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 w-full bg-[#24342f] border border-[#385149] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d8f07c] transition-colors placeholder:text-[#53615c]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password only for Signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#b9c7bf] mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#53615c]" />
                  </div>
                  <input
                    required
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="pl-10 w-full bg-[#24342f] border border-[#385149] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d8f07c] transition-colors placeholder:text-[#53615c]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Role Selection only for Signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#b9c7bf] mb-2 mt-2">Select your role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`
                    border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer transition-all
                    ${form.role === 'student' ? 'border-[#d8f07c] bg-[#24342f]' : 'border-[#385149] bg-[#20312c] hover:border-[#53615c]'}
                  `}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="student" 
                      checked={form.role === 'student'}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="sr-only" 
                    />
                    <UserPlus size={24} className={form.role === 'student' ? 'text-[#d8f07c]' : 'text-[#a9b8b1]'} />
                    <span className={`text-sm font-semibold uppercase tracking-wider ${form.role === 'student' ? 'text-[#d8f07c]' : 'text-[#a9b8b1]'}`}>Student</span>
                  </label>
                  
                  <label className={`
                    border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer transition-all
                    ${form.role === 'admin' ? 'border-[#d8f07c] bg-[#24342f]' : 'border-[#385149] bg-[#20312c] hover:border-[#53615c]'}
                  `}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="admin" 
                      checked={form.role === 'admin'}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="sr-only" 
                    />
                    <Shield size={24} className={form.role === 'admin' ? 'text-[#d8f07c]' : 'text-[#a9b8b1]'} />
                    <span className={`text-sm font-semibold uppercase tracking-wider ${form.role === 'admin' ? 'text-[#d8f07c]' : 'text-[#a9b8b1]'}`}>Admin</span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d8f07c] text-[#14201c] rounded-lg py-3 font-extrabold hover:bg-[#c9e066] transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <div className="bg-[#111916] border-t border-[#385149] p-6 text-center">
          <p className="text-[#a9b8b1] text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={handleToggle}
              className="text-[#d8f07c] font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
