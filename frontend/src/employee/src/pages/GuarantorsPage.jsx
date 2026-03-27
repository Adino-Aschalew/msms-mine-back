import React, { useState, useRef, useEffect } from 'react';
import { FiUsers, FiPlus, FiSearch, FiEdit, FiTrash2, FiHome, FiUser, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { guarantorsAPI } from '../../../shared/services/guarantorsAPI';

const GuarantorsPage = () => {
  const [activeTab, setActiveTab] = useState('internal');
  const [searchTerm, setSearchTerm] = useState('');
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
  const [internalGuarantors, setInternalGuarantors] = useState([]);
  const [externalGuarantors, setExternalGuarantors] = useState([]);
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
      
      const [internalData, externalData] = await Promise.all([
        guarantorsAPI.getGuarantors({ type: 'internal' }),
        guarantorsAPI.getGuarantors({ type: 'external' })
      ]);
      
      setInternalGuarantors(internalData?.data || []);
      setExternalGuarantors(externalData?.data || []);
    } catch (err) {
      console.error('Failed to load guarantors:', err);
      setError('Failed to load guarantors. Please try again.');
    } finally {
      setLoading(false);
    }
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
      
      // Reload data
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
    guarantor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guarantor.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExternalGuarantors = externalGuarantors.filter(g =>
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const tabs = [
    { id: 'internal', label: 'Internal', icon: FiHome, count: internalGuarantors.length },
    { id: 'external', label: 'External', icon: FiUser, count: externalGuarantors.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="w-full mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 btn bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-600 dark:text-white">Guarantors</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total verified guarantors in system</p>
              </div>
            </div>
            <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn btn-primary h-12 px-8 flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Active', value: internalGuarantors.length + externalGuarantors.length, color: 'blue', icon: FiUsers },
            { label: 'Internal Emp', value: internalGuarantors.length, color: 'emerald', icon: FiHome },
            { label: 'External Ref', value: externalGuarantors.length, color: 'orange', icon: FiUser },
          ].map((stat, i) => (
            <div key={i} className="stat-card px-10 py-10">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-gray-600 dark:text-white mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Card */}
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
                placeholder={`Find ${activeTab} guarantor...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">Identity & Contact</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">Employment details</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">Relationship</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">System Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400 text-right">Row Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {(activeTab === 'internal' ? filteredInternalGuarantors : filteredExternalGuarantors).length > 0 ? (
                  (activeTab === 'internal' ? filteredInternalGuarantors : filteredExternalGuarantors).map((guarantor) => (
                    <tr key={guarantor.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200/50 dark:border-blue-800/50">
                            {guarantor.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 dark:text-white">{guarantor.fullName}</div>
                            <div className="text-sm text-gray-600">{guarantor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{guarantor.position || guarantor.jobPosition}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{guarantor.department || guarantor.employer}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-500">{guarantor.relationship}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusColor(guarantor.status)}`}>
                          {guarantor.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(guarantor)} className="p-2 text-blue-800 hover:text-blue-600 transition-colors"><FiEdit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(guarantor.id, guarantor.fullName)} className="p-2 text-red-800 hover:text-red-600 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                      <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest opacity-40">Zero records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest">Register Guarantor</h2>
                <p className="dark:text-white text-xs text-gray-800 mt-1">Step {formStep} of 3 • Process validation required</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><FiX className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {formErrors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">{formErrors.general}</p>
                </div>
              )}

              {formStep === 1 && (
                <div className="grid grid-cols-2 gap-6 py-10">
                  <div onClick={() => handleInputChange('type', 'internal')} className={`p-8 rounded-2xl border-2 cursor-pointer transition-all ${formData.type === 'internal' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}>
                    <FiHome className={`w-10 h-10 mb-4 ${formData.type === 'internal' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-bold tracking-widest text-gray-900 dark:text-white">Internal</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold mt-1 tracking-widest">Company Employee</p>
                  </div>
                  <div onClick={() => handleInputChange('type', 'external')} className={`p-8 rounded-2xl border-2 cursor-pointer transition-all ${formData.type === 'external' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}>
                    <FiUser className={`w-10 h-10 mb-4 ${formData.type === 'external' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-bold tracking-widest text-gray-900 dark:text-white">External</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold mt-1 tracking-widest">Private Individual</p>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.type === 'internal' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold uppercase text-black dark:text-gray-400 tracking-widest">Employee ID</label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={e => handleInputChange('employeeId', e.target.value)}
                          placeholder="e.g. EMP001"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/5 text-[20px] outline-none text-sm dark:text-white ${formErrors.employeeId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {formErrors.employeeId && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-1">{formErrors.employeeId}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold uppercase text-black dark:text-gray-400 tracking-widest">Relationship</label>
                        <input
                          type="text"
                          value={formData.relationship}
                          onChange={e => handleInputChange('relationship', e.target.value)}
                          placeholder="e.g. Colleague, Friend"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/5 text-[20px] outline-none text-sm dark:text-white ${formErrors.relationship ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                        {formErrors.relationship && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-1">{formErrors.relationship}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full space-y-8">
                      {/* Section: Personal Identity */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                          <FiUser className="w-4 h-4 text-blue-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Personal Identity</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Full Legal Name</label>
                            <input type="text" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.fullName}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Nationality</label>
                            <input type="text" value={formData.nationality} onChange={e => handleInputChange('nationality', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.nationality ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.nationality && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.nationality}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Relationship</label>
                            <input type="text" value={formData.relationship} onChange={e => handleInputChange('relationship', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.relationship ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.relationship && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.relationship}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Section: Contact Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                          <FiUsers className="w-4 h-4 text-blue-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Channels</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-1 md:col-span-1">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Email Address</label>
                            <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.email}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Personal Phone</label>
                            <input type="text" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.phoneNumber && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.phoneNumber}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Work Phone</label>
                            <input type="text" value={formData.workPhone} onChange={e => handleInputChange('workPhone', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Section: Residence Location */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                          <FiHome className="w-4 h-4 text-blue-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Residential Data</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">City</label>
                            <input type="text" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.city}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Kebele</label>
                            <input type="text" value={formData.kebele} onChange={e => handleInputChange('kebele', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white" />
                          </div>
                          <div className="space-y-2 col-span-full">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Home Address / Street</label>
                            <textarea rows="2" value={formData.homeAddress} onChange={e => handleInputChange('homeAddress', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white resize-none" />
                          </div>
                        </div>
                      </div>

                      {/* Section: Employment */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                          <FiFile className="w-4 h-4 text-blue-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Employment & ID Proof</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Employer</label>
                            <input type="text" value={formData.employer} onChange={e => handleInputChange('employer', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.employer ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.employer && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.employer}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Job Position</label>
                            <input type="text" value={formData.jobPosition} onChange={e => handleInputChange('jobPosition', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Monthly Salary</label>
                            <input type="number" value={formData.monthlySalary} onChange={e => handleInputChange('monthlySalary', e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none text-sm dark:text-white ${formErrors.monthlySalary ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                            {formErrors.monthlySalary && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{formErrors.monthlySalary}</p>}
                          </div>
                          <div className="col-span-full pt-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest block mb-2">Upload ID Document (National ID/Passport)</label>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileChange} 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {!formData.idDocument ? (
                              <div 
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-900/50 group ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'} ${formErrors.idDocument ? 'border-red-500 bg-red-50/5' : ''}`}
                              >
                                <FiFile className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-600 animate-bounce' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                <p className={`text-xs font-bold ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}>
                                  {isDragging ? 'Drop it here!' : 'Click to upload or drag & drop'}
                                </p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-tighter mt-1">PDF, JPG up to 10MB</p>
                                {formErrors.idDocument && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-tighter">{formErrors.idDocument}</p>}
                              </div>
                            ) : (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <FiCheck className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{formData.idDocument.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">{(formData.idDocument.size / 1024 / 1024).toFixed(2)} MB • Ready for sync</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={removeFile}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                >
                                  <FiX className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center py-8 bg-green-300/10 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800">
                    <FiCheck className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Identity Verified</h3>
                    <p className="text-xs text-gray-500 mt-1">Please confirm the automated data retrieval is correct.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal Name</p>
                      <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">{formData.fullName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.type === 'internal' ? 'Employee Index' : 'Identity Reference'}</p>
                      <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">{formData.type === 'internal' ? formData.employeeId : formData.email || formData.phoneNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization Unit</p>
                      <p className="text-md font-bold text-gray-700 dark:text-gray-300">{formData.department || formData.employer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relationship Status</p>
                      <p className="text-md font-bold text-gray-700 dark:text-gray-300">{formData.relationship}</p>
                    </div>

                    {formData.type === 'external' && (
                      <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nationality</p>
                          <p className="text-sm font-bold dark:text-white">{formData.nationality}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                          <p className="text-sm font-bold dark:text-white">{formData.city}, {formData.kebele}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monthly Salary</p>
                          <p className="text-sm font-bold text-emerald-600">${Number(formData.monthlySalary).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Work Contact</p>
                          <p className="text-sm font-bold dark:text-white">{formData.workPhone || 'N/A'}</p>
                        </div>
                        {formData.idDocument && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">ID Attachment</p>
                            <p className="text-sm font-bold dark:text-white flex items-center gap-1">
                              <FiCheck className="text-emerald-500" /> {formData.idDocument.name.slice(0, 15)}...
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.type === 'internal' && (
                      <div className="col-span-1 md:col-span-2 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Authenticated: {formData.position}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center text-gray-500">
              <button
                onClick={() => formStep > 1 ? setFormStep(formStep - 1) : setShowAddForm(false)}
                className="px-6 py-2.5 text-sm font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {formStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={() => formStep < 3 ? handleNextStep() : handleSubmit()}
                disabled={isSubmitting}
                className="btn btn-primary px-10 h-11 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    {formStep === 2 && formData.type === 'internal' ? 'Confirm & Fetch Data' :
                      formStep === 3 ? (isApproved ? 'Finalize' : 'Confirm Information') :
                        'Continue'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation and success messages would go here */}
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

      {/* Error Modal */}
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
