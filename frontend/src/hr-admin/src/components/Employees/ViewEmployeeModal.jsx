import { X, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Award, Clock, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

export default function ViewEmployeeModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div 
        className="relative bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Employee Details</h2>
            <p className="text-blue-100 text-sm">View employee information</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Employee Header */}
          <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {employee.name ? employee.name.split(' ').map(n => n[0]).join('') : 'E'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {employee.role || 'EMPLOYEE'}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  <Building className="inline w-4 h-4 mr-1" />
                  {employee.department || 'Not specified'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                employee.status === 'Active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {employee.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone Number</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.phone || '+1 (555) 000-0000'}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Employment Details
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Join Date</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {employee.hire_date ? format(new Date(employee.hire_date), 'MMMM do, yyyy') : employee.created_at ? format(new Date(employee.created_at), 'MMMM do, yyyy') : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Annual Salary</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    Birr {employee.salary ? employee.salary.toLocaleString() : '0'} / year
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Performance Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall Rating</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{employee.performance || 0}%</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium">
                    Top 10%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${employee.performance || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* System Activity */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                System Activity
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee ID</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.id || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reports to</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.manager || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
