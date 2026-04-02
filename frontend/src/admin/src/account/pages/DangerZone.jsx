import React, { useState } from 'react';
import { AlertTriangle, UserX, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

const DangerZone = () => {
  const [confirmationText, setConfirmationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [password, setPassword] = useState('');

  const handleDeactivateAccount = () => {
    if (confirmationText === 'DEACTIVATE' && password) {
      console.log('Account deactivated');
      
      setConfirmationText('');
      setPassword('');
      setActionType(null);
    }
  };

  const handleDeleteAccount = () => {
    if (confirmationText === 'DELETE' && password) {
      console.log('Account deleted');
      
      setConfirmationText('');
      setPassword('');
      setActionType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danger Zone</h1>
        <p className="text-gray-600 dark:text-gray-400">Irreversible and critical account actions.</p>
      </div>

      {}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Critical Actions Ahead
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              The actions in this section are permanent and cannot be undone. 
              Please proceed with extreme caution and make sure you understand the consequences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <UserX className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deactivate Account
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Temporarily disable your account. You can reactivate it later by logging back in.
              </p>
              
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">What happens when you deactivate:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Your account will be temporarily disabled</li>
                  <li>You won't be able to log in or access your data</li>
                  <li>Your data will be preserved for 30 days</li>
                  <li>You can reactivate by contacting support</li>
                </ul>
              </div>

              {actionType === 'deactivate' ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type "DEACTIVATE" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DEACTIVATE"
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enter your password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionType(null);
                        setConfirmationText('');
                        setPassword('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivateAccount}
                      disabled={confirmationText !== 'DEACTIVATE' || !password}
                      className="btn-yellow flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Deactivate Account
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActionType('deactivate')}
                  className="btn-yellow mt-6"
                >
                  Deactivate Account
                </button>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">What happens when you delete:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Your account will be permanently deleted</li>
                  <li>All your data will be removed from our servers</li>
                  <li>You will lose access to all services and features</li>
                  <li>This action cannot be reversed</li>
                  <li>Your username and email will be freed up for others to use</li>
                </ul>
              </div>

              {actionType === 'delete' ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE"
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enter your password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionType(null);
                        setConfirmationText('');
                        setPassword('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={confirmationText !== 'DELETE' || !password}
                      className="btn-red flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActionType('delete')}
                  className="btn-red mt-6"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Before You Proceed</h3>
            <div className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>For Deactivation:</strong> If you're having issues with your account, 
                consider contacting our support team first. We may be able to help resolve your concerns.
              </p>
              <p>
                <strong>For Deletion:</strong> Make sure to download any important data before proceeding. 
                Once your account is deleted, there's no way to recover your information.
              </p>
              <p>
                <strong>Need Help?</strong> If you're unsure about which action to take, 
                please review our documentation or contact support for guidance.
              </p>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button className="btn-outline">
                Contact Support
              </button>
              <button className="btn-outline">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;
