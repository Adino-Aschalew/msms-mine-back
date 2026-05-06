import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiClock, FiRefreshCw } from 'react-icons/fi';

const EmailVerificationModal = ({ 
  isVisible, 
  onClose, 
  email, 
  onVerificationSuccess, 
  userId 
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isVisible && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isVisible]);

  // Auto-send verification code when modal appears
  useEffect(() => {
    if (isVisible && email && userId) {
      console.log('[EmailVerificationModal] Auto-sending code to:', { email, userId });
      const sendInitialCode = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/otp/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              userId: userId
            })
          });

          const data = await response.json();
          console.log('[EmailVerificationModal] Send code response:', data);
          if (!data.success) {
            setError(data.message || 'Failed to send verification code');
          } else {
            // Success - show success message briefly
            setError('');
            setSuccess('Verification code sent! Check your email.');
            setTimeout(() => setSuccess(''), 3000);
          }
        } catch (err) {
          console.error('[EmailVerificationModal] Send code error:', err);
          if (err.name === 'TypeError' && err.message.includes('fetch')) {
            setError('Network error. Please check if the backend server is running.');
          } else if (err instanceof SyntaxError && err.message.includes('JSON')) {
            setError('Invalid server response. Please try again.');
          } else {
            setError(`Failed to send verification code: ${err.message || 'Unknown error'}`);
          }
        }
      };

      sendInitialCode();
    }
  }, [isVisible, email, userId]);

  useEffect(() => {
    if (isVisible) {
      // Reset state when modal opens
      setCode(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(60);
      setCanResend(false);
      // Focus first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [isVisible]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle enter key
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if it's a 6-digit code
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      // Focus last input
      inputRefs.current[5]?.focus();
      setError('');
    }
  };

  const handleSubmit = async () => {
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
          email: email,
          otp: codeString
        })
      });

      const data = await response.json();

      if (data.success) {
        // Complete OTP verification to get tokens
        const completeResponse = await fetch('http://localhost:5000/api/auth/complete-otp-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId
          })
        });

        const completeData = await completeResponse.json();

        if (completeData.success) {
          // Call the success callback with user and tokens
          onVerificationSuccess(completeData.user, completeData.token, completeData.refreshToken);
          onClose();
        } else {
          setError(completeData.message || 'Failed to complete verification');
        }
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('[EmailVerificationModal] Verification error:', err);
      if (err instanceof SyntaxError && err.message.includes('JSON')) {
        setError('Invalid server response. Please try again.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check if the backend server is running.');
      } else {
        setError(`Error: ${err.message || 'Unknown error occurred'}`);
      }
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
          email: email,
          userId: userId
        })
      });

      const data = await response.json();
      console.log('[EmailVerificationModal] Resend response:', data);

      if (data.success) {
        // Reset timer
        setTimeLeft(60);
        setCanResend(false);
        setSuccess('Code resent! Check your email.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('[EmailVerificationModal] Resend error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FiMail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter Verification Code
          </label>
          <div className="flex justify-center space-x-2">
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
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="mb-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
            <FiClock className="w-4 h-4 mr-1" />
            <span>Code expires in {formatTime(timeLeft)}</span>
          </div>
          
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Didn't receive the code? Check your spam folder or wait to resend.
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || code.join('').length !== 6}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Security Notice:</strong> Never share this verification code. 
            Our staff will never ask for your verification code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
