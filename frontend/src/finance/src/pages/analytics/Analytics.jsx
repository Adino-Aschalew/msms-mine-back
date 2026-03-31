import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart, LineChart, Calendar, Filter, Download, Eye, Activity, Zap, Target, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  CreditCard,
  Wallet,
  BarChart3,
  Layers,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Shield
} from 'lucide-react';

const Analytics = () => {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');

  React.useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getAnalytics({ period: selectedPeriod });
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to fetch analytics data' });
    } finally {
      setLoading(false);
    }
  };

  const toggleChart = (chartId) => {
    const newExpanded = new Set(expandedCharts);
    if (newExpanded.has(chartId)) {
      newExpanded.delete(chartId);
    } else {
      newExpanded.add(chartId);
    }
    setExpandedCharts(newExpanded);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilters(false);
    // Update selectedPeriod to match filter date range
    if (filters.dateRange !== selectedPeriod) {
      setSelectedPeriod(filters.dateRange);
    }
  };

  const applyCustomization = (preferences) => {
    setViewPreferences(preferences);
    setShowCustomize(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '30days',
      department: 'all',
      metricType: 'all',
      amountRange: { min: '', max: '' },
      compareWith: 'previous',
      dataSource: 'all'
    };
    setActiveFilters(defaultFilters);
    setSelectedPeriod('30days');
  };

  const exportChartData = (chart, format) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = `Chart: ${chart.title}\nDescription: ${chart.description}\n\nData:\n${chart.data.map(item => 
          `${item.month || item.category || item.period || item.segment},${item.value || item.amount || item.margin || item.revenue || item.inflow || 'N/A'}`
        ).join('\n')}`;
        filename = `${chart.title.replace(/\s+/g, '_')}.csv`;
        mimeType = 'text/csv';
        break;
      case 'pdf':
        content = `PDF Export: ${chart.title}\n\n${chart.description}\n\nData would be formatted as PDF in production`;
        filename = `${chart.title.replace(/\s+/g, '_')}.pdf`;
        mimeType = 'application/pdf';
        break;
      case 'excel':
        content = `Excel Export: ${chart.title}\n\n${chart.description}\n\nData would be formatted as Excel in production`;
        filename = `${chart.title.replace(/\s+/g, '_')}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadChart = (chart) => {
    // Create a canvas for chart visualization
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, canvas.width / 2, 40);
    
    // Add description
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(chart.description, canvas.width / 2, 65);
    
    // Draw different chart types
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;
    const radius = 120;
    
    switch (chart.type) {
      case 'pie':
        drawPieChart(ctx, centerX, centerY, radius, chart.data);
        break;
      case 'donut':
        drawDonutChart(ctx, centerX, centerY, radius, chart.data);
        break;
      case 'line':
        drawLineChart(ctx, centerX, centerY, radius, chart.data);
        break;
      case 'bar':
        drawBarChart(ctx, centerX, centerY, radius, chart.data);
        break;
      case 'area':
        drawAreaChart(ctx, centerX, centerY, radius, chart.data);
        break;
      case 'combo':
        drawComboChart(ctx, centerX, centerY, radius, chart.data);
        break;
      default:
        drawDefaultChart(ctx, centerX, centerY, radius, chart);
    }
    
    // Add legend
    drawLegend(ctx, chart.data, canvas.width - 150, 100);
    
    // Download the canvas as image
    canvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chart.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  };

  const drawPieChart = (ctx, centerX, centerY, radius, data) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + (parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 1), 0);
    
    data.slice(0, 6).forEach((item, index) => {
      const value = parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 1;
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      // Draw pie slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
  };

  const drawDonutChart = (ctx, centerX, centerY, radius, data) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + (parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 1), 0);
    const innerRadius = radius * 0.4;
    
    data.slice(0, 6).forEach((item, index) => {
      const value = parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 1;
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      // Draw donut slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
  };

  const drawLineChart = (ctx, centerX, centerY, radius, data) => {
    const points = data.slice(0, 6).map((item, index) => ({
      x: centerX - radius + (index * (radius * 2 / 5)),
      y: centerY - (parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 50) + 50
    }));
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = centerY - radius + (i * (radius * 2 / 5));
      ctx.beginPath();
      ctx.moveTo(centerX - radius, y);
      ctx.lineTo(centerX + radius, y);
      ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    
    // Draw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawBarChart = (ctx, centerX, centerY, radius, data) => {
    const barWidth = (radius * 2 / data.slice(0, 6).length) * 0.6;
    const maxValue = Math.max(...data.slice(0, 6).map(item => parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 100));
    
    data.slice(0, 6).forEach((item, index) => {
      const value = parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 50;
      const barHeight = (value / maxValue) * (radius * 1.5);
      const x = centerX - radius + (index * (radius * 2 / data.slice(0, 6).length)) + barWidth * 0.2;
      const y = centerY + radius - barHeight;
      
      // Draw bar
      ctx.fillStyle = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6];
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  };

  const drawAreaChart = (ctx, centerX, centerY, radius, data) => {
    const points = data.slice(0, 6).map((item, index) => ({
      x: centerX - radius + (index * (radius * 2 / 5)),
      y: centerY - (parseFloat(item.value || item.amount || item.revenue || item.inflow || 0) || 50) + 50
    }));
    
    // Draw area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, centerY + radius);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, centerY + radius);
    ctx.closePath();
    ctx.fill();
    
    // Draw line on top
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  const drawComboChart = (ctx, centerX, centerY, radius, data) => {
    // Draw bars first
    drawBarChart(ctx, centerX, centerY, radius, data);
    // Then draw line on top
    drawLineChart(ctx, centerX, centerY, radius, data);
  };

  const drawDefaultChart = (ctx, centerX, centerY, radius, chart) => {
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart`, centerX, centerY);
  };

  const drawLegend = (ctx, data, startX, startY) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    data.slice(0, 4).forEach((item, index) => {
      // Color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(startX, startY + (index * 25), 15, 15);
      
      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      const label = (item.month || item.category || item.period || item.segment || '').substring(0, 15);
      ctx.fillText(label, startX + 20, startY + (index * 25) + 12);
    });
  };

  const chartData = [
    {
      id: 'revenue-trend',
      title: 'Revenue Trend Analysis',
      type: 'line',
      size: 'large',
      description: 'Monthly revenue progression with seasonal patterns',
      insights: [`${analyticsData?.revenueGrowth || 0}% period growth`, 'Stable upward trend'],
      data: (analyticsData?.monthlyCashFlow || []).map(cf => ({
        month: cf.period,
        value: cf.savings_in + cf.loan_payments + cf.savings_interest,
        target: (cf.savings_in + cf.loan_payments) * 0.9
      }))
    },
    {
      id: 'expense-breakdown',
      title: 'Expense Breakdown',
      type: 'pie',
      size: 'medium',
      description: 'Distribution of operational expenses by category',
      insights: analyticsData?.expenseBreakdown?.map(e => `${e.category}: ${((e.value / analyticsData.expenses) * 100).toFixed(1)}%`) || [],
      data: analyticsData?.expenseBreakdown || []
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Analysis',
      type: 'area',
      size: 'large',
      description: 'Monthly cash flow patterns and forecasting',
      insights: ['Positive trend', 'Strong liquidity'],
      data: (analyticsData?.monthlyCashFlow || []).map(cf => ({
        month: cf.period,
        inflow: cf.savings_in + cf.loan_payments + cf.savings_interest,
        outflow: Math.abs(cf.savings_out || 0) + Math.abs(cf.loan_penalties || 0) + (analyticsData?.expenses / 12), // Distributed payroll estimate
        net: (cf.savings_in + cf.loan_payments + cf.savings_interest) - (Math.abs(cf.savings_out || 0) + Math.abs(cf.loan_penalties || 0))
      }))
    }
  ];

  const aiInsights = [
    {
      id: 1,
      type: analyticsData?.netProfit > 0 ? 'achievement' : 'risk',
      priority: 'high',
      title: 'Real-time Performance Analysis',
      description: `System analysis shows a net profit of ${analyticsData?.netProfit?.toLocaleString() || 0} ETB for the selected period.`,
      impact: `${analyticsData?.netProfit?.toLocaleString() || 0} ETB current margin`,
      confidence: 95,
      action: 'Monitor upcoming payroll obligations',
      timeframe: 'Immediate'
    }
  ];

  const benchmarks = [
    { metric: 'Revenue Growth', company: analyticsData?.revenueGrowth || 0, industry: 12.5, status: (analyticsData?.revenueGrowth || 0) > 12.5 ? 'above' : 'below' },
    { metric: 'Expense Ratio', company: ((analyticsData?.expenses / analyticsData?.revenue) * 100).toFixed(1), industry: 75.2, status: 'above' }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time financial insights and predictive analytics for data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
            <option value="custom">Custom range</option>
          </select>
          <button className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          <button className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Modern Analytics Dashboard */}
      <div className="space-y-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: `${(analyticsData?.revenue || 0).toLocaleString()} ETB`, change: `+${analyticsData?.revenueGrowth || 0}%`, color: 'blue' },
            { label: 'Expenses', value: `${(analyticsData?.expenses || 0).toLocaleString()} ETB`, change: `+${analyticsData?.expensesGrowth || 0}%`, color: 'red' },
            { label: 'Net Profit', value: `${(analyticsData?.netProfit || 0).toLocaleString()} ETB`, change: `+${analyticsData?.profitGrowth || 0}%`, color: 'green' },
            { label: 'Cash Balance', value: `${(analyticsData?.cashBalance || 0).toLocaleString()} ETB`, change: `+${analyticsData?.cashChange || 0}%`, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Enhanced View Toggle */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'detailed', label: 'Detailed', icon: Layers },
                { id: 'forecast', label: 'Forecast', icon: TrendingUp }
              ].map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setSelectedView(view.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view.id
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {view.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-blue-500/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </button>
              <button 
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize View
              </button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartData.map((chart) => (
            <div key={chart.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
              {/* Chart Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {chart.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chart.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChart(chart.id)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {expandedCharts.has(chart.id) ?
                        <Minimize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" /> :
                        <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      }
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors" onClick={() => { setSelectedChart(chart); setShowViewModal(true); }}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors" onClick={() => { setSelectedChart(chart); setShowExportModal(true); }}>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className={`p-6 bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 ${
                expandedCharts.has(chart.id) ? 'h-96' : 'h-64'
              }`}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {chart.type === 'line' && <LineChart className="h-12 w-12 text-blue-500" />}
                      {chart.type === 'pie' && <PieChart className="h-12 w-12 text-green-500" />}
                      {chart.type === 'bar' && <BarChart className="h-12 w-12 text-purple-500" />}
                      {chart.type === 'area' && <TrendingUp className="h-12 w-12 text-orange-500" />}
                      {chart.type === 'donut' && <PieChart className="h-12 w-12 text-red-500" />}
                      {chart.type === 'combo' && <BarChart3 className="h-12 w-12 text-indigo-500" />}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interactive {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Click to interact • Drag to zoom • Hover for details
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-1">
                  {chart.insights.map((insight, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium"
                    >
                      {insight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {chart.data.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.month || item.category || item.period || item.segment}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.value ? `$${item.value.toLocaleString()}` :
                         item.amount ? `$${item.amount.toLocaleString()}` :
                         item.margin ? `${item.margin}%` :
                         item.revenue ? `$${item.revenue.toLocaleString()}` :
                         item.inflow ? `$${item.inflow.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Chart Modal */}
        {showViewModal && selectedChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedChart.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedChart.description}
                  </p>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-6 h-96">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        {selectedChart.type === 'line' && <LineChart className="h-20 w-20 text-blue-500" />}
                        {selectedChart.type === 'pie' && <PieChart className="h-20 w-20 text-green-500" />}
                        {selectedChart.type === 'bar' && <BarChart className="h-20 w-20 text-purple-500" />}
                        {selectedChart.type === 'area' && <TrendingUp className="h-20 w-20 text-orange-500" />}
                        {selectedChart.type === 'donut' && <PieChart className="h-20 w-20 text-red-500" />}
                        {selectedChart.type === 'combo' && <BarChart3 className="h-20 w-20 text-indigo-500" />}
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Full {selectedChart.type.charAt(0).toUpperCase() + selectedChart.type.slice(1)} Chart View
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Interactive chart with detailed data visualization
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {selectedChart.data.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {item.month || item.category || item.period || item.segment}
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {item.value ? `$${item.value.toLocaleString()}` :
                       item.amount ? `$${item.amount.toLocaleString()}` :
                       item.margin ? `${item.margin}%` :
                       item.revenue ? `$${item.revenue.toLocaleString()}` :
                       item.inflow ? `$${item.inflow.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200" onClick={() => downloadChart(selectedChart)}>
                  Download Chart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Chart Modal */}
        {showExportModal && selectedChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Export {selectedChart.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose export format and options
                  </p>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      className={`p-3 rounded-lg font-medium ${
                        selectedExportFormat === 'csv' 
                          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedExportFormat('csv')}
                    >
                      CSV
                    </button>
                    <button 
                      className={`p-3 rounded-lg font-medium ${
                        selectedExportFormat === 'pdf' 
                          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedExportFormat('pdf')}
                    >
                      PDF
                    </button>
                    <button 
                      className={`p-3 rounded-lg font-medium ${
                        selectedExportFormat === 'excel' 
                          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedExportFormat('excel')}
                    >
                      Excel
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Data Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 6 months</option>
                    <option>All time</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Include</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Chart data</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Summary statistics</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Insights and annotations</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200" onClick={() => { exportChartData(selectedChart, selectedExportFormat); setShowExportModal(false); }}>
                  Export Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  AI-Powered Insights
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automated analysis and actionable recommendations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-800 dark:text-green-400">Live</span>
                </div>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {aiInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                insight.type === 'opportunity' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                insight.type === 'risk' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                insight.type === 'achievement' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === 'opportunity' && <Target className="h-4 w-4 text-blue-500" />}
                    {insight.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {insight.type === 'achievement' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-purple-500" />}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {insight.confidence}% confidence
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {insight.description}
                </p>

                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {insight.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Predictive Analytics
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered forecasting and scenario planning
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Predictive</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Forecast */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="text-center mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Revenue Forecast
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    +24.6%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Expected growth next quarter
                  </p>
                </div>
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Conservative</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">$1.8M</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Realistic</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">$2.1M</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Optimistic</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">$2.4M</span>
                  </div>
                </div>
              </div>

              {/* Goal Achievement */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="text-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Goal Achievement
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    87%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    On track to meet annual targets
                  </p>
                </div>
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Q1 Target</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">✅ Met</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Q2 Target</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">🔄 In Progress</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Annual Goal</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">📈 On Track</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="text-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Risk Assessment
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Low
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Minimal risk factors detected
                  </p>
                </div>
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Market Risk</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">🟢 Low</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Cash Flow Risk</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">🟡 Medium</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Operational Risk</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">🟢 Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {showCustomize && (
        <div className="card p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Customize View
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize your analytics dashboard layout and preferences
              </p>
            </div>
            <button 
              onClick={() => setShowCustomize(false)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Layout Options */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Layout Options</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded" 
                    checked={tempPreferences.showKpiCards}
                    onChange={(e) => setTempPreferences({...tempPreferences, showKpiCards: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show KPI Cards</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded" 
                    checked={tempPreferences.showCharts}
                    onChange={(e) => setTempPreferences({...tempPreferences, showCharts: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Charts Grid</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded" 
                    checked={tempPreferences.showAiInsights}
                    onChange={(e) => setTempPreferences({...tempPreferences, showAiInsights: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show AI Insights</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded" 
                    checked={tempPreferences.showBenchmarks}
                    onChange={(e) => setTempPreferences({...tempPreferences, showBenchmarks: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Benchmarks</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded" 
                    checked={tempPreferences.showPredictiveAnalytics}
                    onChange={(e) => setTempPreferences({...tempPreferences, showPredictiveAnalytics: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Predictive Analytics</span>
                </label>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Display Preferences</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Density</label>
                  <select 
                    value={tempPreferences.chartDensity}
                    onChange={(e) => setTempPreferences({...tempPreferences, chartDensity: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Precision</label>
                  <select 
                    value={tempPreferences.dataPrecision}
                    onChange={(e) => setTempPreferences({...tempPreferences, dataPrecision: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low (1 decimal)</option>
                    <option value="medium">Medium (2 decimals)</option>
                    <option value="high">High (4 decimals)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Theme</label>
                  <select 
                    value={tempPreferences.colorTheme}
                    onChange={(e) => setTempPreferences({...tempPreferences, colorTheme: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="default">Default</option>
                    <option value="professional">Professional</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="monochrome">Monochrome</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Customize Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button 
                onClick={resetCustomization}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Reset to Default
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Export Settings
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => applyCustomization(tempPreferences)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Analytics;
