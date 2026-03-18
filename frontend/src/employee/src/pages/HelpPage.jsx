import React, { useState } from 'react';
import { FiSearch, FiHelpCircle, FiBook, FiMail, FiPhone, FiChevronDown, FiChevronRight, FiExternalLink, FiMessageSquare, FiUsers, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('loans');

  const faqCategories = [
    {
      id: 'loans',
      title: 'Loans & Applications',
      icon: FiBook,
      description: 'Everything about loan applications, eligibility, and approval process',
      color: 'blue',
      questions: [
        {
          q: 'How do I apply for a loan?',
          a: 'Navigate to the "Loans" section and click "Request New Loan". Complete the multi-step form with your loan details, guarantor information, and supporting documents. Submit for approval.'
        },
        {
          q: 'What are the loan eligibility requirements?',
          a: 'You must have been employed for at least 6 months, have sufficient savings balance (minimum 20% of requested amount), and meet salary requirements (monthly installment ≤ 40% of salary).'
        },
        {
          q: 'What types of loans are available?',
          a: 'We offer Emergency Loans (up to $5,000), Personal Loans (up to $10,000), Education Loans (up to $15,000), and Medical Loans (up to $8,000). Each has different APR rates and terms.'
        },
        {
          q: 'How long does the loan approval process take?',
          a: 'Loan applications are typically reviewed within 2-3 business days. You\'ll receive email notifications at each step. Approved loans are disbursed within 1 business day.'
        },
        {
          q: 'What documents do I need for loan application?',
          a: 'Basic information is sufficient for initial application. For external guarantors, ID documents and employment proof are required before final approval.'
        },
      ]
    },
    {
      id: 'savings',
      title: 'Savings & Contributions',
      icon: FiShield,
      description: 'Manage your savings rate, track contributions, and handle withdrawals',
      color: 'green',
      questions: [
        {
          q: 'How do I change my savings rate?',
          a: 'Go to the "Savings" section and use the slider to adjust your contribution rate between 15% and 65% of your monthly salary. Changes apply in the next payroll cycle.'
        },
        {
          q: 'When are savings contributions deducted?',
          a: 'Savings are automatically deducted from your monthly payroll on the last business day of each month, along with any loan repayments.'
        },
        {
          q: 'How do I withdraw my savings?',
          a: 'You can request a full withdrawal in the "Savings" section. Submit your reason, optional supporting documents, and confirm. Requests require admin approval and take 3-5 business days to process.'
        },
        {
          q: 'Can I make partial withdrawals?',
          a: 'No, only full balance withdrawals are allowed. This policy ensures you maintain emergency savings. Partial withdrawals are not permitted.'
        },
        {
          q: 'What interest rate do my savings earn?',
          a: 'Your savings earn 2.5% annual interest, compounded monthly. Interest is calculated on your average daily balance.'
        },
      ]
    },
    {
      id: 'repayments',
      title: 'Repayments & Payments',
      icon: FiClock,
      description: 'Track your loan repayments, payment schedules, and financial history',
      color: 'purple',
      questions: [
        {
          q: 'How are loan repayments processed?',
          a: 'All loan repayments are automatically deducted from your monthly payroll. You can view your payment schedule and history in the "Repayments" section.'
        },
        {
          q: 'Can I make extra payments on my loan?',
          a: 'Currently, all repayments are processed through automatic payroll deductions. Extra payments are not supported at this time. Contact HR if you need to discuss payment arrangements.'
        },
        {
          q: 'How can I check my loan repayment progress?',
          a: 'Visit the "Repayments" section to view your loan details, payment schedule, remaining balance, and repayment history with detailed transaction records.'
        },
        {
          q: 'What happens if I miss a payroll deduction?',
          a: 'If a payroll deduction fails, you\'ll receive a notification. Contact HR immediately to arrange alternative payment. Continued missed payments may affect your eligibility for future loans.'
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: FiUsers,
      description: 'Manage your profile, security settings, and account preferences',
      color: 'orange',
      questions: [
        {
          q: 'How do I update my personal information?',
          a: 'Go to "Profile" and click "Edit Profile". Update your information including contact details, address, and emergency contact. Changes are saved automatically.'
        },
        {
          q: 'How do I change my password?',
          a: 'In your Profile page, go to the "Security" tab and click "Change Password". Enter your current password and choose a new secure password following the requirements shown.'
        },
        {
          q: 'How do I enable two-factor authentication?',
          a: 'Two-factor authentication can be enabled in the "Security" tab of your Profile. This adds an extra layer of security to your account login.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'On the login page, click "Forgot Password" and enter your email address. You\'ll receive instructions to reset your password securely.'
        },
        {
          q: 'How do I update my notification preferences?',
          a: 'Notification settings can be managed in the "Notifications" tab of your Profile. Choose your preferences for email and system notifications.'
        },
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Chat with our support team',
      icon: FiMessageSquare,
      action: '#',
      color: 'blue',
      available: true
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: FiMail,
      action: 'mailto:support@company.com',
      color: 'green',
      available: true
    },
    {
      title: 'Phone Support',
      description: 'Call our help desk',
      icon: FiPhone,
      action: 'tel:+1234567890',
      color: 'purple',
      available: true
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step guides',
      icon: FiBook,
      action: '#',
      color: 'orange',
      available: false
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="dark:bg-gray-600 btn bg-gray-100 text-white flex-cols justify-center items-center w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <FiHelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4 dark:text-white" />
              <h1 className="text-black dark:text-white text-4xl font-bold mb-4">Help & Support Center</h1>
              <p className="dark:text-gray-100 text-xl text-gray-700 mb-8">
                Find answers, get support, and make the most of your employee benefits
              </p>
            </div>

            {/* Enhanced Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg border border-gray-600 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Search across {faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0)} articles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Get Help Fast</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose how you'd like to connect with our support team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={() => action.available && window.open(action.action, action.action.startsWith('mailto') || action.action.startsWith('tel') ? '_self' : '_blank')}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer group ${!action.available ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 bg-${action.color}-100 dark:bg-${action.color}-900/50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${!action.available ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}>
                      <Icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400 ${!action.available ? 'text-gray-400' : ''
                        }`} />
                    </div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 ${!action.available ? 'text-gray-500' : ''
                      }`}>
                      {action.title}
                    </h3>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${!action.available ? 'text-gray-400' : ''
                      }`}>
                      {action.description}
                    </p>
                    {action.available ? (
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span>Connect Now</span>
                        <FiExternalLink className="w-4 h-4 ml-1" />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400">Browse our comprehensive knowledge base</p>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <FiSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any articles matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;

                return (
                  <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-${category.color}-100 dark:bg-${category.color}-900/50 rounded-lg`}>
                          <Icon className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                          {category.questions.length} articles
                        </span>
                        {isExpanded ? (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4">
                        {category.questions.map((item, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-lg">
                              {item.q}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default HelpPage;
