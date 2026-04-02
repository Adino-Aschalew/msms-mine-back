import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SavingAnalyzer = ({ dashboardData }) => {
  const { theme } = useTheme();
  const analyzer = dashboardData?.savingAnalyzer || {
    monthSaving: 0,
    monthLoan: 0,
    highSaving: 0,
    highLoan: 0,
    yearSaving: 0,
    yearLoan: 0
  };

  const data = {
    labels: ['Monthly', 'Record (Historical High)', 'Yearly Total'],
    datasets: [
      {
        label: 'Savings (ETB)',
        data: [analyzer.monthSaving, analyzer.highSaving, analyzer.yearSaving],
        backgroundColor: 'rgba(34, 197, 94, 0.8)', 
        borderRadius: 8,
      },
      {
        label: 'Loans (ETB)',
        data: [analyzer.monthLoan, analyzer.highLoan, analyzer.yearLoan],
        backgroundColor: 'rgba(59, 130, 246, 0.8)', 
        borderRadius: 8,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          color: theme === 'dark' ? '#ffffff' : '#374151',
          font: { weight: '600' }
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: theme === 'dark' ? '#ffffff' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
             return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ETB`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme === 'dark' ? '#9ca3af' : '#4b5563' }
      },
      y: {
        beginAtZero: true,
        grid: { color: theme === 'dark' ? '#374151' : '#f3f4f6' },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563',
          callback: (value) => value.toLocaleString() + ' ETB'
        }
      }
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SavingAnalyzer;
