import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck, FileText, Search, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const features = [
    {
      icon: <FileText className="w-5 h-5 text-[#0078D4]" />,
      title: "Automated Assembly",
      desc: "Instantly generate compliant demand letters from raw Excel data. Say goodbye to manual copy-pasting."
    },
    {
      icon: <Search className="w-5 h-5 text-[#0078D4]" />,
      title: "Conflict Detection",
      desc: "Full-text search across your entire database instantly flags potential client conflicts before onboarding."
    },
    {
      icon: <Calendar className="w-5 h-5 text-[#0078D4]" />,
      title: "Statutory Deadlines",
      desc: "Calculate exact procedural deadlines natively accounting for Hungarian public holidays and weekends."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#0078D4]" />,
      title: "Zero-Touch Intake",
      desc: "Public-facing portals that directly feed client submissions into your secure, GDPR-compliant database."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <Briefcase className="w-5 h-5 mr-3 text-white" />
          <span className="text-base font-semibold tracking-wide">LegalAct</span>
        </div>
        <div className="flex items-center space-x-6 text-sm font-medium">
          <a href="#features" className="hover:underline opacity-90 hover:opacity-100 hidden sm:block">Platform</a>
          <a href="/services" className="hover:underline opacity-90 hover:opacity-100 hidden sm:block">Services</a>
          <a href="/intake" className="hover:underline opacity-90 hover:opacity-100">Client Portal</a>
          <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
          <button onClick={onLogin} className="hover:underline opacity-90 hover:opacity-100 font-bold">
            Sign in
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-left">
          <div className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-sm text-xs font-semibold text-gray-600 uppercase tracking-wider mb-6 shadow-sm">
            <CheckCircle className="w-3 h-3 mr-2 text-green-600" /> Enterprise Ready
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6">
            Automate your legal workflows with precision.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed">
            LegalAct provides enterprise-grade tools for document generation, conflict searching, and deadline calculation, seamlessly mirroring the tools your firm already uses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onLogin}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#005A9E] rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:ring-offset-2"
            >
              Sign in to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <a
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-sm"
            >
              View Pricing & Services
            </a>
          </div>
        </div>

        {/* Hero Visual representation of a data table/dashboard */}
        <div className="flex-1 w-full hidden md:block">
          <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden flex flex-col h-80 w-full transform rotate-1 hover:rotate-0 transition-transform duration-500">
             <div className="h-10 bg-[#F3F2F1] border-b border-gray-200 flex items-center px-4 space-x-4">
                <div className="h-2 w-16 bg-gray-300 rounded-sm"></div>
                <div className="h-2 w-12 bg-gray-300 rounded-sm"></div>
                <div className="h-2 w-20 bg-gray-300 rounded-sm"></div>
             </div>
             <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                   <div className="w-8 h-8 bg-blue-50 text-[#0078D4] flex items-center justify-center rounded-sm border border-blue-100"><FileText className="w-4 h-4" /></div>
                   <div className="flex-1"><div className="h-3 w-1/3 bg-gray-200 rounded-sm mb-2"></div><div className="h-2 w-1/4 bg-gray-100 rounded-sm"></div></div>
                   <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-sm border border-green-200">Generated</div>
                </div>
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                   <div className="w-8 h-8 bg-amber-50 text-[#D83B01] flex items-center justify-center rounded-sm border border-amber-100"><ShieldAlert className="w-4 h-4" /></div>
                   <div className="flex-1"><div className="h-3 w-1/2 bg-gray-200 rounded-sm mb-2"></div><div className="h-2 w-1/3 bg-gray-100 rounded-sm"></div></div>
                   <div className="px-2 py-1 bg-amber-50 text-[#D83B01] text-[10px] font-bold uppercase rounded-sm border border-amber-200">Conflict Found</div>
                </div>
                <div className="flex items-center space-x-4">
                   <div className="w-8 h-8 bg-gray-50 text-gray-600 flex items-center justify-center rounded-sm border border-gray-200"><Calendar className="w-4 h-4" /></div>
                   <div className="flex-1"><div className="h-3 w-1/4 bg-gray-200 rounded-sm mb-2"></div><div className="h-2 w-1/5 bg-gray-100 rounded-sm"></div></div>
                   <div className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase rounded-sm border border-gray-200">Pending</div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Enterprise capabilities out of the box</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Built exclusively for boutiques and enterprise firms that demand precision, privacy, and speed without the clutter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[#FAF9F8] border border-gray-200 p-6 rounded-md shadow-sm hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-sm flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 bg-[#F3F2F1]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ready to digitize your firm?</h2>
          <button
            onClick={onLogin}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#005A9E] rounded-sm transition-colors shadow-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-gray-500 text-sm">
             <Briefcase className="w-4 h-4 mr-2" />
             <span className="font-semibold text-gray-700 mr-2">LegalAct Inc.</span>
             &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="/privacy" className="hover:text-[#0078D4] hover:underline transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#0078D4] hover:underline transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-[#0078D4] hover:underline transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
