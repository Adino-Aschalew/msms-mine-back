import React, { useState } from 'react';
import { Search, BookOpen, MessageCircle, Mail, Phone, ExternalLink, FileText, Video, Download, HelpCircle, ChevronRight, Users, Clock, CheckCircle, AlertCircle, Star, Settings, Headphones, Zap, Shield, Database, FileQuestion, Send, Globe } from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCategories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'blue' },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'green' },
    { id: 'dashboard', name: 'Dashboard', icon: Star, color: 'yellow' },
    { id: 'transactions', name: 'Transactions', icon: FileText, color: 'purple' },
    { id: 'payroll', name: 'Payroll', icon: Users, color: 'indigo' },
    { id: 'reports', name: 'Reports', icon: Download, color: 'pink' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'gray' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle, color: 'red' }
  ];

  const helpArticles = [
    {
      id: 1,
      title: 'Getting Started with FinanceHub',
      category: 'getting-started',
      description: 'Learn the basics of navigating and using the FinanceHub platform with our comprehensive onboarding guide.',
      type: 'article',
      readTime: '5 min',
      difficulty: 'beginner',
      lastUpdated: '2024-03-10',
      views: 1245,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      title: 'Understanding Your Dashboard',
      category: 'dashboard',
      description: 'Comprehensive guide to dashboard widgets, key metrics, and data visualization.',
      type: 'article',
      readTime: '8 min',
      difficulty: 'beginner',
      lastUpdated: '2024-03-12',
      views: 892,
      rating: 4.9
    },
    {
      id: 3,
      title: 'Managing Transactions',
      category: 'transactions',
      description: 'How to add, categorize, and track financial transactions effectively.',
      type: 'article',
      readTime: '6 min',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-11',
      views: 756,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Payroll Processing Guide',
      category: 'payroll',
      description: 'Complete walkthrough of payroll import, processing, and employee management.',
      type: 'article',
      readTime: '12 min',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-13',
      views: 623,
      rating: 4.6
    },
    {
      id: 5,
      title: 'Generating Financial Reports',
      category: 'reports',
      description: 'How to create and customize various financial reports for business insights.',
      type: 'article',
      readTime: '10 min',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-09',
      views: 534,
      rating: 4.8
    },
    {
      id: 6,
      title: 'Platform Settings Configuration',
      category: 'settings',
      description: 'Configure your account, notifications, and system preferences.',
      type: 'article',
      readTime: '7 min',
      difficulty: 'beginner',
      lastUpdated: '2024-03-08',
      views: 445,
      rating: 4.5
    },
    {
      id: 7,
      title: 'Video Tutorial: Dashboard Overview',
      category: 'dashboard',
      description: 'Video walkthrough of main dashboard features and navigation.',
      type: 'video',
      duration: '15 min',
      difficulty: 'beginner',
      lastUpdated: '2024-03-14',
      views: 2103,
      rating: 4.9,
      featured: true
    },
    {
      id: 8,
      title: 'Troubleshooting Common Issues',
      category: 'troubleshooting',
      description: 'Solutions to frequently encountered problems and error fixes.',
      type: 'guide',
      readTime: '10 min',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-15',
      views: 1567,
      rating: 4.7
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your email to reset your password.',
      category: 'account',
      helpful: 156
    },
    {
      id: 2,
      question: 'Can I export my financial data?',
      answer: 'Yes, you can export your data from the Reports section. Select your desired date range and format (CSV, Excel, or PDF), then click the Export button.',
      category: 'data',
      helpful: 134
    },
    {
      id: 3,
      question: 'How often is data backed up?',
      answer: 'Your data is automatically backed up every 24 hours. You can also create manual backups from the Settings > Data & Backup section.',
      category: 'data',
      helpful: 98
    },
    {
      id: 4,
      question: 'What file formats are supported for payroll import?',
      answer: 'We support CSV and Excel files for payroll import. The file should contain columns for employee ID, name, salary, and tax information.',
      category: 'payroll',
      helpful: 87
    },
    {
      id: 5,
      question: 'How do I contact support?',
      answer: 'You can reach our support team via live chat, email (support@financehub.com), or phone (1-800-FINANCE) during business hours.',
      category: 'support',
      helpful: 234
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryColor = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'green': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300';
      case 'pink': return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300';
      case 'gray': return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
      case 'red': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'article': return FileText;
      case 'video': return Video;
      case 'guide': return BookOpen;
      default: return FileText;
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black dark:from-black dark:to-black w-full">
      {/* Hero Section */}
      <div className="bg-black text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Help & Support Center
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100">
              Get help and support for FinanceHub platform
            </p>
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-200" />
                <input
                  type="text"
                  placeholder="Search for help articles, videos, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-black rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Knowledge Base</p>
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg px-3 py-1 text-sm font-semibold">
                {helpArticles.length} Articles
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Video Tutorials</p>
              <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg px-3 py-1 text-sm font-semibold">
                {helpArticles.filter(a => a.type === 'video').length} Videos
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">FAQs</p>
              <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg px-3 py-1 text-sm font-semibold">
                {faqs.length} Questions
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Team</p>
              <div className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-lg px-3 py-1 text-sm font-semibold">
                24/7 Available
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex flex-wrap gap-3">
              {helpCategories.map(category => {
                const Icon = category.icon;
                const colorClass = getCategoryColor(category.color);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedCategory === category.id
                        ? colorClass
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Help Articles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Help Articles & Tutorials
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredArticles.length} articles
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredArticles.map((article) => {
                    const TypeIcon = getTypeIcon(article.type);
                    const difficultyColor = getDifficultyColor(article.difficulty);
                    
                    return (
                      <div key={article.id} className="group">
                        <div className="p-6 border-l-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${
                              article.type === 'video' ? 'bg-purple-100 dark:bg-purple-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              <TypeIcon className={`h-6 w-6 ${
                                article.type === 'video' ? 'text-purple-600 dark:text-purple-400' :
                                'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {article.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {article.description}
                                  </p>
                                  {article.featured && (
                                    <div className="inline-flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full px-2 py-1 text-xs font-semibold">
                                      <Star className="h-3 w-3" />
                                      Featured
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className={`px-2 py-1 rounded-full ${
                                  difficultyColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  difficultyColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  difficultyColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {article.difficulty}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {article.type === 'video' ? article.duration : article.readTime}
                                </span>
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  {article.rating}
                                </span>
                                <span>{article.views} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Frequently Asked Questions
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {faqs.length} questions
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="py-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </h4>
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            {expandedFaq === faq.id ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          expandedFaq === faq.id ? 'max-h-96' : 'max-h-0'
                        }`}>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                            <CheckCircle className="h-3 w-3" />
                            Yes, this helped
                          </button>
                          <button className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            <AlertCircle className="h-3 w-3" />
                            No, not helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Support
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Live Chat Support
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Chat with our support team
                    </p>
                    <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                      Start Live Chat
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4">
                  <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Email Support
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      support@financehub.com
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Response within 24 hours
                    </p>
                    <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                      Send Email
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Phone Support
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      1-800-FINANCE (346-2623)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mon-Fri, 9AM-6PM EST
                    </p>
                    <button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                      Call Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Resources
              </h3>
              <div className="space-y-4">
                <a href="#" className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Documentation</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </a>
                
                <a href="#" className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Library</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </a>
                
                <a href="#" className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Download Guides</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </a>
                
                <a href="#" className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community Forum</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </a>
                
                <a href="#" className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Documentation</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
