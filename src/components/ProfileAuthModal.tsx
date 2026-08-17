import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Phone, Lock, MapPin, KeyRound, LogOut, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, Sprout, Eye, EyeOff } from 'lucide-react';

export const ProfileAuthModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    setIsProfileModalOpen,
    profileModalTab,
    setProfileModalTab,
    loginUser,
    signupUser,
    logoutUser,
    farmerLots,
  } = useApp();

  // Form States
  const [mobile, setMobile] = useState('9822012345');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Signup States
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupLocation, setSignupLocation] = useState('Nashik, Maharashtra');
  const [signupFarmSize, setSignupFarmSize] = useState<number>(4.0);
  const [signupPassword, setSignupPassword] = useState('');

  // Validation / Feedback States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset messages on tab change
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsOtpSent(false);
  }, [profileModalTab]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        setIsProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, setIsProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  // Validation helper
  const isValidMobile = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isValidMobile(mobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (authMethod === 'password' && (!password || password.length < 4)) {
      setErrorMessage('Please enter your password (minimum 4 characters).');
      return;
    }

    if (authMethod === 'otp') {
      if (!isOtpSent) {
        setIsOtpSent(true);
        setSuccessMessage('OTP code (1234) sent to +91 ' + mobile);
        return;
      }
      if (otpCode !== '1234' && otpCode.length !== 4) {
        setErrorMessage('Invalid OTP. Use demo code: 1234');
        return;
      }
    }

    loginUser(mobile, 'Ramesh Patil');
    setSuccessMessage('Logged in successfully!');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isValidMobile(signupMobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    signupUser(signupName, signupMobile, signupLocation, signupFarmSize);
    setSuccessMessage('Account created successfully! Welcome to FasalNirnay.');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isValidMobile(mobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSuccessMessage('Password reset link & OTP sent to +91 ' + mobile);
    setTimeout(() => {
      setProfileModalTab('login');
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsProfileModalOpen(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE 1: LOGGED-IN PROFILE VIEW */}
        {user.isLoggedIn && profileModalTab === 'profile' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#167A42] bg-gray-100 flex-shrink-0">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-lg text-gray-900">{user.name}</h3>
                  <span className="bg-emerald-100 text-[#167A42] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Farmer
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {user.mobile}
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" /> {user.location}
                </p>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block">Total Land Holding</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{user.farmSizeAcres} Acres</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block">Active Registered Lots</span>
                <span className="font-extrabold text-[#167A42] mt-0.5 block">{farmerLots.length} Lots</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-[#167A42]" /> Primary Harvest Crops:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {user.mainCrops.map((c, i) => (
                  <span key={i} className="bg-emerald-50 text-[#167A42] font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                setSuccessMessage('Logged out successfully.');
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of FasalNirnay</span>
            </button>
          </div>
        ) : profileModalTab === 'login' ? (
          /* MODE 2: LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-xl text-gray-900">Farmer Login</h3>
              <p className="text-xs text-gray-500 mt-0.5">Enter your mobile number to access your crop lots.</p>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Mobile Number:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">+91</span>
                <input
                  type="tel"
                  placeholder="98220 12345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 pl-12 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Auth Method Switch */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="authMethod"
                  checked={authMethod === 'password'}
                  onChange={() => setAuthMethod('password')}
                  className="text-[#167A42] focus:ring-emerald-500"
                />
                <span>Password</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="authMethod"
                  checked={authMethod === 'otp'}
                  onChange={() => setAuthMethod('otp')}
                  className="text-[#167A42] focus:ring-emerald-500"
                />
                <span>Login via OTP</span>
              </label>
            </div>

            {/* Password or OTP Input */}
            {authMethod === 'password' ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-gray-400" /> Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('forgot')}
                    className="text-[11px] font-bold text-[#167A42] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 pr-10 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" /> OTP Code (Use 1234):
                </label>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  maxLength={4}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md mt-2"
            >
              {authMethod === 'otp' && !isOtpSent ? 'Send OTP Code' : 'Log In'}
            </button>

            <div className="pt-2 text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setProfileModalTab('signup')}
                className="font-bold text-[#167A42] hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : profileModalTab === 'signup' ? (
          /* MODE 3: CREATE ACCOUNT FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <button
                type="button"
                onClick={() => setProfileModalTab('login')}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-gray-900">Create Farmer Account</h3>
                <p className="text-[11px] text-gray-500">Join 50,000+ farmers using AI crop recommendations.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name:</label>
              <input
                type="text"
                placeholder="Ramesh Patil"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number:</label>
                <input
                  type="tel"
                  placeholder="98220 12345"
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Land (Acres):</label>
                <input
                  type="number"
                  value={signupFarmSize}
                  onChange={(e) => setSignupFarmSize(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Village / Location:</label>
              <input
                type="text"
                placeholder="Dindori, Nashik, Maharashtra"
                value={signupLocation}
                onChange={(e) => setSignupLocation(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Create Password:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md mt-1"
            >
              Register & Access Dashboard
            </button>
          </form>
        ) : (
          /* MODE 4: FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <button
                type="button"
                onClick={() => setProfileModalTab('login')}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">We will send an OTP code to your registered mobile.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Registered Mobile Number:</label>
              <input
                type="tel"
                placeholder="98220 12345"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md"
            >
              Send Reset Code & OTP
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
