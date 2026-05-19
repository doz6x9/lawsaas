import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck, FileText, Search, Calendar, CheckCircle, Zap, Users, BarChart3, Lock, Settings, TrendingUp, Award } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-[#0078D4]" />,
      title: "Automated Document Generation",
      desc: "Generate compliant legal documents from Excel data, eliminating manual and error-prone copy-pasting.",
      benefit: "Saves an average of 40 hours per month"
    },
    {
      icon: <Search className="w-6 h-6 text-[#0078D4]" />,
      title: "Intelligent Conflict Detection",
      desc: "Instantly search your entire database to flag potential client conflicts before they become a problem.",
      benefit: "Identify conflicts in seconds, not hours"
    },
    {
      icon: <Calendar className="w-6 h-6 text-[#0078D4]" />,
      title: "Statutory Deadline Calculation",
      desc: "Automatically calculate procedural deadlines, including specific rules for Hungarian public holidays and weekends.",
      benefit: "Eliminate the risk of missed deadlines"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0078D4]" />,
      title: "Secure Client Intake",
      desc: "Use our public-facing portals to securely collect client data directly into your GDPR-compliant database.",
      benefit: "Streamline data entry and ensure compliance"
    }
  ];

  const useCases = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "IP Specialists",
      description: "Streamline trademark and patent enforcement with automated cease-and-desist letter generation.",
      href: "/use-cases/ip-specialists"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Contract Teams",
      description: "Quickly generate templated agreements, NDAs, and employment contracts from your existing data.",
      href: "/use-cases/contract-teams"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Compliance Officers",
      description: "Maintain audit logs, track deadlines, and generate GDPR compliance reports automatically.",
      href: "/use-cases/compliance-officers"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Users" },
    { number: "50K+", label: "Documents Generated" },
    { number: "99.9%", label: "Uptime SLA" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans flex flex-col overflow-x-hidden">

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0078D4] rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LegalAct</span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-700 hover:text-[#0078D4] transition-colors hidden sm:block">Features</a>
            <a href="/use-cases" className="text-gray-700 hover:text-[#0078D4] transition-colors hidden sm:block">Use Cases</a>
            <a href="/services" className="text-gray-700 hover:text-[#0078D4] transition-colors hidden sm:block">Pricing</a>
            <a href="/intake" className="text-gray-700 hover:text-[#0078D4] transition-colors">Portal</a>
            <div className="w-px h-5 bg-gray-300 hidden sm:block"></div>
            <button onClick={onLogin} className="px-4 py-2 rounded-md bg-[#0078D4] text-white font-semibold hover:bg-[#005A9E] transition-colors shadow-sm">
              Sign in
            </button>
          </nav>
        </div>
      </header>

      <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/70 border border-blue-200 rounded-full text-sm font-semibold text-[#0078D4] mb-6">
              <Award className="w-4 h-4" />
              Enterprise Legal Tech
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Focus on Law, Not Paperwork
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
              LegalAct provides an integrated suite of tools to handle document drafting, conflict screening, and deadline management, allowing your firm to operate with greater speed and fewer errors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onLogin}
                className="inline-flex items-center justify-center px-7 py-3 border border-transparent text-base font-semibold text-white bg-[#0078D4] hover:bg-[#005A9E] rounded-sm shadow-sm transition-all"
              >
                Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <a
                href="/services"
                className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-[#0078D4] bg-white border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors"
              >
                View Pricing
              </a>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold">Free 14-day trial</span></div>
              <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-green-500" /><span className="font-semibold">SOC 2 Certified</span></div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
              <div className="relative bg-white border border-gray-200 shadow-lg rounded-lg p-2">
                <div className="h-10 bg-gray-100 rounded-t-md flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6 space-y-4 bg-white rounded-b-md">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>
                    <div><p className="font-semibold text-gray-800">Demand_Letter_Q3.docx</p><p className="text-sm text-gray-500">Generated successfully</p></div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="w-10 h-10 bg-yellow-100 rounded-md flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-yellow-600" /></div>
                    <div><p className="font-semibold text-gray-800">Conflict Check</p><p className="text-sm text-gray-500">No conflicts found</p></div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-600" /></div>
                    <div><p className="font-semibold text-gray-800">Deadline: May 25</p><p className="text-sm text-gray-500">5 days remaining</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-[#0078D4] mb-2">{stat.number}</p>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-[#F3F2F1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">A Unified Platform for Your Firm</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Manage cases, documents, and deadlines with a single, integrated solution designed for legal professionals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-md flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.desc}</p>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-[#0078D4]">{feature.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Streamline Your Workflow in Three Steps</h2>
            <p className="text-xl text-gray-600">A straightforward process to enhance your firm's efficiency.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200 hidden md:block"></div>
            {[
              { step: "1", title: "Upload Your Case Files", desc: "Securely upload client information, case details, and related documents to get started.", icon: <Settings className="w-8 h-8" /> },
              { step: "2", title: "Automated Analysis", desc: "The system automatically detects conflicts, calculates procedural deadlines, and flags potential risks.", icon: <Zap className="w-8 h-8" /> },
              { step: "3", title: "Generate Documents & Manage Cases", desc: "Draft legal documents, oversee case progress, and communicate with clients from a centralized dashboard.", icon: <TrendingUp className="w-8 h-8" /> }
            ].map((item, idx) => (
              <div key={idx} className="relative bg-white text-center">
                <div className="w-16 h-16 mx-auto bg-[#0078D4] text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-md z-10 relative">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="usecases" className="py-24 px-6 bg-[#F3F2F1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions for Your Specialization</h2>
            <p className="text-xl text-gray-600">LegalAct is designed to meet the needs of various legal practices.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => (
              <a key={idx} href={useCase.href} className="block p-8 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-blue-100 text-[#0078D4] rounded-md flex items-center justify-center mb-4">
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0078D4] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center"><Lock className="w-8 h-8 mx-auto mb-3" /><p className="font-semibold mb-1">SOC 2 Type II</p><p className="text-sm opacity-90">Certified & Audited</p></div>
            <div className="flex flex-col items-center"><ShieldCheck className="w-8 h-8 mx-auto mb-3" /><p className="font-semibold mb-1">GDPR Compliant</p><p className="text-sm opacity-90">Data Protection Ready</p></div>
            <div className="flex flex-col items-center"><Zap className="w-8 h-8 mx-auto mb-3" /><p className="font-semibold mb-1">99.9% Uptime</p><p className="text-sm opacity-90">Enterprise SLA</p></div>
            <div className="flex flex-col items-center"><Users className="w-8 h-8 mx-auto mb-3" /><p className="font-semibold mb-1">24/7 Support</p><p className="text-sm opacity-90">Expert Team Ready</p></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Elevate Your Firm's Productivity</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">Join hundreds of firms that are saving time, reducing errors, and focusing on what matters most: their clients.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLogin}
              className="px-8 py-3 bg-[#0078D4] text-white font-semibold rounded-sm hover:bg-[#005A9E] transition-all shadow-sm"
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
            <a
              href="/contact"
              className="px-8 py-3 bg-white text-[#0078D4] font-semibold border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors"
            >
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-[#F3F2F1] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#0078D4] rounded-md flex items-center justify-center"><Briefcase className="w-5 h-5 text-white" /></div>
                <span className="font-bold text-gray-900">LegalAct</span>
              </div>
              <p className="text-sm text-gray-600">Empowering legal firms with intelligent automation.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-[#0078D4] transition-colors">Features</a></li>
                <li><a href="/services" className="hover:text-[#0078D4] transition-colors">Pricing</a></li>
                <li><a href="/use-cases" className="hover:text-[#0078D4] transition-colors">Use Cases</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Company</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/contact" className="hover:text-[#0078D4] transition-colors">Contact</a></li>
                <li><a href="/about" className="hover:text-[#0078D4] transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-[#0078D4] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-[#0078D4] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} LegalAct Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-[#0078D4] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#0078D4] transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-[#0078D4] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
