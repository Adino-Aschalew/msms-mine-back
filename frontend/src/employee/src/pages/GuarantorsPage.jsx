import React, { useState, useRef, useEffect } from 'react';
import { FiUsers, FiSearch, FiTrash2, FiHome, FiCheck, FiAlertCircle, FiFilter, FiDownload, FiEye, FiShield } from 'react-icons/fi';
import { guarantorsAPI } from '../../../shared/services/guarantorsAPI';

const GuarantorsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');



  const [deleteModal, setDeleteModal] = useState({ isOpen: false, guarantorId: null, guarantorName: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [internalGuarantors, setInternalGuarantors] = useState([]);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);



  useEffect(() => {
    loadGuarantors();
  }, []);

  const loadGuarantors = async () => {
    try {
      const response = await guarantorsAPI.getGuarantors();
      setInternalGuarantors(response?.data || []);
    } catch (err) {
      console.error('Failed to load guarantors:', err);
    }
  };



  const handleSearch = async () => {
    try {
      const results = await guarantorsAPI.getGuarantors({ type: 'internal', search: searchTerm });
      setInternalGuarantors(results?.data || []);
    } catch (err) {
      console.error('Failed to search guarantors:', err);
    }
  };

  const handleDelete = async (guarantorId, guarantorName) => {
    try {
      await guarantorsAPI.deleteGuarantor(guarantorId);
      setDeleteModal({ isOpen: false, guarantorId: null, guarantorName: '' });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      await loadGuarantors();
    } catch (err) {
      console.error('Failed to delete guarantor:', err);
    }
  };





  const confirmDelete = () => {
    setInternalGuarantors(prev => prev.filter(g => g.id !== deleteModal.guarantorId));
    setDeleteModal({ isOpen: false, guarantorId: null, guarantorName: '' });
  };

  const filteredInternalGuarantors = internalGuarantors.filter(guarantor =>
    guarantor.guarantor_type === 'INTERNAL' && (
      (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guarantor.guarantor_id && guarantor.guarantor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );



  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const tabs = [
    { id: 'internal', label: 'Internal Employee', icon: FiHome, count: internalGuarantors.length },
  ];

  const exportGuarantors = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Email', 'Phone', 'Relationship', 'Status', 'Created Date'],
      ...internalGuarantors.map(g => [
        g.id,
        g.guarantor_name || 'N/A',
        'INTERNAL',
        g.contact_email || 'N/A',
        g.contact_phone || 'N/A',
        g.relationship || 'N/A',
        g.is_approved === true ? 'Approved' : g.is_approved === false ? 'Rejected' : 'Pending',
        new Date(g.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guarantors_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      { }
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="w-full mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 btn bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Guarantors</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">All guarantors registered in the system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">

              <button onClick={() => exportGuarantors()} className="btn btn-secondary h-12 px-6 flex items-center gap-2">
                <FiDownload className="w-5 h-5" />
                <span>Export</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8">
        { }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Internal Guarantors', value: internalGuarantors.length, color: 'emerald', icon: FiHome },
            { label: 'Pending Approval', value: internalGuarantors.filter(g => g.is_approved === null).length, color: 'yellow', icon: FiAlertCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>



        { }
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-700/50 flex flex-col lg:flex-row gap-6 justify-between lg:items-center bg-gray-50/30 dark:bg-gray-800/20">
            <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="relative max-w-sm w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Find all guarantor...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Identity & Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employment details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relationship</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">System Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Row Controls</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {internalGuarantors
                  .filter(guarantor =>
                    !searchTerm ||
                    (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (guarantor.guarantor_id && guarantor.guarantor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length > 0 ? (
                  internalGuarantors
                    .filter(guarantor =>
                      !searchTerm ||
                      (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (guarantor.guarantor_id && guarantor.guarantor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((guarantor) => (
                      <tr key={guarantor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-300 font-medium">
                                  {guarantor.guarantor_name ? guarantor.guarantor_name.charAt(0).toUpperCase() : 'G'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {guarantor.guarantor_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {guarantor.contact_email || 'No email'}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {guarantor.contact_phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {guarantor.guarantor_type === 'INTERNAL' ? 'Internal Employee' : 'External Individual'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {guarantor.guarantor_id || 'N/A'}
                          </div>
                          {guarantor.monthly_income && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Income: {guarantor.monthly_income.toLocaleString()} ETB
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {guarantor.applicant_first_name || 'Unknown'} {guarantor.applicant_last_name || ''}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {guarantor.applicant_username || 'N/A'}
                          </div>
                          {guarantor.requested_amount && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Loan: {guarantor.requested_amount.toLocaleString()} ETB
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {guarantor.relationship || 'Not specified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${guarantor.is_approved === true
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : guarantor.is_approved === false
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {guarantor.is_approved === true ? 'Approved' : guarantor.is_approved === false ? 'Rejected' : 'Pending'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(guarantor.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => { setSelectedGuarantor(guarantor); setShowDetailsModal(true); }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(guarantor.id, guarantor.guarantor_name || guarantor.guarantor_id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FiUsers className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No guarantors found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      { }


      { }
      {showSuccessMessage && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in translate-y-2 duration-300">
          <FiCheck className="w-6 h-6" />
          <p className="font-bold">Record synchronized successfully</p>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Remove Record?</h3>
            <p className="text-sm text-gray-400 mt-2">Are you sure you want to remove {deleteModal.guarantorName}? This action is permanent.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 font-bold">Cancel</button>
              <button onClick={confirmDelete} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-500/20">Delete</button>
            </div>
          </div>
        </div>
      )}

      { }
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-3xl border border-red-100 dark:border-red-900/20">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg">
              <FiAlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-3">Identification Error</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">{errorModal.message}</p>
            <button
              onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
              className="w-full mt-10 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20"
            >
              Verify & Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuarantorsPage;
