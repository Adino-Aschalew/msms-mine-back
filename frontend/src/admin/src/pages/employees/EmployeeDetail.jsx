import React, { useState } from 'react';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  TrendingUp,
  Edit,
  Save,
  X,
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const EmployeeDetail = ({ employeeId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [employee, setEmployee] = useState({
    id: employeeId,
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    salary: 95000,
    savingsBalance: 12500,
    joinDate: '2022-03-15',
    status: 'active',
    manager: 'Jane Doe',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    emergencyContact: 'Mary Smith - +1 (555) 987-6543',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    performance: {
      rating: 4.5,
      lastReview: '2024-01-15',
      goals: ['Complete React certification', 'Mentor junior developers']
    },
    payrollHistory: [
      { date: '2024-03-15', contribution: 950, balance: 12500, type: 'monthly' },
      { date: '2024-02-15', contribution: 950, balance: 11550, type: 'monthly' },
      { date: '2024-01-15', contribution: 950, balance: 10600, type: 'monthly' },
      { date: '2023-12-15', contribution: 950, balance: 9650, type: 'bonus' }
    ],
    benefits: {
      healthInsurance: 'Premium',
      dentalInsurance: 'Standard',
      retirement401k: '6% match',
      ptoDays: 25,
      ptoUsed: 8
    }
  });

  const [formData, setFormData] = useState({ ...employee });

  const handleSave = () => {
    setEmployee({ ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...employee });
    setIsEditing(false);
  };

  const statusColor = employee.status === 'active' ? 'text-green-600' : 'text-red-600';
  const statusBg = employee.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {employee.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {employee.position}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'payroll', 'benefits', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">{employee.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">{employee.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">{employee.location}</span>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employment Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{employee.department}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                  <p className="text-gray-900 dark:text-white">{employee.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Annual Salary</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">${employee.salary.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Current Savings</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${employee.savingsBalance.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Monthly Contribution</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${(employee.salary * 0.01).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">YTD Contributions</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ${(employee.salary * 0.01 * 3).toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payroll History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employee.payrollHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.date}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.type === 'bonus' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      ${record.contribution.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      ${record.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insurance & Retirement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Health Insurance</span>
                <span className="font-medium text-gray-900 dark:text-white">{employee.benefits.healthInsurance}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Dental Insurance</span>
                <span className="font-medium text-gray-900 dark:text-white">{employee.benefits.dentalInsurance}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">401(k) Match</span>
                <span className="font-medium text-gray-900 dark:text-white">{employee.benefits.retirement401k}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Off</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300">PTO Balance</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {employee.benefits.ptoDays - employee.benefits.ptoUsed} / {employee.benefits.ptoDays} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${((employee.benefits.ptoDays - employee.benefits.ptoUsed) / employee.benefits.ptoDays) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">Performance Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 dark:text-white">{employee.performance.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(employee.performance.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Last Review</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{employee.performance.lastReview}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Goals</h3>
              <div className="space-y-2">
                {employee.performance.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
