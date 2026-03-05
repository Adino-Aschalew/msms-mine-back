import React, { useState } from 'react'

const ForgotPasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await onSubmit(email)
      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email.')
        setEmail('')
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        setError(result.error || 'Failed to send reset instructions.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-background-dark rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Forgot Password?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="block w-full rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:ring-0 focus:border-primary focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white px-4 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Send Reset Instructions
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Remember your password?{' '}
            <button
              onClick={handleClose}
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordModal
