import React from 'react';
import { Calendar } from 'lucide-react';

const DateFilter = ({ value, onChange }) => {
  const options = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: 'quarter', label: 'This quarter' },
    { value: 'year', label: 'This year' },
    { value: 'custom', label: 'Custom range' },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default DateFilter;
