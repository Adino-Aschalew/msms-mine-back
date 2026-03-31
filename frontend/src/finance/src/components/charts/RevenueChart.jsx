import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ dateRange, dashboardData }) => {
  const { theme } = useTheme();
  
  const cashFlow = dashboardData?.monthlyCashFlow || [];
  
  const data = {
    labels: cashFlow.length > 0 
      ? cashFlow.map(d => d.period).reverse()
      : dateRange === '7days' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : dateRange === '30days'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: cashFlow.length > 0
          ? cashFlow.map(d => (parseFloat(d.savings_in || 0) + parseFloat(d.loan_payments || 0) + parseFloat(d.savings_interest || 0))).reverse()
          : [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: cashFlow.length > 0
          ? cashFlow.map(d => Math.abs(parseFloat(d.savings_out || 0) + parseFloat(d.loan_penalties || 0))).reverse()
          : [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: theme === 'dark' ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: 'normal'
          }
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: theme === 'dark' ? '#ffffff' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString() + ' ETB';
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#374151',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#374151',
          callback: function (value) {
            return value.toLocaleString() + ' ETB';
          },
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueChart;
