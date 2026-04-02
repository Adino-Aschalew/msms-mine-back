import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileIcon as FilePdf, Users, Clock, TrendingUp, CheckCircle, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { SafeLineChart, SafeBarChart } from '../components/Shared/SafeCharts';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';
import { hrAPI } from '../../../shared/services/hrAPI';
import { reportsAPI } from '../../../shared/services/reportsAPI';

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

export default function ReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartRefs = useRef({});
  
  
  useEffect(() => {
    return () => {
      
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, []);
  const [reportType, setReportType] = useState('payroll');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [reportStats, setReportStats] = useState({
    total: 0,
    thisMonth: 0,
    processing: 0,
    failed: 0
  });

  useEffect(() => {
    fetchReportsData();
    fetchReportsList();
  }, [reportType]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getReportsData(reportType);
      setReportsData(response.data);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsList = async () => {
    try {
      const response = await reportsAPI.getHistory(1, 100);
      if (response && response.data && response.data.history) {
        const historyData = response.data.history;
        
        const formattedReports = historyData.map(report => ({
          id: report.id.toString(),
          name: report.report_name,
          type: report.report_type,
          department: 'All', 
          generated: new Date(report.generation_date).toLocaleDateString(),
          status: 'Completed',
          size: 'Unknown'
        }));
        
        setReports(formattedReports);
        
        const now = new Date();
        const thisMonthCount = formattedReports.filter(r => {
          const d = new Date(r.generated);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        
        setReportStats({
          total: formattedReports.length,
          thisMonth: thisMonthCount,
          processing: 0,
          failed: 0
        });
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports list:', error);
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
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
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { weight: '600' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { weight: '600' } }
      }
    }
  };

  
  const getPayrollExpensesData = () => {
    if (!reportsData?.expenses || reportsData.expenses.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Payroll Expenses ($)',
          data: [0],
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
          borderRadius: 12,
        }]
      };
    }

    return {
      labels: reportsData.expenses.map(e => e.month),
      datasets: [{
        label: 'Payroll Expenses ($)',
        data: reportsData.expenses.map(e => e.amount),
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
        borderRadius: 12,
      }]
    };
  };

  const getAttendanceData = () => {
    if (!reportsData?.trends || reportsData.trends.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Attendance Rate (%)',
          data: [0],
          borderColor: '#10b981',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        }]
      };
    }

    return {
      labels: reportsData.trends.map(t => new Date(t.date).toLocaleDateString()),
      datasets: [{
        label: 'Attendance Rate (%)',
        data: reportsData.trends.map(t => 
          t.totalEmployees > 0 ? Math.round((t.present / t.totalEmployees) * 100) : 0
        ),
        borderColor: '#10b981',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const getDepartmentData = () => {
    if (!reportsData?.departmentBreakdown || reportsData.departmentBreakdown.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          backgroundColor: ['#3b82f6'],
          borderWidth: isDark ? 4 : 0,
          borderColor: isDark ? '#0b0e14' : 'transparent',
        }]
      };
    }

    return {
      labels: reportsData.departmentBreakdown.map(d => d.department),
      datasets: [{
        data: reportsData.departmentBreakdown.map(d => d.amount),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
        ],
        borderWidth: isDark ? 4 : 0,
        borderColor: isDark ? '#0b0e14' : 'transparent',
      }]
    };
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading reports data...</div>
        </div>
      </div>
    );
  }

  const payrollChartData = getPayrollExpensesData();
  const attendanceChartData = getAttendanceData();
  const departmentChartData = getDepartmentData();

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1200);
  };

  const getReportContent = () => {
    switch (reportType) {
      case 'payroll':
        return (
          <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Payroll Analytics</h3>
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                  <Clock size={12} className="text-primary-500" /> Fiscal Q1-Q2 2026 Summary
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-bold">Total Operational Expense</p>
                <p className="text-4xl font-black text-foreground tracking-tighter">
                  ${reportsData?.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { 
                   label: 'Highest Dept Expense', 
                   value: reportsData?.departmentBreakdown?.[0]?.department || 'N/A', 
                   trend: '4%', 
                   icon: TrendingUp, 
                   color: 'text-emerald-500' 
                 },
                 { 
                   label: 'Average Salary', 
                   value: reportsData?.departmentBreakdown?.length > 0 
                     ? `$${Math.round(reportsData.departmentBreakdown.reduce((sum, d) => sum + d.amount, 0) / reportsData.departmentBreakdown.reduce((sum, d) => sum + d.employeeCount, 0))}` 
                     : '$0', 
                   trend: 'Global', 
                   color: 'text-slate-400' 
                 },
                 { 
                   label: 'Total Employees', 
                   value: reportsData?.departmentBreakdown?.reduce((sum, d) => sum + d.employeeCount, 0) || 0, 
                   trend: '12%', 
                   icon: TrendingUp, 
                   color: 'text-emerald-500' 
                 }
               ].map((card, i) => (
                 <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-primary-500/30 transition-all group shadow-xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{card.label}</p>
                   <p className="text-xl font-black text-foreground tracking-tight">{card.value}</p>
                   <p className={`text-[10px] ${card.color} mt-3 flex items-center gap-1 font-black uppercase tracking-widest`}>
                     {card.icon && <card.icon size={12}/>} {card.trend} <span className="text-slate-500 font-bold ml-1 italic">vs base</span>
                   </p>
                 </div>
               ))}
            </div>

            <div className="h-[320px] w-full mt-10 p-8 glass-card border border-white/10 rounded-[2.5rem] shadow-2xl relative">
              <div className="absolute top-6 left-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Expenditure Trend</span>
              </div>
              <SafeBarChart data={payrollChartData} options={commonOptions} />
            </div>

            <div className="mt-10 glass-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-white/[0.03] text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Department Unit</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-center">Headcount</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-right">Current Payroll</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reportsData?.departmentBreakdown?.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5 font-black text-foreground tracking-tight">{row.department}</td>
                        <td className="px-8 py-5 text-center font-bold text-slate-400">{row.employeeCount}</td>
                        <td className="px-8 py-5 text-right font-black text-primary-500">${row.amount.toLocaleString()}</td>
                      </tr>
                    )) || <tr><td colSpan="3" className="px-8 py-5 text-center text-slate-400">No data available</td></tr>}
                  </tbody>
               </table>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Time & Presence</h3>
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Weekly organizational mobility report</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { label: 'Avg Attendance', value: '96%', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                 { label: 'Total Leave Days', value: '42', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                 { label: 'Unplanned Absences', value: '5', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
               ].map((card, i) => (
                 <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-primary-500/30 transition-all shadow-xl flex items-center gap-5">
                   <div className={`p-4 ${card.bg} ${card.color} rounded-2xl group-hover:scale-110 transition-transform`}><card.icon size={24}/></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-1">{card.label}</p>
                     <p className="font-black text-foreground text-2xl tracking-tighter">{card.value}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="h-[320px] w-full mt-10 p-8 glass-card border border-white/10 rounded-[2.5rem] shadow-2xl">
              <SafeLineChart data={attendanceChartData} options={commonOptions} />
            </div>
          </div>
        );
      case 'demographics':
        return (
          <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Talent Structure</h3>
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Global department & headcount breakdown</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-10">
              <div className="h-[350px] w-full glass-card border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</p>
                    <p className="text-4xl font-black text-foreground tracking-tighter">135</p>
                  </div>
                </div>
                <Doughnut data={demographicsChartData} options={{...commonOptions, cutout: '80%'}} />
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Current Headcount', value: '135', icon: Users, color: 'bg-primary-500' },
                  { label: 'Largest Department', value: 'Engineering (33%)', icon: TrendingUp, color: 'bg-emerald-500' },
                  { label: 'Fastest Growing Unit', value: 'Sales (+12% YoY)', icon: Zap, color: 'bg-amber-500' }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-primary-500/30 transition-all">
                    <div className={`p-4 ${item.color} text-white rounded-2xl group-hover:rotate-12 transition-transform shadow-lg`}><item.icon size={22}/></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                       <p className="font-black text-foreground text-xl tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/10 flex items-center justify-center text-slate-600 mb-8 shadow-inner">
              <FileText size={48} className="opacity-40" />
            </div>
            <h4 className="text-2xl font-black text-foreground tracking-tight mb-2 italic">Module Under Development</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto font-black uppercase tracking-widest leading-relaxed">Preview endpoints for this template are coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary-500 decoration-8 underline-offset-8">Analytics & Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mt-3 ml-1">Advanced reporting engine & visual data matrix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {}
        <div className="lg:col-span-5 xl:col-span-4 glass-card border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden h-fit flex flex-col group">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-primary-500/20 transition-all duration-700"></div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/30 font-black italic">RB</div>
              Report Architect
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Zap size={12} className="text-primary-500" /> Pipeline Configuration
            </p>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 border-l-2 border-primary-500 ml-1">01. Select Data Stream</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'payroll', label: 'Payroll Dynamics', icon: TrendingUp },
                  { id: 'attendance', label: 'Talent Mobility', icon: Clock },
                  { id: 'demographics', label: 'Talent Matrix', icon: Users },
                ].map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setReportType(type.id);
                        setIsGenerated(false);
                      }}
                      className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${
                        reportType === type.id 
                          ? 'border-primary-500 bg-primary-500/[0.08] shadow-2xl shadow-primary-500/10' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      {reportType === type.id && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary-500 text-white flex items-center justify-center rounded-bl-2xl">
                          <CheckCircle size={14} />
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl transition-all duration-500 ${reportType === type.id ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/40 rotate-12 scale-110' : 'bg-slate-900 dark:bg-black/40 text-slate-600'}`}>
                        <Icon size={20} />
                      </div>
                      <span className={`text-sm font-black tracking-tight transition-colors ${reportType === type.id ? 'text-foreground' : 'text-slate-500 group-hover:text-foreground'}`}>
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 border-l-2 border-primary-500 ml-1">02. Stream Parameters</label>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter ml-1">Starting</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                      <input type="date" className="w-full pl-10 pr-3 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter ml-1">Ending</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                      <input type="date" className="w-full pl-10 pr-3 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter ml-1">Scope</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
                    <select className="w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-foreground appearance-none cursor-pointer">
                      <option className="bg-slate-900">All Enterprise Units</option>
                      <option className="bg-slate-900">Core Engineering</option>
                      <option className="bg-slate-900">Market Growth</option>
                      <option className="bg-slate-900">Global Operations</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 border-l-2 border-primary-500 ml-1">03. Protocol Output</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-emerald-500/50 transition-all font-black text-[10px] uppercase tracking-widest text-foreground group">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 group-hover:scale-125 transition-transform" /> XLS
                </button>
                <button type="button" className="flex items-center justify-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-rose-500/50 transition-all font-black text-[10px] uppercase tracking-widest text-foreground group">
                  <FilePdf className="w-5 h-5 text-rose-500 group-hover:scale-125 transition-transform" /> PDF
                </button>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-4 px-4 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] transition-all shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] font-black uppercase text-xs tracking-[0.3em] mt-6 disabled:opacity-70 active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isGenerating ? (
                <div className="w-4 h-4 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isGenerating ? 'Architecting...' : 'Build Visuals'}
            </button>
          </div>
        </div>

        {}
        <div className={`lg:col-span-7 xl:col-span-8 glass-card rounded-[3rem] min-h-[700px] p-12 transition-all duration-1000 relative overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] ${isGenerated ? 'bg-[#0b0e14] border border-white/10' : 'border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center'}`}>
          {!isGenerated && !isGenerating && (
            <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-sm">
              <div className="w-32 h-32 rounded-[3.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center text-slate-600 mb-10 mx-auto shadow-inner group">
                <FileText size={56} className="opacity-20 group-hover:opacity-100 transition-opacity duration-1000 rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tighter uppercase italic">Neutral State</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">System awaiting configuration baseline. please define architect parameters to generate intelligence matrix.</p>
            </div>
          )}

          {isGenerating && (
             <div className="flex flex-col items-center justify-center h-full space-y-10 animate-in fade-in duration-500">
               <div className="relative">
                 <div className="w-24 h-24 border-8 border-white/5 border-t-primary-500 rounded-full animate-spin shadow-2xl"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin py-10 scale-75 [animation-direction:reverse]"></div>
                 </div>
               </div>
               <div className="space-y-4 text-center">
                 <p className="text-xl font-black text-foreground tracking-tighter uppercase italic animate-pulse">Processing Neural Nodes...</p>
                 <div className="flex justify-center gap-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1 h-3 bg-primary-500/20 rounded-full animate-bounce" style={{animationDelay: `${i*100}ms`}}></div>
                    ))}
                 </div>
               </div>
             </div>
          )}

          {isGenerated && !isGenerating && getReportContent()}
        </div>
      </div>
    </div>
  );
}
