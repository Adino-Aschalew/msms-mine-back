import React, { useState, useRef, useEffect } from 'react';
import { FiUsers, FiPlus, FiSearch, FiEdit, FiTrash2, FiHome, FiUser, FiFile, FiX, FiCheck, FiAlertCircle, FiFilter, FiDownload, FiEye, FiShield, FiChevronDown,FiCalendar, FiDollarSign } from 'react-icons/fi';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { guarantorsAPI } from '../../../shared/services/guarantorsAPI';

const GuarantorsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, guarantorId: null, guarantorName: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allGuarantors, setAllGuarantors] = useState([]);
  const [internalGuarantors, setInternalGuarantors] = useState([]);
  const [externalGuarantors, setExternalGuarantors] = useState([]);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorModal({ isOpen: true, message: 'File is too large. Maximum size is 10MB.' });
        return;
      }
      setFormData(prev => ({ ...prev, idDocument: file }));
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, idDocument: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    loadGuarantors();
  }, []);

  const loadGuarantors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await guarantorsAPI.getGuarantors();
      const allGuarantorsData = response?.data || [];
      
      
      const internal = allGuarantorsData.filter(g => g.guarantor_type === 'INTERNAL');
      const external = allGuarantorsData.filter(g => g.guarantor_type === 'EXTERNAL');
      
      setAllGuarantors(allGuarantorsData);
      setInternalGuarantors(internal);
      setExternalGuarantors(external);
    } catch (err) {
      console.error('Failed to load guarantors:', err);
      setError('Failed to load guarantors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGuarantors = () => {
    let guarantors = activeTab === 'all' ? allGuarantors : 
                   activeTab === 'internal' ? internalGuarantors : 
                   externalGuarantors;

    
    if (statusFilter !== 'all') {
      guarantors = guarantors.filter(g => {
        if (statusFilter === 'approved') return g.is_approved === true;
        if (statusFilter === 'pending') return g.is_approved === null;
        if (statusFilter === 'rejected') return g.is_approved === false;
        return true;
      });
    }

    
    if (searchTerm) {
      guarantors = guarantors.filter(guarantor =>
        (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guarantor.guarantor_id && guarantor.guarantor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guarantor.applicant_first_name && guarantor.applicant_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guarantor.applicant_last_name && guarantor.applicant_last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return guarantors;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.all([
        guarantorsAPI.getGuarantors({ type: 'internal', search: searchTerm }),
        guarantorsAPI.getGuarantors({ type: 'external', search: searchTerm })
      ]);
      
      setInternalGuarantors(results[0]?.data || []);
      setExternalGuarantors(results[1]?.data || []);
    } catch (err) {
      console.error('Failed to search guarantors:', err);
      setError('Failed to search guarantors. Please try again.');
    } finally {
      setLoading(false);
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
      setError('Failed to delete guarantor. Please try again.');
    }
  };

  const [formData, setFormData] = useState({
    type: 'internal',
    employeeId: '',
    fullName: '',
    email: '',
    department: '',
    position: '',
    phoneNumber: '',
    relationship: '',
    status: 'active',
    addedDate: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNextStep = async () => {
    if (validateStep(formStep)) {
      if (formStep === 2 && formData.type === 'internal') {
        setIsSubmitting(true);
        try {
          const res = await employeeAPI.validateEmployee(formData.employeeId);
          if (res && res.success && res.data) {
            const employee = res.data;
            setFormData(prev => ({
              ...prev,
              fullName: `${employee.first_name} ${employee.last_name}`,
              email: employee.email,
              department: employee.department,
              position: employee.job_grade || employee.job_title || employee.department
            }));
            setFormStep(3);
            setFormErrors({});
          } else {
             throw new Error('Employee not found');
          }
        } catch (err) {
          setErrorModal({
            isOpen: true,
            message: `Identification system failed: No employee record found matching ID "${formData.employeeId}". Please verify the ID and try again.`
          });
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setFormStep(formStep + 1);
        setFormErrors({});
      }
    }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 2) {
      if (formData.type === 'internal') {
        if (!formData.employeeId) errors.employeeId = 'Employee ID is required';
        if (!formData.relationship) errors.relationship = 'Relationship is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9+]{10,15}$/;

        if (!formData.fullName) errors.fullName = 'Full name is required';
        if (!formData.email) {
          errors.email = 'Email required';
        } else if (!emailRegex.test(formData.email)) {
          errors.email = 'Invalid email format';
        }
        
        if (!formData.phoneNumber) {
          errors.phoneNumber = 'Phone required';
        } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
          errors.phoneNumber = 'Invalid phone format';
        }

        if (!formData.employer) errors.employer = 'Employer required';
        if (!formData.monthlySalary) errors.monthlySalary = 'Salary required';
        if (!formData.city) errors.city = 'City required';
        if (!formData.nationality) errors.nationality = 'Nationality required';
        if (!formData.relationship) errors.relationship = 'Relationship required';
        if (!formData.idDocument) errors.idDocument = 'ID document is required';
      }

      if (Object.keys(errors).length > 0) {
        errors.general = 'Please correct the errors and fill all required information to continue.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      type: 'internal',
      employeeId: '',
      fullName: '',
      email: '',
      department: '',
      position: '',
      phoneNumber: '',
      workPhone: '',
      relationship: '',
      employer: '',
      jobPosition: '',
      monthlySalary: '',
      workAddress: '',
      homeAddress: '',
      city: '',
      kebele: '',
      nationality: 'Ethiopian',
      idDocument: null,
      employmentProof: null,
    });
    setFormStep(1);
    setFormErrors({});
    setIsApproved(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isApproved && formStep === 3) {
      setIsApproved(true);
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newGuarantor = {
      id: editingGuarantor ? editingGuarantor.id : Date.now(),
      ...formData,
      status: 'active',
      addedDate: new Date().toISOString().split('T')[0],
      loansGuaranteed: editingGuarantor ? editingGuarantor.loansGuaranteed : 0,
    };

    if (editingGuarantor) {
      if (formData.type === 'internal') {
        setInternalGuarantors(prev => prev.map(g => g.id === editingGuarantor.id ? newGuarantor : g));
      } else {
        setExternalGuarantors(prev => prev.map(g => g.id === editingGuarantor.id ? newGuarantor : g));
      }
    } else {
      if (formData.type === 'internal') {
        setInternalGuarantors(prev => [...prev, newGuarantor]);
      } else {
        setExternalGuarantors(prev => [...prev, newGuarantor]);
      }
    }

    setIsSubmitting(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowAddForm(false);
      setEditingGuarantor(null);
      resetForm();
    }, 1500);
  };

  const handleEdit = (guarantor) => {
    setEditingGuarantor(guarantor);
    setFormData({ ...guarantor, type: guarantor.employeeId ? 'internal' : 'external' });
    setFormStep(1);
    setShowAddForm(true);
  };

  const confirmDelete = () => {
    setInternalGuarantors(prev => prev.filter(g => g.id !== deleteModal.guarantorId));
    setExternalGuarantors(prev => prev.filter(g => g.id !== deleteModal.guarantorId));
    setDeleteModal({ isOpen: false, guarantorId: null, guarantorName: '' });
  };

  const filteredInternalGuarantors = internalGuarantors.filter(guarantor =>
  guarantor.guarantor_type === 'INTERNAL' && (
    (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (guarantor.guarantor_id && guarantor.guarantor_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
);

const filteredExternalGuarantors = externalGuarantors.filter(guarantor =>
  guarantor.guarantor_type === 'EXTERNAL' && (
    (guarantor.guarantor_name && guarantor.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (guarantor.contact_email && guarantor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
);

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const tabs = [
    { id: 'all', label: 'All', icon: FiUsers, count: allGuarantors.length },
    { id: 'internal', label: 'Internal', icon: FiHome, count: internalGuarantors.length },
    { id: 'external', label: 'External', icon: FiUser, count: externalGuarantors.length },
  ];

  const exportGuarantors = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Email', 'Phone', 'Relationship', 'Status', 'Created Date'],
      ...allGuarantors.map(g => [
        g.id,
        g.guarantor_name || 'N/A',
        g.guarantor_type,
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
      {}
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
              <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary h-12 px-6 flex items-center gap-2">
                <FiFilter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <button onClick={() => exportGuarantors()} className="btn btn-secondary h-12 px-6 flex items-center gap-2">
                <FiDownload className="w-5 h-5" />
                <span>Export</span>
              </button>
              <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn btn-primary h-12 px-8 flex items-center gap-2">
                <FiPlus className="w-5 h-5" />
                <span>Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Guarantors', value: allGuarantors.length, color: 'purple', icon: FiUsers },
            { label: 'Internal', value: internalGuarantors.length, color: 'emerald', icon: FiHome },
            { label: 'External', value: externalGuarantors.length, color: 'orange', icon: FiUser },
            { label: 'Pending Approval', value: allGuarantors.filter(g => g.is_approved === null).length, color: 'yellow', icon: FiAlertCircle },
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

        {}
        {showFilters && (
          <div className="card mb-6 p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 tracking-widest">Status Filter</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-sm dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 tracking-widest">Date Range</label>
                <input 
                  type="date" 
                  className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-sm dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 tracking-widest">Guarantor Type</label>
                <select 
                  value={activeTab} 
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-sm dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {}
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
                {getFilteredGuarantors().length > 0 ? (
                  getFilteredGuarantors().map((guarantor) => (
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
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guarantor.is_approved === true 
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
                            onClick={() => handleEdit(guarantor)} 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
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

      {}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Guarantor</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Step {formStep} of 3</p>
                </div>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      formStep >= step 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {formStep > step ? <FiCheck className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 rounded-full ${
                        formStep > step ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Type</span>
                <span>Details</span>
                <span>Review</span>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-6">
              {}
              {formErrors.general && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{formErrors.general}</p>
                </div>
              )}

              {}
              {formStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select the type of guarantor you want to add:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleInputChange('type', 'internal')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.type === 'internal'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                        <FiHome className={`w-6 h-6 ${formData.type === 'internal' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Internal Employee</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Company employee who works within the organization</p>
                    </button>
                    <button
                      onClick={() => handleInputChange('type', 'external')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.type === 'external'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                        <FiUser className={`w-6 h-6 ${formData.type === 'external' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">External Individual</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Private individual outside the organization</p>
                    </button>
                  </div>
                </div>
              )}

              {}
              {formStep === 2 && (
                <div className="space-y-6">
                  {formData.type === 'internal' ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          <FiUsers className="w-4 h-4" />
                          Enter the employee ID to automatically fetch their details from the system.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID *</label>
                          <input
                            type="text"
                            value={formData.employeeId}
                            onChange={e => handleInputChange('employeeId', e.target.value)}
                            placeholder="e.g. EMP001"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {formErrors.employeeId && <p className="mt-1 text-sm text-red-600">{formErrors.employeeId}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship *</label>
                          <select
                            value={formData.relationship}
                            onChange={e => handleInputChange('relationship', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.relationship ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Select relationship</option>
                            <option value="Colleague">Colleague</option>
                            <option value="Friend">Friend</option>
                            <option value="Family">Family</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Other">Other</option>
                          </select>
                          {formErrors.relationship && <p className="mt-1 text-sm text-red-600">{formErrors.relationship}</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-purple-600" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={formData.fullName}
                              onChange={e => handleInputChange('fullName', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.fullName && <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
                            <input
                              type="text"
                              value={formData.nationality}
                              onChange={e => handleInputChange('nationality', e.target.value)}
                              placeholder="e.g. Ethiopian"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship *</label>
                            <select
                              value={formData.relationship}
                              onChange={e => handleInputChange('relationship', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.relationship ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select relationship</option>
                              <option value="Friend">Friend</option>
                              <option value="Family">Family</option>
                              <option value="Colleague">Colleague</option>
                              <option value="Neighbor">Neighbor</option>
                              <option value="Other">Other</option>
                            </select>
                            {formErrors.relationship && <p className="mt-1 text-sm text-red-600">{formErrors.relationship}</p>}
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-purple-600" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={e => handleInputChange('email', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                            <input
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={e => handleInputChange('phoneNumber', e.target.value)}
                              placeholder="+251 91 234 5678"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Phone</label>
                            <input
                              type="tel"
                              value={formData.workPhone}
                              onChange={e => handleInputChange('workPhone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiHome className="w-4 h-4 text-purple-600" />
                          Address
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={e => handleInputChange('city', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kebele</label>
                            <input
                              type="text"
                              value={formData.kebele}
                              onChange={e => handleInputChange('kebele', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Address</label>
                            <textarea
                              rows="2"
                              value={formData.homeAddress}
                              onChange={e => handleInputChange('homeAddress', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiFile className="w-4 h-4 text-purple-600" />
                          Employment Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employer *</label>
                            <input
                              type="text"
                              value={formData.employer}
                              onChange={e => handleInputChange('employer', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.employer ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.employer && <p className="mt-1 text-sm text-red-600">{formErrors.employer}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Position</label>
                            <input
                              type="text"
                              value={formData.jobPosition}
                              onChange={e => handleInputChange('jobPosition', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Salary *</label>
                            <input
                              type="number"
                              value={formData.monthlySalary}
                              onChange={e => handleInputChange('monthlySalary', e.target.value)}
                              placeholder="Amount in ETB"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.monthlySalary ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.monthlySalary && <p className="mt-1 text-sm text-red-600">{formErrors.monthlySalary}</p>}
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiFile className="w-4 h-4 text-purple-600" />
                          ID Document
                        </h4>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {!formData.idDocument ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                              isDragging
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                            } ${formErrors.idDocument ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
                          >
                            <FiFile className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                            {formErrors.idDocument && <p className="mt-2 text-sm text-red-600">{formErrors.idDocument}</p>}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <FiCheck className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                  {formData.idDocument.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(formData.idDocument.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={removeFile}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {}
              {formStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-green-800 dark:text-green-200">Review Information</h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Please verify the information below is correct before submitting.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white">Guarantor Details</h4>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Full Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.fullName || formData.employeeId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{formData.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{formData.type === 'internal' ? 'Employee ID' : 'Email'}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.type === 'internal' ? formData.employeeId : formData.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Relationship</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.relationship || 'N/A'}</p>
                      </div>
                      {formData.type === 'external' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.phoneNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Location</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.city || 'N/A'}{formData.kebele ? `, ${formData.kebele}` : ''}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Employer</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.employer || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Monthly Salary</p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">{formData.monthlySalary ? `${Number(formData.monthlySalary).toLocaleString()} ETB` : 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {formData.idDocument && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <FiCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">ID Document attached: {formData.idDocument.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <button
                onClick={() => formStep > 1 ? setFormStep(formStep - 1) : setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {formStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={() => formStep < 3 ? handleNextStep() : handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {formStep === 3 ? 'Submit' : 'Continue'}
                    {formStep !== 3 && <FiChevronDown className="w-4 h-4 rotate-[-90deg]" />}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
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

      {}
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
