import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, options = {} }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + Number(b), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            label += percentage + '%';
            return label;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="h-80 relative">
      <Pie ref={chartRef} data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

export default PieChart;
