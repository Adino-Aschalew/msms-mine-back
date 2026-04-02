import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Users, ArrowRightLeft, FileText, TrendingUp } from 'lucide-react';

const SearchBar = ({ onOpen, isOpen, isModal = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  
  const mockData = [
    { type: 'employee', name: 'Sarah Johnson', email: 'sarah@company.com', id: 'EMP001' },
    { type: 'employee', name: 'Mike Chen', email: 'mike@company.com', id: 'EMP002' },
    { type: 'employee', name: 'Emily Davis', email: 'emily@company.com', id: 'EMP003' },
    { type: 'transaction', name: 'Salary Payment - March', amount: '$45,000', id: 'TRX001' },
    { type: 'transaction', name: 'Office Rent', amount: '$5,000', id: 'TRX002' },
    { type: 'transaction', name: 'Software License', amount: '$1,200', id: 'TRX003' },
    { type: 'report', name: 'Q1 Financial Report', date: '2024-03-31', id: 'RPT001' },
    { type: 'report', name: 'Payroll Summary - March', date: '2024-03-15', id: 'RPT002' },
    { type: 'report', name: 'Budget Analysis', date: '2024-03-10', id: 'RPT003' },
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockData.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      
      const selectedResult = results[selectedIndex];
      console.log('Navigating to:', selectedResult);
      
      
      if (selectedResult.type === 'employee') {
        navigate('/employees');
      } else if (selectedResult.type === 'transaction') {
        navigate('/transactions');
      } else if (selectedResult.type === 'report') {
        navigate('/reports');
      }
      
      
      if (isModal) {
        onOpen();
      }
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    } else if (e.key === 'Escape') {
      if (isModal) {
        onOpen();
      } else {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      }
    }
  };

  const handleResultClick = (result) => {
    console.log('Navigate to:', result);
    
    
    if (result.type === 'employee') {
      navigate('/employees');
    } else if (result.type === 'transaction') {
      navigate('/transactions');
    } else if (result.type === 'report') {
      navigate('/reports');
    }
    
    
    if (isModal) {
      onOpen();
    }
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'employee':
        return <Users className="h-5 w-5 text-gray-400" />;
      case 'transaction':
        return <ArrowRightLeft className="h-5 w-5 text-gray-400" />;
      case 'report':
        return <FileText className="h-5 w-5 text-gray-400" />;
      default:
        return <Search className="h-5 w-5 text-gray-400" />;
    }
  };

  const searchBarContent = (
    <div className="relative">
      <div className="flex items-center">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search employees, transactions, reports..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
            onClick={() => onOpen()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  {searchBarContent}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="relative">
      {searchBarContent}
      
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
          >
            <div className="max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  {getIcon(result.type)}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {result.type === 'employee' && result.email}
                      {result.type === 'transaction' && result.amount}
                      {result.type === 'report' && result.date}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
