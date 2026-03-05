import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const [openFAQ, setOpenFAQ] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "How quickly can I get a micro-loan?",
      answer: "Our approval process takes just 5 minutes. Once approved, funds are typically disbursed within 24 hours to your registered account."
    },
    {
      question: "What are the interest rates?",
      answer: "Our interest rates start as low as 0.5% and vary based on your savings history and credit profile. We believe in transparent pricing with no hidden fees."
    },
    {
      question: "How does automated savings work?",
      answer: "Connect your payroll, set your savings percentage, and we'll automatically deduct and save before you get paid. You can adjust or pause anytime."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use bank-level encryption and follow strict security protocols. Your data is never shared with third parties without your explicit consent."
    },
    {
      question: "Can I access my savings anytime?",
      answer: "Absolutely. Your savings are always accessible. Emergency withdrawals are processed instantly, while standard transfers take 1-2 business days."
    }
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Fixed Header */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-[1200px] mx-auto glass-header rounded-full px-8 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h2 className="text-dark text-xl font-extrabold tracking-tight">MicroFinance</h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors" href="#about">About</a>
            <a className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors" href="#faq">FAQ</a>
            <a className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="hidden sm:block text-dark text-sm font-bold hover:text-primary px-4"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="hidden sm:block bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Get Started
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-dark">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </header>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-24 left-0 right-0 z-40 px-6">
            <div className="max-w-[1200px] mx-auto glass-header rounded-2xl p-6 bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg">
              <nav className="flex flex-col gap-4">
                <a 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2" 
                  href="#about"
                >
                  About
                </a>
                <a 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2" 
                  href="#faq"
                >
                  FAQ
                </a>
                <a 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2" 
                  href="#contact"
                >
                  Contact
                </a>
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/login')
                    }}
                    className="text-dark text-sm font-bold hover:text-primary px-4 py-2 text-left"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/register')
                    }}
                    className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    Get Started
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-32">
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-10 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-green-100 px-3 py-1 rounded-full">Smart Microfinance Solutions</span>
                </div>
                <h1 className="text-dark text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                  Automate Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">Financial Growth</span>
                </h1>
                <p className="text-slate-custom text-lg lg:text-xl font-medium leading-relaxed max-w-[540px]">
                  Secure instant micro-loans and build wealth through automated salary savings. A professional platform designed for your financial scalability.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-dark text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-dark/90 transition-all flex items-center gap-2 shadow-xl shadow-dark/10"
                >
                  Start Saving Now 
                  <span className="material-symbols-outlined">trending_up</span>
                </button>
                <button className="bg-white text-dark border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-primary/50 transition-all">
                  Check Eligibility
                </button>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex -space-x-3">
                  <img alt="User" className="h-10 w-10 rounded-full ring-4 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPznaAOIoXo5joHwaTcy06DG5XQKGGJ9y-dbCRQAatGJehNtQNx8NhNB_eBrSSotQ1_yquA-3itCWzzqpvP-Le_n0r_koxmRaRn_c7qOFK7yeZCyVgqajPRGFEHq2py-aNP4fac1EvNHEyepPfS1XPaEkOv9I-7BtblT5KAQ3Pq15IfGGqiQ7ZfP0hhkGzMP0NNWeLDNOBfVMq8oEaaroV61h4v9qcVlOcqv0j9GX5mt0d3gxQFGns4-ukif5h2T2L-tITgr9FCFY" />
                  <img alt="User" className="h-10 w-10 rounded-full ring-4 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXdBcLgbUq2754kG_iy83AWWXbEPYc1R6wwv1dvZF9DAhudEs3zH3Xio-ih4tdPqFIebZPfYyEIOT7p1n2J-If3K1Y94qX6Ye_fz5oTvfJmwnPIXHHU9jbGqaPT81TE-BalG81Cvpt6a0qeZ0p14nkuJb8bjnJDmPFfFp5aRFnv8OMzpBaqIhcXlFentpNo63DqpmN38ucKua_UIExfX76rTn-qMX13yrbnzTYwwOhfyJAevE_LuxotVz7fwkT-x-QEdahBe45SA8" />
                  <img alt="User" className="h-10 w-10 rounded-full ring-4 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwJroG-UKxlyjUV9rLICJzG2_K6EldeUvC1foSrsgdOUeM6qm1A8iuiIvSG9BJWOO2h9TJSVHJz_YB5JRrkzcr-EWYCrbgva94tfJjW3SH5DSHrtLDsT7kpimBYqkhoTdSoA9WQ66-nt4bCmLnGUbPGa1fH0HUeYRLNGZ1HnW5Y61dkTYwfP7yT6zAZdijtdaIVrqhc2180VZAu4xDy97hQ-xwPKYIAU8gSW1CO5l7l0K3aAmojp1BpfBUxXHIRUd7onpKvO2NVTg" />
                  <div className="h-10 w-10 rounded-full ring-4 ring-white bg-secondary flex items-center justify-center text-[10px] text-white font-bold">+12k</div>
                </div>
                <p className="text-sm font-semibold text-slate-custom">Trusted by over 500,000 active users nationwide</p>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-4xl overflow-hidden shadow-2xl bg-white p-2">
                <img alt="Financial Success" className="rounded-[1.75rem] w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdOaUXOMqMcmoO_usH2GGsiKXo8T713LaO_A5DucASLPwKKAyk80n4cnmKrCspB_Dt2moah5NlWEwuNm07zVfhkqpPUEfVvObfyKXM8p9Hv2Gt3JG9acD4ickuEM-qaIR1Edl8S4rqUvOtmc9ck6Ul66l03zJbZp3eT93jrl7oCbNnzeuOqKSO6dpvoOMD5jO2D-hXtS5DXn813cTbc4rNydcPEzyXq7KSuZPBXmPz4AjbZt6sMB4qPpQo2wQx5-7z-ytzvIRQCAI" />
              </div>
              
              {/* Floating Savings Bubble */}
              <div className="absolute bottom-32 left-8 z-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <div className="bg-white text-primary px-6 py-2 rounded-2xl text-sm font-bold shadow-lg border-2 border-white">
                  Birr 9,890+
                  <p>Saving Amount</p>
                </div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl z-0"></div>
            </div>
          </div>

          {/* Stats Section - Responsive */}
          <div className="mt-24">
            {/* Mobile: Single Card */}
            <div className="md:hidden bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-black text-dark">500k+</span>
                    <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Active Users</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-black text-primary">$250M+</span>
                    <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Loans Disbursed</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-3xl font-black text-secondary">98%</span>
                    <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Scalability Rate</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop: Three Column Layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 bg-white border border-slate-100 p-8 lg:p-12 rounded-full shadow-sm">
              <div className="flex flex-col items-center text-center gap-2 border-r border-slate-100">
                <span className="text-4xl lg:text-5xl font-black text-dark">500k+</span>
                <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Active Users</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 border-r border-slate-100">
                <span className="text-4xl lg:text-5xl font-black text-primary">$250M+</span>
                <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Loans Disbursed</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl lg:text-5xl font-black text-secondary">98%</span>
                <span className="text-slate-custom font-semibold uppercase tracking-widest text-xs">Scalability Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="bg-slate-50 py-24 px-6 lg:px-10">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-dark text-4xl lg:text-5xl font-black mb-4">Financial Tools for Tomorrow</h2>
              <p className="text-slate-custom text-lg max-w-2xl mx-auto">Modern micro-lending and automated savings designed to integrate seamlessly with your salary workflow.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-white p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all border border-slate-100">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">savings</span>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">Automated Salary Savings</h3>
                <p className="text-slate-custom leading-relaxed mb-6">
                  Connect your payroll and watch your wealth grow. Set custom percentage rules to automatically funnel portions of your income into high-yield savings pots before you even see it.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-secondary">check_circle</span> Customizable auto-deductions
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-secondary">check_circle</span> Emergency fund automation
                  </li>
                </ul>
                <a className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all" href="#">Setup Auto-Save <span className="material-symbols-outlined">arrow_right_alt</span></a>
              </div>
              <div className="group bg-white p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all border border-slate-100">
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">bolt</span>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">Instant Micro-loans</h3>
                <p className="text-slate-custom leading-relaxed mb-6">
                  Bridge the gap between paychecks with credit that moves at your speed. Approval in minutes based on your savings history, with transparent repayment plans and zero hidden fees.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-secondary">check_circle</span> 5-minute approval process
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-secondary">check_circle</span> Low-interest rates starting at 0.5%
                  </li>
                </ul>
                <a className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all" href="#">Get Instant Credit <span className="material-symbols-outlined">arrow_right_alt</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 lg:px-10">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-dark text-4xl lg:text-5xl font-black mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-custom text-lg max-w-2xl mx-auto">Everything you need to know about our microfinance platform</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-dark">{faq.question}</h3>
                    <span className={`material-symbols-outlined text-2xl text-primary transition-transform duration-200 ${openFAQ === index ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? 'max-h-40' : 'max-h-0'}`}>
                    <div className="px-6 pb-4">
                      <p className="text-slate-custom leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-slate-50 py-24 px-6 lg:px-10">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-dark text-4xl lg:text-5xl font-black mb-4">Get in Touch</h2>
              <p className="text-slate-custom text-lg max-w-2xl mx-auto">Have questions? Our team is here to help you succeed</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">phone</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">Call Us</h3>
                <p className="text-slate-custom mb-4">Mon-Fri, 9AM-6PM EST</p>
                <a href="tel:+251911234567" className="text-primary font-bold hover:text-primary-hover">+251 911 234 567</a>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">email</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">Email Us</h3>
                <p className="text-slate-custom mb-4">We respond within 24hrs</p>
                <a href="mailto:support@microfinance.com" className="text-secondary font-bold hover:text-primary-hover">support@microfinance.com</a>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">location_on</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">Visit Us</h3>
                <p className="text-slate-custom mb-4">Bole, Addis Ababa</p>
                <p className="text-primary font-bold">Kazanchis Building, Floor 5</p>
              </div>
            </div>
            <div className="bg-white p-12 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-dark mb-4">Ready to get started?</h3>
              <p className="text-slate-custom mb-8">Join thousands of Ethiopians building their financial future with MicroFinance</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 transition-all"
                >
                  Open Account
                </button>
                <button className="bg-white text-dark border-2 border-slate-100 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6 lg:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h2 className="text-dark text-xl font-extrabold tracking-tight">MicroFinance</h2>
              </div>
              <p className="text-slate-custom leading-relaxed">
                Redefining financial freedom through intelligent automation and accessible credit solutions for modern workforce.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-xl">language</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-dark mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a className="text-slate-custom hover:text-primary" href="#">Micro-loans</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Savings Pots</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Salary Advance</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Financial Literacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-dark mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a className="text-slate-custom hover:text-primary" href="#">About Us</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Careers</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Press Kit</a></li>
                <li><a className="text-slate-custom hover:text-primary" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-dark mb-6">Newsletter</h4>
              <p className="text-slate-custom text-sm mb-4">Get weekly insights on financial management.</p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Microfinance Financial. All rights reserved.</p>
            <div className="flex gap-8">
              <a className="hover:text-dark" href="#">Privacy Policy</a>
              <a className="hover:text-dark" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
