import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, CarFront, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, X, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import ShinyText from '../components/ShinyText';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1=username, 2=security answer, 3=new password, 4=success
  const [resetUsername, setResetUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security Question Setup Modal State (shown after first login)
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);
  const [setupQuestion, setSetupQuestion] = useState('');
  const [setupAnswer, setSetupAnswer] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const SECURITY_QUESTIONS = [
    'What is the name of your first school?',
    'What is your mother\'s maiden name?',
    'What city were you born in?',
    'What was the name of your first pet?',
    'What is your favourite food?',
    'What is the name of your childhood best friend?',
  ];

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await window.api.login({ username, password });
      if (response.success) {
        if (response.user.role !== 'admin') {
          setError('Access Denied: This system is restricted to Admin personnel only.');
          setLoading(false);
          return;
        }
        // Check if security question is set up
        if (!response.user.hasSecuritySetup) {
          // Show security setup modal before proceeding
          setLoggedInUser(response.user);
          setShowSecuritySetup(true);
        } else {
          onLogin(response.user);
          navigate('/');
        }
      } else {
        setError(response.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Security Setup Handlers
  const handleSecuritySetup = async () => {
    setSetupError('');
    if (!setupQuestion) {
      setSetupError('Please select a security question.');
      return;
    }
    if (!setupAnswer.trim() || setupAnswer.trim().length < 2) {
      setSetupError('Please enter a valid answer (at least 2 characters).');
      return;
    }

    setSetupLoading(true);
    try {
      const result = await window.api.setupSecurityQuestion({
        username: loggedInUser.username,
        securityQuestion: setupQuestion,
        securityAnswer: setupAnswer,
      });
      if (result.success) {
        setShowSecuritySetup(false);
        onLogin(loggedInUser);
        navigate('/');
      } else {
        setSetupError(result.message || 'Failed to save security question.');
      }
    } catch (err) {
      setSetupError('An error occurred. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  const skipSecuritySetup = () => {
    setShowSecuritySetup(false);
    onLogin(loggedInUser);
    navigate('/');
  };

  // Forgot Password Handlers
  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetStep(1);
    setResetUsername('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetStep(1);
    setResetError('');
  };

  const handleResetPassword = async () => {
    setResetError('');

    if (resetStep === 1) {
      // Step 1: Verify username and get security question
      if (!resetUsername.trim()) {
        setResetError('Please enter your username.');
        return;
      }
      setResetLoading(true);
      try {
        const result = await window.api.getSecurityQuestion({ username: resetUsername });
        if (result.success) {
          setSecurityQuestion(result.securityQuestion);
          setResetStep(2);
        } else {
          setResetError(result.message || 'Username not found.');
        }
      } catch (err) {
        setResetError('An error occurred. Please try again.');
      } finally {
        setResetLoading(false);
      }

    } else if (resetStep === 2) {
      // Step 2: Verify security answer
      if (!securityAnswer.trim()) {
        setResetError('Please enter your answer.');
        return;
      }
      setResetStep(3);

    } else if (resetStep === 3) {
      // Step 3: Set new password
      if (!resetNewPassword || resetNewPassword.length < 6) {
        setResetError('New password must be at least 6 characters.');
        return;
      }
      if (resetNewPassword !== resetConfirmPassword) {
        setResetError('Passwords do not match.');
        return;
      }

      setResetLoading(true);
      try {
        const result = await window.api.resetPasswordWithSecurity({
          username: resetUsername,
          securityAnswer: securityAnswer,
          newPassword: resetNewPassword,
        });
        if (result.success) {
          setResetStep(4);
        } else {
          setResetError(result.message || 'Password reset failed.');
          // Go back to security answer step if answer was wrong
          if (result.message && result.message.includes('Incorrect')) {
            setResetStep(2);
            setSecurityAnswer('');
          }
        }
      } catch (err) {
        setResetError('An error occurred. Please try again.');
      } finally {
        setResetLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex font-['Inter'] bg-[#0b1120] select-none overflow-hidden">

      {/* ── Left Panel: Photo with overlay ── */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden">
        {/* Local photo */}
        <img
          src="/login-bg.jpg"
          alt="Modern car on road"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ filter: 'brightness(0.45) saturate(1.2)' }}
        />

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1120] via-[#0b1120]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-[#0b1120]/40"></div>
        {/* Subtle amber tint on bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#f59e0b]/[0.06] to-transparent"></div>

        {/* Content over photo */}
        <div className={`relative z-10 flex flex-col justify-between p-12 w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>

          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg shadow-[#f59e0b]/30">
              <CarFront className="text-[#1e3a5f]" size={24} />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white font-['Public_Sans'] tracking-tight leading-none">LankaDrive</h1>
              <p className="text-[10px] text-white/40 font-semibold tracking-[0.2em] uppercase mt-0.5">Admin Portal</p>
            </div>
          </div>

          {/* Center: Tagline with ShinyText */}
          <div className="max-w-md">

            <h2 className="text-white text-[44px] font-extrabold font-['Public_Sans'] leading-[1.05] mb-5 tracking-tight">
              Smart driving<br />school
              <ShinyText 
                text=" management" 
                speed={2.5} 
                delay={0.5}
                color="#f59e0b" 
                shineColor="#fef3c7" 
                spread={120}
                className="text-[44px] font-extrabold font-['Public_Sans']"
              />
            </h2>

            <p className="text-white/40 text-[15px] leading-relaxed max-w-sm">
              Streamline enrollment, scheduling, payments and licensing — everything in one unified platform.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {['Student Tracking', 'Fleet Management', 'Exam Scheduling', 'Payment Processing'].map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] rounded-lg border border-white/[0.06] backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CheckCircle2 size={12} className="text-[#f59e0b]" />
                  <span className="text-white/50 text-[11px] font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Stats */}
          <div className="flex gap-10">
            {[
              { value: '500+', label: 'Students' },
              { value: '50+', label: 'Instructors' },
              { value: '98%', label: 'Pass Rate' },
            ].map((stat, i) => (
              <div key={i} className="group cursor-default">
                <p className="text-white text-[22px] font-bold font-['Public_Sans'] group-hover:text-[#f59e0b] transition-colors">{stat.value}</p>
                <p className="text-white/30 text-[11px] font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#f59e0b]/[0.03] rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#1e3a5f]/[0.03] rounded-full translate-y-1/3 -translate-x-1/3"></div>

        <div className={`w-full max-w-[400px] px-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Mobile-only logo */}
          <div className="flex items-center gap-3 mb-10 md:hidden">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <CarFront className="text-[#f59e0b]" size={22} />
            </div>
            <span className="text-xl font-bold text-[#1e3a5f] font-['Public_Sans']">LankaDrive</span>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <ShinyText 
              text="WELCOME BACK" 
              speed={3} 
              delay={2}
              color="#f59e0b" 
              shineColor="#fef3c7" 
              spread={120}
              className="text-sm font-bold tracking-[0.15em] mb-2 block"
            />
            <h2 className="text-[30px] font-extrabold text-[#0f172a] font-['Public_Sans'] mb-2 tracking-tight">Sign in to continue</h2>
            <p className="text-[#94a3b8] text-[14px]">Enter your credentials to access the dashboard.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm animate-[shake_0.4s_ease-in-out]">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[13px] font-semibold text-[#334155] mb-2">Username</label>
              <div className={`relative rounded-xl border-2 transition-all duration-200 bg-[#f8fafc] ${
                focusedField === 'username'
                  ? 'border-[#1e3a5f] shadow-[0_0_0_4px_rgba(30,58,95,0.06)] bg-white'
                  : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`h-[18px] w-[18px] transition-colors duration-200 ${focusedField === 'username' ? 'text-[#1e3a5f]' : 'text-[#94a3b8]'}`} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#334155] mb-2">Password</label>
              <div className={`relative rounded-xl border-2 transition-all duration-200 bg-[#f8fafc] ${
                focusedField === 'password'
                  ? 'border-[#1e3a5f] shadow-[0_0_0_4px_rgba(30,58,95,0.06)] bg-white'
                  : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-[18px] w-[18px] transition-colors duration-200 ${focusedField === 'password' ? 'text-[#1e3a5f]' : 'text-[#94a3b8]'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-12 pr-12 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#1e3a5f] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={openForgotModal}
                className="text-[12px] font-semibold text-[#1e3a5f] hover:text-[#f59e0b] transition-colors duration-200 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 px-4 bg-[#1e3a5f] hover:bg-[#152c48] active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-[#1e3a5f]/25 mt-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-center gap-2 text-[#94a3b8]">
              <Shield size={14} className="text-emerald-400" />
              <p className="text-[11px] font-medium">
                Secured connection — LankaDrive v1.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeForgotModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 overflow-hidden animate-[modalIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1e3a5f] to-[#2a4f7a] px-7 py-6">
              <button onClick={closeForgotModal} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg shadow-[#f59e0b]/30"><KeyRound className="text-[#1e3a5f]" size={20} /></div>
                <div>
                  <h3 className="text-white text-lg font-bold font-['Public_Sans']">{resetStep === 4 ? 'Password Updated' : 'Reset Password'}</h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    {resetStep === 1 && 'Step 1 — Enter your username'}
                    {resetStep === 2 && 'Step 2 — Answer security question'}
                    {resetStep === 3 && 'Step 3 — Set new password'}
                    {resetStep === 4 && 'You can now sign in'}
                  </p>
                </div>
              </div>
              {resetStep !== 4 && (
                <div className="flex gap-1.5 mt-5">
                  <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${resetStep >= 1 ? 'bg-[#f59e0b]' : 'bg-white/20'}`}></div>
                  <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${resetStep >= 2 ? 'bg-[#f59e0b]' : 'bg-white/20'}`}></div>
                  <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${resetStep >= 3 ? 'bg-[#f59e0b]' : 'bg-white/20'}`}></div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {resetError && (
                <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-3 py-2.5 rounded-xl mb-5 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span className="font-medium text-[13px]">{resetError}</span>
                </div>
              )}

              {/* Step 1: Username */}
              {resetStep === 1 && (
                <div className="space-y-4">
                  <p className="text-[#64748b] text-[13px] leading-relaxed">Enter the username associated with your account.</p>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-2">Username</label>
                    <div className="relative rounded-xl border-2 border-[#e2e8f0] focus-within:border-[#1e3a5f] focus-within:shadow-[0_0_0_4px_rgba(30,58,95,0.06)] transition-all duration-200 bg-[#f8fafc] focus-within:bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-[18px] w-[18px] text-[#94a3b8]" /></div>
                      <input type="text" className="block w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium" placeholder="Enter your username" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()} autoFocus />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Security Question */}
              {resetStep === 2 && (
                <div className="space-y-4">
                  <p className="text-[#64748b] text-[13px] leading-relaxed">Answer the security question for <span className="font-semibold text-[#1e3a5f]">{resetUsername}</span>.</p>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#334155]">{securityQuestion}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-2">Your Answer</label>
                    <div className="relative rounded-xl border-2 border-[#e2e8f0] focus-within:border-[#1e3a5f] focus-within:shadow-[0_0_0_4px_rgba(30,58,95,0.06)] transition-all duration-200 bg-[#f8fafc] focus-within:bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Shield className="h-[18px] w-[18px] text-[#94a3b8]" /></div>
                      <input type="text" className="block w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium" placeholder="Enter your answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()} autoFocus />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {resetStep === 3 && (
                <div className="space-y-4">
                  <p className="text-[#64748b] text-[13px] leading-relaxed">Set a new password for <span className="font-semibold text-[#1e3a5f]">{resetUsername}</span>.</p>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-2">New Password</label>
                    <div className="relative rounded-xl border-2 border-[#e2e8f0] focus-within:border-[#1e3a5f] focus-within:shadow-[0_0_0_4px_rgba(30,58,95,0.06)] transition-all duration-200 bg-[#f8fafc] focus-within:bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-[18px] w-[18px] text-[#94a3b8]" /></div>
                      <input type={showNewPassword ? 'text' : 'password'} className="block w-full pl-12 pr-12 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium" placeholder="Min. 6 characters" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} autoFocus />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#1e3a5f] transition-colors">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-2">Confirm New Password</label>
                    <div className="relative rounded-xl border-2 border-[#e2e8f0] focus-within:border-[#1e3a5f] focus-within:shadow-[0_0_0_4px_rgba(30,58,95,0.06)] transition-all duration-200 bg-[#f8fafc] focus-within:bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-[18px] w-[18px] text-[#94a3b8]" /></div>
                      <input type={showConfirmPassword ? 'text' : 'password'} className="block w-full pl-12 pr-12 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium" placeholder="Re-enter new password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#1e3a5f] transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {resetStep === 4 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-emerald-500" /></div>
                  <h4 className="text-lg font-bold text-[#0f172a] font-['Public_Sans'] mb-2">Password Reset Successful</h4>
                  <p className="text-[#64748b] text-[13px] leading-relaxed">Your password has been updated successfully.<br />You can now sign in with your new password.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 pb-6 flex gap-3">
              {resetStep === 4 ? (
                <button onClick={closeForgotModal} className="w-full py-3 bg-[#1e3a5f] hover:bg-[#152c48] text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">Back to Sign In</button>
              ) : (
                <>
                  {resetStep > 1 && (
                    <button onClick={() => { setResetStep(resetStep - 1); setResetError(''); }} className="flex-1 py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">Back</button>
                  )}
                  <button onClick={handleResetPassword} disabled={resetLoading} className="flex-1 py-3 bg-[#1e3a5f] hover:bg-[#152c48] text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {resetLoading ? (
                      <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Processing...</>
                    ) : (
                      resetStep === 1 ? 'Continue' : resetStep === 2 ? 'Verify Answer' : 'Reset Password'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Security Question Setup Modal ── */}
      {showSecuritySetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 overflow-hidden animate-[modalIn_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4f7a] px-7 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg shadow-[#f59e0b]/30"><Shield className="text-[#1e3a5f]" size={20} /></div>
                <div>
                  <h3 className="text-white text-lg font-bold font-['Public_Sans']">Set Up Account Recovery</h3>
                  <p className="text-white/50 text-xs mt-0.5">Choose a security question to recover your account</p>
                </div>
              </div>
            </div>
            <div className="px-7 py-6">
              {setupError && (
                <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-3 py-2.5 rounded-xl mb-5 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span className="font-medium text-[13px]">{setupError}</span>
                </div>
              )}
              <p className="text-[#64748b] text-[13px] leading-relaxed mb-4">This will help you recover your account if you forget your password.</p>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#334155] mb-2">Security Question</label>
                <select value={setupQuestion} onChange={(e) => setSetupQuestion(e.target.value)} className="block w-full px-4 py-3.5 bg-[#f8fafc] rounded-xl border-2 border-[#e2e8f0] focus:border-[#1e3a5f] focus:outline-none text-sm text-[#0f172a] font-medium cursor-pointer">
                  <option value="">Select a question...</option>
                  {SECURITY_QUESTIONS.map((q, i) => (<option key={i} value={q}>{q}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#334155] mb-2">Your Answer</label>
                <div className="relative rounded-xl border-2 border-[#e2e8f0] focus-within:border-[#1e3a5f] focus-within:shadow-[0_0_0_4px_rgba(30,58,95,0.06)] transition-all duration-200 bg-[#f8fafc] focus-within:bg-white">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-[18px] w-[18px] text-[#94a3b8]" /></div>
                  <input type="text" className="block w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none font-medium" placeholder="Enter your answer" value={setupAnswer} onChange={(e) => setSetupAnswer(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="px-7 pb-6 flex gap-3">
              <button onClick={skipSecuritySetup} className="flex-1 py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">Skip for Now</button>
              <button onClick={handleSecuritySetup} disabled={setupLoading} className="flex-1 py-3 bg-[#1e3a5f] hover:bg-[#152c48] text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                {setupLoading ? (
                  <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>
                ) : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}
      </style>
    </div>
  );
};

export default Login;
