import { useState, useEffect } from 'react';
import { X, UserPlus, Image as ImageIcon, Briefcase, Mail, DollarSign, User, Edit } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSave, employee = null }) {
  const isEdit = !!employee;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    role: '',
    type: 'Full-time',
    salary: '',
  });

  useEffect(() => {
    if (employee) {
      const [firstName, ...lastNameParts] = employee.name.split(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: employee.email || '',
        department: employee.department || 'Engineering',
        role: employee.role || '',
        type: employee.type || 'Full-time',
        salary: employee.salary || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Engineering',
        role: '',
        type: 'Full-time',
        salary: '',
      });
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newEmployee = {
      ...employee,
      id: employee?.id || `EMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      department: formData.department,
      role: formData.role,
      type: formData.type,
      salary: Number(formData.salary),
      avatar: employee?.avatar || `https://i.pravatar.cc/150?u=${formData.firstName.toLowerCase()}`,
      status: employee?.status || 'Active',
      dateJoined: employee?.dateJoined || new Date().toISOString().split('T')[0],
      performance: employee?.performance || 0,
    };

    onSave(newEmployee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b0e14]/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative glass-card w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <UserPlus size={24} className={isEdit ? 'hidden' : 'block'} />
              <Briefcase size={24} className={isEdit ? 'block' : 'hidden'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {isEdit ? 'Edit Employee Details' : 'Add New Member'}
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {isEdit ? `Update profile information for ${employee.name}` : 'Create a new team member profile in seconds.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-500 hover:text-foreground hover:bg-white/5 rounded-2xl transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden transition-all duration-500 group-hover:border-primary-500/50">
                  {employee?.avatar ? (
                    <img src={employee.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-600 group-hover:text-primary-500 transition-colors" size={32} />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Edit size={14} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-foreground tracking-tight flex items-center gap-2">
                  Profile Picture
                  <span className="text-[10px] uppercase bg-white/5 px-2 py-0.5 rounded-full text-slate-400">Optional</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-bold mt-1 tracking-wide uppercase">JPG, PNG or GIF • Max 2MB</p>
                <div className="flex gap-3 mt-4">
                  <button type="button" className="px-4 py-2 text-xs font-black bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                    Upload New
                  </button>
                  <button type="button" className="px-4 py-2 text-xs font-black text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-primary-500" />
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium placeholder:text-slate-600"
                  placeholder="e.g. Jane"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-primary-500" />
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium placeholder:text-slate-600"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-primary-500" />
                Email Workspace <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium placeholder:text-slate-600"
                placeholder="jane.doe@company.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Department</label>
                <div className="relative">
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Role</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium placeholder:text-slate-600"
                  placeholder="e.g. Senior Developer"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Employment</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Annual Base Salary</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500">
                    <DollarSign size={16} />
                  </div>
                  <input 
                    type="number" 
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-medium placeholder:text-slate-600"
                    placeholder="85000"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-white/[0.02]">
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 text-xs font-black text-slate-400 hover:text-foreground hover:bg-white/5 rounded-2xl transition-all tracking-widest uppercase"
          >
            Discard
          </button>
          <button 
            form="employee-form"
            type="submit" 
            className="px-10 py-4 text-xs font-black bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] tracking-widest uppercase"
          >
            {isEdit ? 'Update Details' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
