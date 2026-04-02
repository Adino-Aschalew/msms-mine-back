import React, { useRef, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Wrapper for Line chart with proper cleanup
export const SafeLineChart = ({ data, options, ...props }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Line ref={chartRef} data={data} options={options} {...props} />;
};

// Wrapper for Pie chart with proper cleanup
export const SafePieChart = ({ data, options, ...props }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Pie ref={chartRef} data={data} options={options} {...props} />;
};

// Wrapper for Bar chart with proper cleanup
export const SafeBarChart = ({ data, options, ...props }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Bar ref={chartRef} data={data} options={options} {...props} />;
};

export default { SafeLineChart, SafePieChart, SafeBarChart };
