import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff, FiLock, FiUser, FiAlertCircle, FiShield } from 'react-icons/fi';

const LoginPage = () => {
  const { login, getRoleRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Detect whether input looks like an email (admin) or employee ID
  const isEmailMode = formData.identifier.includes('@');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier.trim()) {
      setError('Please enter your username or Employee ID');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Pass the identifier and let the backend figure out the role
      // We hint the role based on identifier format: email => admin roles, text => employee
      const inferredRole = isEmailMode ? 'admin' : 'employee';
      await login(formData, inferredRole);
      const redirectPath = from !== '/' ? from : getRoleRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1c]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, #3b82f6, #1e40af)',
            top: '-150px', left: '-150px'
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, #6d28d9, #4c1d95)',
            bottom: '-100px', right: '-100px',
            animation: 'pulse 4s ease-in-out infinite alternate'
          }}
        />
        <div
          className="absolute rounded-full blur-2xl opacity-10"
          style={{
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, #0ea5e9, #0284c7)',
            top: '40%', right: '25%',
            animation: 'pulse 6s ease-in-out infinite'
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          background: 'rgba(15, 23, 42, 0.80)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          padding: '48px 40px'
        }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: '64px', height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #3b82f6, #6d28d9)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.35)'
            }}
          >
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl font-bold text-white"
            style={{ letterSpacing: '-0.5px' }}
          >
            MSMS Portal
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(148,163,184,1)' }}>
            Microfinance &amp; Savings Management System
          </p>
        </div>

        {/* Hint strip */}
        <div
          className="flex gap-4 mb-8 p-3 rounded-xl text-xs"
          style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.18)'
          }}
        >
          <div className="flex items-start gap-2 flex-1">
            <span style={{ color: '#60a5fa' }}>👔</span>
            <div>
              <div className="font-semibold text-blue-300">Employee</div>
              <div style={{ color: 'rgba(148,163,184,0.85)' }}>Use your <strong>Employee ID</strong> (e.g. EMP001)</div>
            </div>
          </div>
          <div
            style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}
          />
          <div className="flex items-start gap-2 flex-1">
            <span style={{ color: '#a78bfa' }}>🛡️</span>
            <div>
              <div className="font-semibold text-purple-300">Admin / Staff</div>
              <div style={{ color: 'rgba(148,163,184,0.85)' }}>Use your <strong>email address</strong></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier field */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(203,213,225,1)' }}
            >
              {isEmailMode ? 'Email Address' : 'Username / Employee ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser
                  className="w-4 h-4 transition-colors duration-200"
                  style={{ color: isEmailMode ? '#60a5fa' : 'rgba(148,163,184,0.7)' }}
                />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Employee ID or email address"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  borderRadius: '12px',
                  background: 'rgba(30,41,59,0.70)',
                  border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59,130,246,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(203,213,225,1)' }}
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="w-4 h-4" style={{ color: 'rgba(148,163,184,0.7)' }} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 44px',
                  borderRadius: '12px',
                  background: 'rgba(30,41,59,0.70)',
                  border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59,130,246,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                style={{ color: 'rgba(148,163,184,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5'
              }}
            >
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold text-sm text-white relative overflow-hidden"
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: loading
                ? 'rgba(59,130,246,0.4)'
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 8px 28px rgba(59,130,246,0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)';
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(100,116,139,1)' }}>
            <span>© 2026 MSMS · All rights reserved</span>
            <span
              className="px-2 py-1 rounded-md"
              style={{ background: 'rgba(30,41,59,0.6)', color: 'rgba(148,163,184,0.8)' }}
            >
              v2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
