import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function DepartmentChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = {
    labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Design'],
    datasets: [
      {
        data: [45, 25, 15, 5, 10],
        backgroundColor: [
          '#3b82f6', 
          '#10b981', 
          '#f59e0b', 
          '#ef4444', 
          '#8b5cf6', 
        ],
        borderWidth: isDark ? 2 : 0,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Inter', sans-serif" }
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-premium h-[380px] flex flex-col transition-all duration-500">
      <h3 className="text-base font-bold mb-6 text-foreground tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
        Department Distribution
      </h3>
      <div className="flex-1 min-h-0 relative">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

export function AttendanceChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Present (%)',
        data: [98, 97, 95, 96, 92],
        borderColor: '#3b82f6',
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: isDark ? '#0b0e14' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expected (%)',
        data: [99, 99, 99, 99, 99],
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
        borderDash: [6, 6],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Inter', sans-serif", size: 11, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        backdropBlur: 8,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      y: {
        min: 80,
        max: 100,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(148, 163, 184, 0.05)',
          drawBorder: false,
        },
        ticks: {
          padding: 10,
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, weight: '600' }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          padding: 10,
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, weight: '600' }
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-premium h-[380px] flex flex-col transition-all duration-500">
      <h3 className="text-base font-bold mb-6 text-foreground tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
        Attendance Trends
      </h3>
      <div className="flex-1 min-h-0 relative">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export function DiversityChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = {
    labels: ['Female', 'Male', 'Non-binary'],
    datasets: [
      {
        data: [45, 50, 5],
        backgroundColor: [
          '#ec4899', 
          '#3b82f6', 
          '#8b5cf6', 
        ],
        borderWidth: isDark ? 6 : 0,
        borderColor: isDark ? '#111827' : 'transparent',
        cutout: '75%',
        borderRadius: 8,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Inter', sans-serif", size: 11, weight: '600' }
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-premium h-[380px] flex flex-col transition-all duration-500">
      <h3 className="text-base font-bold mb-6 text-foreground tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
        Gender Diversity
      </h3>
      <div className="flex-1 min-h-0 relative">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
