import { useState } from 'react';
import { Target, TrendingUp, Users, Calendar, Award, AlertTriangle, CheckCircle, Clock, BarChart3, PieChart, Activity } from 'lucide-react';
import PerformanceMetrics from '../components/Performance/PerformanceMetrics';
import ScheduleReviewModal from '../components/Performance/ScheduleReviewModal';

export default function PerformancePage() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleScheduleReview = (data) => {
    console.log('New review scheduled:', data);
  };

  
  const kpiData = [
    {
      title: 'Overall Performance',
      value: '87.5%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Active Reviews',
      value: '24',
      change: '+4',
      trend: 'up',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Completion Rate',
      value: '92%',
      change: '+1.5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Pending Actions',
      value: '8',
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      color: 'orange'
    }
  ];

  const getKpiColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      green: 'bg-green-500 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      purple: 'bg-purple-500 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
      orange: 'bg-orange-500 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
    };
    return colors[color] || colors.blue;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Track employee performance, reviews, and organizational KPIs
          </p>
        </div>
        <button 
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium text-sm"
        >
          <Calendar size={18} />
          <span>Schedule Review</span>
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                    {kpi.change}
                  </span>
                  <TrendingUp 
                    size={16} 
                    className={`ml-1 ${getTrendColor(kpi.trend)}`}
                  />
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getKpiColor(kpi.color)}`}>
                <kpi.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              Performance Trends
            </h2>
            <select className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
              Last 6 Months
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <Activity className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Performance chart visualization</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="text-green-500" size={20} />
              Department Performance
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <PieChart className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Department breakdown chart</p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-500" size={20} />
            Employee Performance Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      SJ
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Sarah Jenkins</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EMP-001</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Engineering</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Senior Developer</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">92%</div>
                    <div className="ml-2 w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm">+5%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Mar 15, 2026</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Excellent
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      MC
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Michael Chen</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EMP-002</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Sales</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Account Executive</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">88%</div>
                    <div className="ml-2 w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-red-600">
                    <TrendingUp size={16} className="mr-1 rotate-180" />
                    <span className="text-sm">-2%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Mar 10, 2026</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Good
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                      ED
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Emma Davis</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">EMP-003</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Marketing</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Marketing Manager</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">95%</div>
                    <div className="ml-2 w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm">+3%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">Mar 14, 2026</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Excellent
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {}
      <ScheduleReviewModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSchedule={handleScheduleReview}
      />
    </div>
  );
}
