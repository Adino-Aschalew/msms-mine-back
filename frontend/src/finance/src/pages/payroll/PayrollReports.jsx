import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Calendar, DollarSign, Users, Eye, Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  VALIDATED: { label: 'Validated', color: 'blue',   icon: CheckCircle },
  APPROVED:  { label: 'Approved',  color: 'green',  icon: CheckCircle },
  PROCESSED: { label: 'Processed', color: 'green',  icon: CheckCircle },
  PENDING:   { label: 'Pending',   color: 'yellow', icon: Clock },
  FAILED:    { label: 'Failed',    color: 'red',    icon: XCircle },
  REVERSED:  { label: 'Reversed',  color: 'gray',   icon: AlertCircle },
};

const COLOR_MAP = {
  blue:   { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',   icon: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  green:  { badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  yellow: { badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  red:    { badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',       icon: 'text-red-600 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-900/30' },
  gray:   { badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',      icon: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-700' },
  orange: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', icon: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
};

const fmt = (n) => {
  if (n === null || n === undefined || n === '') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M ETB`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K ETB`;
  return `${num.toFixed(2)} ETB`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

// ─── Batch Detail Modal ──────────────────────────────────────────────────────
const BatchModal = ({ batch, details, detailsLoading, onClose, onDownload, downloading }) => {
  if (!batch) return null;
  const statusCfg  = STATUS_CONFIG[batch.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;
  const colors     = COLOR_MAP[statusCfg.color];

  const netSalarySum = details?.reduce((sum, d) => sum + parseFloat(d.net_salary || 0), 0) || 0;
  const displayNetSalary = netSalarySum > 0 ? fmt(netSalarySum) : '—';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {batch.batch_name ?? `Batch #${batch.id}`}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{fmtDate(batch.payroll_date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${colors.badge}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusCfg.label}
            </span>
            <button
              onClick={onDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {downloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? 'Downloading…' : 'Download Excel'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          {[
            { label: 'Total Payroll',  value: fmt(batch.total_amount) },
            { label: 'Employees',      value: batch.total_employees ?? '—' },
            { label: 'Net Salary',     value: detailsLoading ? '...' : displayNetSalary },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Details Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {detailsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !details || details.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No detail records found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    {['Employee', 'Gross Salary', 'Savings', 'Loan Repayment', 'Net Salary'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {details.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {d.first_name ?? ''} {d.last_name ?? ''}
                        {d.employee_id && <span className="ml-1 text-xs text-gray-400">#{d.employee_id}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(d.gross_salary)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(d.savings_deduction)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(d.loan_repayment_deduction)}</td>
                      <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">{fmt(d.net_salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const PayrollReports = () => {
  const [batches, setBatches]             = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [page, setPage]                   = useState(1);
  const [pagination, setPagination]       = useState(null);

  // Modal state
  const [selectedBatch, setSelectedBatch]         = useState(null);
  const [batchDetails, setBatchDetails]           = useState([]);
  const [detailsLoading, setDetailsLoading]       = useState(false);

  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const [batchRes, statsRes] = await Promise.allSettled([
        financeAPI.getPayrollBatches(params),
        financeAPI.getPayrollStats(),
      ]);

      if (batchRes.status === 'fulfilled') {
        const data = batchRes.value;
        const list = data?.batches ?? data?.data?.batches ?? data?.data ?? data ?? [];
        setBatches(Array.isArray(list) ? list : []);
        setPagination(data?.pagination ?? data?.data?.pagination ?? null);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.data ?? statsRes.value);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── View: open modal + fetch details ─────────────────────────────────────
  const handleView = async (batch) => {
    setSelectedBatch(batch);
    setBatchDetails([]);
    setDetailsLoading(true);
    try {
      const res = await financeAPI.getPayrollBatchDetails(batch.id, 1, 100);
      const list = res?.details ?? res?.data?.details ?? res?.data ?? res ?? [];
      setBatchDetails(Array.isArray(list) ? list : []);
    } catch (err) {
    } finally {
      setDetailsLoading(false);
    }
  };

  // ── Download (Excel export) ───────────────────────────────────────────────
  const handleDownload = async (batch) => {
    const key = `download-${batch.id}`;
    try {
      setLoadingAction(key);
      const response = await financeAPI.exportPayrollBatch(batch.id);
      const blob = response instanceof Blob ? response : new Blob([response]);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `payroll-${batch.batch_name ?? batch.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addNotification({ type: 'success', title: 'Downloaded', message: 'Payroll report downloaded.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to download report.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const filtered = batches.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.batch_name ?? '').toLowerCase().includes(term) ||
      (b.payroll_date ?? '').toLowerCase().includes(term) ||
      (b.status ?? '').toLowerCase().includes(term)
    );
  });

  const totalPayroll   = stats?.total_amount    ?? batches.reduce((s, b) => s + parseFloat(b.total_amount ?? 0), 0);
  const totalEmployees = stats?.total_employees ?? batches.reduce((s, b) => s + parseInt(b.total_employees ?? 0), 0);
  const thisMonth      = batches.filter((b) => {
    if (!b.payroll_date) return false;
    const d = new Date(b.payroll_date), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const kpis = [
    { label: 'Total Batches',   value: pagination?.total ?? batches.length, icon: FileText,   color: 'blue' },
    { label: 'This Month',      value: thisMonth,                             icon: Calendar,   color: 'green' },
    { label: 'Total Payroll',   value: fmt(totalPayroll),                    icon: DollarSign, color: 'blue' },
    { label: 'Total Employees', value: totalEmployees || '—',                icon: Users,      color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Modal */}
      {selectedBatch && (
        <BatchModal
          batch={selectedBatch}
          details={batchDetails}
          detailsLoading={detailsLoading}
          onClose={() => setSelectedBatch(null)}
          onDownload={() => handleDownload(selectedBatch)}
          downloading={loadingAction === `download-${selectedBatch.id}`}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse, download and view payroll batches</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </button>
          <button onClick={() => navigate('/finance/payroll/import')} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm">
            <Plus className="h-4 w-4 mr-2" /> Upload Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const c = COLOR_MAP[kpi.color];
          return (
            <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 ${c.bg} rounded-xl mb-4`}>
                  <kpi.icon className={`h-8 w-8 ${c.icon}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{kpi.label}</h3>
                <p className={`text-3xl font-bold ${c.icon} mb-1`}>{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No payroll batches found.</p>
          <button onClick={() => navigate('/finance/payroll/import')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Upload First Payroll
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((batch) => {
            const statusCfg  = STATUS_CONFIG[batch.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;
            const colors     = COLOR_MAP[statusCfg.color];
            const dlKey      = `download-${batch.id}`;

            return (
              <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 flex flex-col h-full hover:shadow-xl transition-all border-t-4 border-t-blue-500">
                {/* Title & Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {batch.batch_name ?? `Batch #${batch.id}`}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1 shrink-0" />
                      {fmtDate(batch.payroll_date)}
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase rounded-full shrink-0 ml-2 ${colors.badge}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 flex-grow text-sm">
                  {batch.total_amount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Payroll</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{fmt(batch.total_amount)}</span>
                    </div>
                  )}
                  {batch.total_employees !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Employees</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{batch.total_employees}</span>
                    </div>
                  )}
                  {batch.net_salary !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Net Salary</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{fmt(batch.net_salary)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{fmtDate(batch.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleView(batch)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleDownload(batch)}
                    disabled={loadingAction === dlKey}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-xs disabled:opacity-50"
                  >
                    {loadingAction === dlKey
                      ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                      : <><Download className="h-3.5 w-3.5" /> Download</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PayrollReports;
