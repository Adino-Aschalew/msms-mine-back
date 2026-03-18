import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = ({ dateRange }) => {
  const { theme } = useTheme();

  const data = {
    labels: ['Salaries', 'Office Rent', 'Marketing', 'Software', 'Utilities', 'Other'],
    datasets: [
      {
        data: [45000, 12000, 8000, 6000, 3500, 4500],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: theme === 'dark' ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: 'normal',
            family: 'system-ui, -apple-system, sans-serif'
          },
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = dataset.data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i,
                  fontColor: theme === 'dark' ? '#ffffff' : '#374151',
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: theme === 'dark' ? '#ffffff' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = '$' + context.parsed.toLocaleString();
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            label += `${value} (${percentage}%)`;
            return label;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="h-64 flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;
