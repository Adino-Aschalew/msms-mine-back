import React, { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, User, Calendar, CreditCard, Loader2, TrendingUp, AlertCircle, Filter, Search, RefreshCw, Users, DollarSign, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { savingsAPI } from '../../../../shared/services/savingsAPI';

const SavingsRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await savingsAPI.getSavingsRequests();
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Fetch savings requests error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch savings update requests'
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (requestId, status) => {
    setProcessingId(requestId);
    setReviewAction(status);
    setReviewComments('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setProcessingId(null);
    setReviewAction(null);
    setReviewComments('');
    setIsSubmitting(false);
  };

  const handleAction = async () => {
    const status = reviewAction;
    const requestId = processingId;
    const comments = reviewComments;

    if (!comments.trim()) {
      addNotification({
        type: 'error',
        title: 'Required',
        message: 'Please enter review comments'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await savingsAPI.handleSavingsRequest(requestId, status, comments);
      
      addNotification({
        type: status === 'APPROVED' ? 'success' : 'warning',
        title: `Request ${status.toLowerCase()}`,
        message: `The savings update request has been ${status.toLowerCase()}`
      });
      
      closeReviewModal();
      fetchRequests();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = `${request.first_name} ${request.last_name} ${request.department}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-700/50';
      case 'APPROVED':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50';
      case 'REJECTED':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-700/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <Check className="w-4 h-4" />;
      case 'REJECTED':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading savings requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Savings Adjustments</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Employee Contribution Requests</p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rejected</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <X className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white uppercase tracking-tight">Recent Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 uppercase tracking-wider text-sm font-semibold">
                  {searchTerm || filterStatus !== 'all' ? 'No requests found matching your criteria' : 'No requests found'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Employee Avatar */}
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-800">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      
                      {/* Employee Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{request.first_name} {request.last_name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{request.department}</p>
                      </div>
                    </div>

                    {/* Adjustment Info */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Adjustment</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-400">{request.old_percentage}%</span>
                          <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                            <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{request.new_percentage}%</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Date</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all hover:scale-105"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'PENDING' && (
                          <>
                            <button
                                onClick={() => openReviewModal(request.id, 'APPROVED')}
                                disabled={processingId === request.id}
                                className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all hover:scale-105 disabled:opacity-50"
                                title="Approve"
                              >
                                {processingId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openReviewModal(request.id, 'REJECTED')}
                                disabled={processingId === request.id}
                                className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all hover:scale-105 disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Reason Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Reason</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{request.reason || 'No reason provided'}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Request Intelligence</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto">
              <div className="flex items-center space-x-6">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{selectedRequest.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-2">Original Rate</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{selectedRequest.old_percentage}%</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Target Rate</p>
                  <p className="text-3xl font-black text-emerald-600">{selectedRequest.new_percentage}%</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em]">Employee Rationale</p>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                    "{selectedRequest.reason || 'No specific rationale provided by the employee for this adjustment.'}"
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                <div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">Submission Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Current Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>
            
            {selectedRequest.status === 'PENDING' && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openReviewModal(selectedRequest.id, 'REJECTED');
                  }}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shadow-sm"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openReviewModal(selectedRequest.id, 'APPROVED');
                  }}
                  className="flex-1 px-6 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                >
                  Approve Adjustment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 bg-gradient-to-r ${reviewAction === 'APPROVED' ? 'from-emerald-600 to-teal-600' : 'from-rose-600 to-pink-600'} text-white`}>
              <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                {reviewAction === 'APPROVED' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                {reviewAction === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <p className="text-white/80 text-sm mt-1 uppercase tracking-wider font-semibold">
                Please provide comments for this decision
              </p>
            </div>
            <div className="p-6">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Review Comments
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                rows={4}
                placeholder={`Why is this request being ${reviewAction?.toLowerCase()}?`}
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeReviewModal}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 ${reviewAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsRequests;
