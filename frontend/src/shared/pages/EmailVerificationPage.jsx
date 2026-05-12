import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiClock, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi';

const EmailVerificationPage = () => {
  const { 
    pendingUser, 
    handleEmailVerificationSuccess, 
    logout 
  } = useAuth();
  const navigate = useNavigate();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no pending user
  useEffect(() => {
    if (!pendingUser) {
      console.log('[EmailVerificationPage] No pending user found, redirecting to login');
      navigate('/login');
    }
  }, [pendingUser, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-send verification code when page loads
  useEffect(() => {
    if (pendingUser?.email && pendingUser?.id) {
      console.log('[EmailVerificationPage] Auto-sending code to:', { email: pendingUser.email, userId: pendingUser.id });
      const sendInitialCode = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/otp/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: pendingUser.email,
              userId: pendingUser.id
            })
          });

          const data = await response.json();
          if (!data.success) {
            setError(data.message || 'Failed to send verification code');
          } else {
            setSuccess('Verification code sent! Check your email.');
            setTimeout(() => setSuccess(''), 5000);
          }
        } catch (err) {
          console.error('[EmailVerificationPage] Send code error:', err);
          setError('Network error. Please check if the server is running.');
        }
      };

      sendInitialCode();
    }
  }, [pendingUser]);

  const handleInputChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: pendingUser.email,
          otp: codeString
        })
      });

      const data = await response.json();

      if (data.success) {
        const completeResponse = await fetch('http://localhost:5000/api/auth/complete-otp-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: pendingUser.id
          })
        });

        const completeData = await completeResponse.json();

        if (completeData.success) {
          setSuccess('Email verified successfully!');
          setTimeout(() => {
            handleEmailVerificationSuccess(completeData.user, completeData.token, completeData.refreshToken);
            
            // Redirect based on role
            const role = String(completeData.user.role).toUpperCase();
            if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin');
            else if (role === 'HR') navigate('/hr');
            else if (role === 'FINANCE' || role === 'FINANCE_ADMIN') navigate('/finance');
            else if (role === 'LOAN_COMMITTEE') navigate('/loan-committee');
            else navigate('/employee');
          }, 1500);
        } else {
          setError(completeData.message || 'Failed to complete verification');
        }
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error('[EmailVerificationPage] Verification error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: pendingUser.email,
          userId: pendingUser.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(60);
        setCanResend(false);
        setSuccess('New code sent! Check your inbox.');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code. Please check your connection.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!pendingUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1c]">
      {/* Animated Background Elements */}
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
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div
        className="relative w-full max-w-lg mx-4"
        style={{
          background: 'rgba(15, 23, 42, 0.80)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          padding: '48px 40px'
        }}
      >
        <div className="text-center mb-8">
          <div 
            className="mx-auto w-20 h-20 mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))',
              border: '1px solid rgba(59,130,246,0.3)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.15)'
            }}
          >
            <FiMail className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            We've sent a 6-digit verification code to:
            <br />
            <span className="text-blue-400 font-semibold mt-1 inline-block">{pendingUser.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-300">
                Verification Code
              </label>
              {timeLeft > 0 && (
                <div className="flex items-center text-xs text-gray-400">
                  <FiClock className="w-3 h-3 mr-1" />
                  Expires in {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            <div className="flex justify-between gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-full h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200"
                  style={{
                    background: 'rgba(30,41,59,0.7)',
                    borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59,130,246,0.6)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {error && (
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5'
              }}
            >
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#86efac'
              }}
            >
              <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full py-4 rounded-xl font-bold text-white transition-all duration-200"
              style={{
                background: loading || code.join('').length !== 6
                  ? 'rgba(59,130,246,0.3)'
                  : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: loading || code.join('').length !== 6
                  ? 'none'
                  : '0 8px 20px rgba(59,130,246,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw className="animate-spin" /> Verifying...
                </span>
              ) : 'Verify Account'}
            </button>

            <div className="flex flex-col items-center gap-4 pt-4">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center transition-colors"
                >
                  <FiRefreshCw className={`mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendLoading ? 'Sending new code...' : 'Resend Verification Code'}
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Didn't receive the code? Wait for the timer to resend.
                </p>
              )}
              
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <FiShield className="w-5 h-5 text-blue-400 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Security Note:</strong> This verification code is valid for a limited time. Never share this code with anyone. Our security team will never ask for your verification code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
