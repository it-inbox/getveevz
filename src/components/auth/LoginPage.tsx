import React, { useState } from 'react';
import { GetVeevzLogo } from '../common/GetVeevzLogo';
import { User, UserRole } from '../../types';
import { apiLogin, apiGoogleAuth, apiRegister } from '../../services/api';
import { Check, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('ceo@getveevz.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Clipper');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-[#F44336]' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-[#FFA726]' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-[#0084FF]' };
    return { score: 100, label: 'Strong', color: 'bg-[#4CAF50]' };
  };

  const strength = getPasswordStrength(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiLogin(email);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiGoogleAuth(role);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill all required fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiRegister({ email, name, role, phone });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setResetSent(true);
    setError(null);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('login');
    setResetSent(false);
    setError(null);
    alert('Password successfully reset! You can now log in.');
  };

  const quickRoles = [
    { label: 'CEO', email: 'ceo@getveevz.com' },
    { label: 'Leader', email: 'leader@getveevz.com' },
    { label: 'Manager', email: 'manager@getveevz.com' },
    { label: 'Clipper', email: 'clipper@getveevz.com' },
    { label: 'Client', email: 'client@getveevz.com' },
    { label: 'PR', email: 'pr@getveevz.com' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 font-['Manrope']">
      
      {/* Centered Top Branding */}
      <div className="flex flex-col items-center mb-8 text-center">
        {/* 120x120px Circular Logo */}
        <div className="mb-4">
          <GetVeevzLogo size={120} showText={false} />
        </div>
        
        {/* Title: 36px, Manrope 700, Black */}
        <h1 className="text-[36px] font-bold text-black tracking-tight leading-tight">
          Get<span className="text-[#0084FF]">Veevz</span>
        </h1>
        
        {/* Tagline: 16px, Manrope 400, Gray */}
        <p className="text-[16px] font-normal text-gray-500 mt-1">
          Campaign Management Made Simple
        </p>

        {/* Demo Fast Login Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#0084FF]" /> 1-Click Demo Login:
          </span>
          {quickRoles.map((qr) => (
            <button
              key={qr.email}
              type="button"
              onClick={() => {
                setEmail(qr.email);
                setPassword('password123');
                setMode('login');
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-[#E3F2FD] hover:text-[#0084FF] border border-[#E0E0E0] transition-colors cursor-pointer"
            >
              {qr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auth Card (White background, light gray border, 400px width standard) */}
      <div className="w-full max-w-[400px] bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-8">
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-[#F44336]">
            {error}
          </div>
        )}

        {/* ---------------- LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-hidden focus:border-[#0084FF] focus:ring-2 focus:ring-[#0084FF]/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-black">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#0084FF] hover:underline font-normal cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-hidden focus:border-[#0084FF] focus:ring-2 focus:ring-[#0084FF]/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] rounded-xl text-sm font-semibold text-black transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] active:bg-[#0060c2] text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-[#0084FF] hover:underline font-normal cursor-pointer"
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        )}

        {/* ---------------- REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
              {/* Strength Indicator */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{strength.label}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Clipper', 'Client', 'Campaign_Manager', 'CEO'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      role === r
                        ? 'border-[#0084FF] bg-[#E3F2FD] text-[#0084FF]'
                        : 'border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#0084FF] hover:underline cursor-pointer"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {/* ---------------- FORGOT PASSWORD MODE ---------------- */}
        {mode === 'forgot' && !resetSent && (
          <form onSubmit={handleSendReset} className="space-y-4">
            <p className="text-xs text-gray-600">
              Enter your email address and we'll send you a password reset verification link.
            </p>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Send Reset Link
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-gray-500 hover:text-black cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ---------------- RESET LINK CONFIRMATION / RESET FORM ---------------- */}
        {mode === 'forgot' && resetSent && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#0084FF]">
              ✓ Check your email for reset link! Enter your new password below:
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black focus:outline-hidden focus:border-[#0084FF]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
