import { Line, Bar } from 'react-chartjs-2';
import { SafeLineChart, SafeBarChart } from '../Shared/SafeCharts';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Award, Target, TrendingUp, AlertTriangle, Calendar, CheckSquare, MoreHorizontal, Eye, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { hrAPI } from '../../../shared/services/hrAPI';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const reviewHistory = [
  { id: 1, employee: 'Sarah Jenkins', role: 'Senior Developer', date: '2026-03-01', type: 'Annual Review', score: 4.8, status: 'Completed', reviewer: 'David Chen' },
  { id: 2, employee: 'Michael Chen', role: 'Account Executive', date: '2026-02-15', type: 'Q1 Check-in', score: 3.5, status: 'In Progress', reviewer: 'Amanda Brooks' },
  { id: 3, employee: 'Emma Davis', role: 'Marketing Manager', date: '2026-02-10', type: 'Probation Review', score: 4.2, status: 'Completed', reviewer: 'Lisa Wong' },
  { id: 4, employee: 'David Smith', role: 'Frontend Developer', date: '2026-03-10', type: 'Project Eval', score: null, status: 'Scheduled', reviewer: 'Sarah Jenkins' },
];

export function PerformanceCharts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getPerformanceStats();
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-[2rem] p-8 shadow-xl border border-white/10 h-[400px] animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="flex-1 bg-gray-300 rounded"></div>
        </div>
        <div className="glass-card rounded-[2rem] p-8 shadow-xl border border-white/10 h-[400px] animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
          <div className="flex-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  
  const quarterlyData = performanceData?.quarterlyTrend || [];
  const departmentData = performanceData?.departmentStats || [];

  const performanceChartData = {
    labels: quarterlyData.map(d => d.quarter),
    datasets: [
      {
        label: 'Company Average Score',
        data: quarterlyData.map(d => parseFloat(d.avgScore)),
        borderColor: '#3b82f6',
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Goal Target',
        data: quarterlyData.map(() => 4.0),
        borderColor: isDark ? '#10b981' : '#059669',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        tension: 0,
      }
    ],
  };

  const departmentChartData = {
    labels: departmentData.map(d => d.department),
    datasets: [
      {
        label: 'Score (Out of 5)',
        data: departmentData.map(d => parseFloat(d.avgScore)),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
        ],
        borderRadius: 8,
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          usePointStyle: true,
          font: { family: "'Inter', sans-serif", weight: '600', size: 10 }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { weight: '600' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { weight: '600' } }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="glass-card rounded-[2rem] p-8 shadow-xl border border-white/10 h-[400px] flex flex-col group">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-foreground tracking-tight uppercase">Company Performance Trend</h3>
          <TrendingUp className="text-primary-500 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
        </div>
        <div className="flex-1 min-h-0 relative">
          {quarterlyData.length > 0 ? (
            <SafeLineChart data={performanceChartData} options={commonOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm font-bold">No performance data available</p>
                <p className="text-xs mt-2">Performance reviews will appear here once completed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-8 shadow-xl border border-white/10 h-[400px] flex flex-col group">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-foreground tracking-tight uppercase">Department Comparison</h3>
          <Target className="text-primary-500 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
        </div>
        <div className="flex-1 min-h-0 relative">
          {departmentData.length > 0 ? (
            <SafeBarChart data={departmentChartData} options={commonOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm font-bold">No department data available</p>
                <p className="text-xs mt-2">Department performance will appear here once reviews are completed</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  const { theme } = useTheme();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getPerformanceStats();
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-[2rem] p-6 shadow-xl border border-white/10 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { 
      title: 'Top Performer', 
      value: performanceData?.topPerformers > 0 ? `${performanceData.topPerformers} Employees` : 'N/A', 
      icon: Award, 
      color: 'text-primary-500', 
      bg: 'bg-primary-500/10' 
    },
    { 
      title: 'Goals Met', 
      value: performanceData ? `${Math.round((performanceData.goalsMet / Math.max(performanceData.completedReviews, 1)) * 100)}%` : '0%', 
      icon: Target, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      title: 'Avg Score', 
      value: performanceData?.avgScore || '0.0', 
      subtitle: '/ 5.0', 
      icon: TrendingUp, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Needs Attention', 
      value: performanceData?.needsAttention || 0, 
      icon: AlertTriangle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="glass-card rounded-[2rem] p-6 shadow-xl border border-white/10 flex items-center gap-5 group hover:scale-[1.02] transition-all cursor-default">
          <div className={`p-4 ${card.bg} ${card.color} rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-black/5`}>
            <card.icon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-1">{card.title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-foreground tracking-tighter truncate">{card.value}</p>
              {card.subtitle && <span className="text-xs font-bold text-slate-400">{card.subtitle}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewHistoryTable({ onScheduleReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getPerformanceReviews(1, 10);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 gap-4 border-b border-white/5 bg-white/[0.01]">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-primary-500" />
               Performance Evaluations
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent review cycles and feedback</p>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 gap-4 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-primary-500" />
             Performance Evaluations
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent review cycles and feedback</p>
        </div>
        <button 
          onClick={onScheduleReview}
          className="flex items-center gap-3 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl transition-all shadow-lg shadow-primary-600/20 font-black text-xs uppercase tracking-widest active:scale-[0.98]"
        >
          <Calendar className="w-4 h-4" />
          Schedule Review
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white/[0.02] text-slate-400 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Employee</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Cycle</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Date</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Reviewer</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap text-center">Score</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
              <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-primary-500/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-foreground">
                    <div className="font-bold text-sm tracking-tight">{review.employee}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{review.role}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-foreground bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      {review.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase letter-spacing-1">{format(new Date(review.date), 'MMM dd, yyyy')}</td>
                  <td className="px-8 py-5 text-foreground font-bold tracking-tight">{review.reviewer}</td>
                  <td className="px-8 py-5 text-center text-foreground font-black text-base">
                    {review.score ? <span className="text-primary-500">{review.score}</span> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black border uppercase tracking-widest
                      ${review.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        review.status === 'in progress' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 
                        review.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all" title="View Detail">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" title="Edit Review">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-foreground hover:bg-white/5 rounded-xl transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="text-slate-500">
                    <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-bold">No performance reviews found</p>
                    <p className="text-xs mt-2">Performance reviews will appear here once scheduled and completed</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
