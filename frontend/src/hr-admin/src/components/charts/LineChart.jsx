import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, options = {} }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Responsive options that adapt to screen size
  const getResponsiveOptions = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 1024;
      
      return {
        pointRadius: isMobile ? 8 : isTablet ? 6 : 5,
        pointHoverRadius: isMobile ? 12 : isTablet ? 9 : 8,
        hitRadius: isMobile ? 15 : isTablet ? 12 : 10,
        fontSize: isMobile ? 10 : isTablet ? 11 : 12,
        legendDisplay: !isMobile, // Hide legend on mobile for space
      };
    }
    return {
      pointRadius: 5,
      pointHoverRadius: 8,
      hitRadius: 10,
      fontSize: 12,
      legendDisplay: true,
    };
  };

  const responsive = getResponsiveOptions();

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      // Reduce animation duration on mobile for better performance
      ...(typeof window !== 'undefined' && window.innerWidth < 640 && { duration: 1000 })
    },
    interaction: {
      mode: 'index',
      intersect: false,
      // Larger hit area for touch devices
      axis: 'x',
    },
    plugins: {
      legend: {
        display: responsive.legendDisplay && data?.datasets?.length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: responsive.fontSize * 1.5,
          font: {
            size: responsive.fontSize,
            weight: '600'
          },
          boxWidth: responsive.fontSize,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: responsive.fontSize,
        cornerRadius: 8,
        displayColors: true,
        // Larger touch target on mobile
        caretSize: responsive.fontSize,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + ' users';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: responsive.fontSize - 1,
            weight: '500'
          },
          color: 'rgba(107, 114, 128, 1)',
          // Reduce number of ticks on mobile
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : 12,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          borderDash: [8, 4],
          drawBorder: false
        },
        ticks: {
          font: {
            size: responsive.fontSize - 1,
            weight: '500'
          },
          color: 'rgba(107, 114, 128, 1)',
          callback: function(value) {
            return value + ' users';
          },
          padding: responsive.fontSize * 0.8,
          // Reduce number of ticks on mobile
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 8,
        }
      }
    },
    elements: {
      point: {
        // Enhanced touch interactions
        hoverRadius: responsive.pointHoverRadius,
        hitRadius: responsive.hitRadius,
        // Larger border for better visibility
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      line: {
        // Smooth wave-like curves
        tension: 0.6,
        // Consistent border width across devices
        borderWidth: 3,
      }
    },
    // Touch-friendly configuration
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  return (
    <div className="h-80">
      <Line ref={chartRef} data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

export default LineChart;
