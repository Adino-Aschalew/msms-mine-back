import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-blue-100 text-sm mt-1">Fill in the information below to add a new admin</p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
