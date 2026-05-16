import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const EmailVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [verified, setVerified] = useState(false);
  
  const { user, requestOTP, verifyOTP, logout } = useAuth();
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    // If user is already verified or not an employee, redirect to dashboard
    if (user && (user.email_verified || user.role !== 'EMPLOYEE')) {
      navigate('/employee/dashboard');
    }
    
    // Auto-request OTP on mount if needed
    handleRequestOTP();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestOTP = async () => {
    try {
      setResending(true);
      setError('');
      await requestOTP();
      setTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').substring(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled or next empty
    const lastIdx = Math.min(data.length, 5);
    inputRefs[lastIdx].current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await verifyOTP(code);
      setVerified(true);
      
      // Redirect after success animation
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Verified!</h2>
          <p className="text-slate-600 text-lg">
            Your email has been successfully verified. Redirecting you to your dashboard...
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
            <p className="text-slate-500 mt-2">
              We've sent a 6-digit code to <span className="font-semibold text-slate-700">{user?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP Inputs */}
            <div className="flex justify-between gap-2 md:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.some(d => !d)}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Didn't receive the code?
            </p>
            <button
              onClick={handleRequestOTP}
              disabled={timer > 0 || resending}
              className="mt-2 text-blue-600 font-bold hover:text-blue-700 disabled:text-slate-400 transition-colors"
            >
              {resending ? (
                <span className="flex items-center gap-2 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                </span>
              ) : timer > 0 ? (
                `Resend code in ${timer}s`
              ) : (
                "Resend verification code"
              )}
            </button>
            
            <div className="mt-8">
              <button 
                onClick={logout}
                className="text-slate-400 text-sm hover:text-slate-600 font-medium underline underline-offset-4"
              >
                Sign in with a different account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
