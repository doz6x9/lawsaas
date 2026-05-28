import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  Calendar,
  CheckCircle,
  Zap,
  Users,
  BarChart3,
  Lock,
  Settings,
  TrendingUp,
  ClipboardCheck,
  Database,
  UploadCloud,
  Workflow, // Added Workflow icon
} from 'lucide-react';
import { Modal } from './Modal'; // Import the Modal component

interface LandingPageProps {
  onLogin: () => void;
}

type IconType = React.ElementType;

interface Feature {
  icon: IconType;
  title: string;
  desc: string;
  benefit: string;
}

interface UseCase {
  icon: IconType;
  title: string;
  description: string;
  href: string;
}

interface WorkflowStep {
  step: string;
  icon: IconType;
  title: string;
  desc: string;
}

interface TrustItem {
  icon: IconType;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: FileText,
    title: 'Automated Document Generation',
    desc: 'Generate structured legal documents from Excel data and client intake forms without repetitive copy-pasting.',
    benefit: 'Reduce manual drafting work',
  },
  {
    icon: Search,
    title: 'Conflict Detection',
    desc: 'Search your client and case database to identify potential conflicts before accepting new matters.',
    benefit: 'Catch risks earlier',
  },
  {
    icon: Calendar,
    title: 'Deadline Management',
    desc: 'Track important case deadlines and reduce the chance of missing procedural dates.',
    benefit: 'Stay ahead of due dates',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Client Intake',
    desc: 'Collect client information through a structured intake portal and store it in one organized workflow.',
    benefit: 'Simplify client onboarding',
  },
];

const useCases: UseCase[] = [
  {
    icon: Zap,
    title: 'IP & Trademark Teams',
    description:
      'Generate cease-and-desist letters, organize evidence, and manage enforcement workflows faster.',
    href: '/use-cases/ip-specialists',
  },
  {
    icon: Users,
    title: 'Small Law Firms',
    description:
      'Centralize client intake, case details, documents, and follow-up tasks without a heavy enterprise system.',
    href: '/use-cases/small-law-firms',
  },
  {
    icon: BarChart3,
    title: 'Compliance Teams',
    description:
      'Track records, prepare internal documentation, and maintain a clearer audit trail for sensitive workflows.',
    href: '/use-cases/compliance-teams',
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    step: '1',
    icon: UploadCloud,
    title: 'Upload or Collect Data',
    desc: 'Import Excel files or collect client details through a secure intake form.',
  },
  {
    step: '2',
    icon: Settings,
    title: 'Process Automatically',
    desc: 'The system organizes information, prepares document data, and highlights possible issues.',
  },
  {
    step: '3',
    icon: TrendingUp,
    title: 'Generate & Manage',
    desc: 'Create documents, review outputs, download files, and manage your workflow from one place.',
  },
];

const trustItems: TrustItem[] = [
  {
    icon: Lock,
    title: 'Privacy-Focused',
    desc: 'Built with secure handling of legal and client information in mind.',
  },
  {
    icon: ShieldCheck,
    title: 'GDPR-Aware',
    desc: 'Designed to support structured and responsible client data processing.',
  },
  {
    icon: Database,
    title: 'Organized Database',
    desc: 'Keep clients, cases, files, and generated documents connected.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review Before Download',
    desc: 'Allow users to verify outputs before using or sending documents.',
  },
];

const SectionHeading = ({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description: string;
}) => (
  <div className="max-w-3xl mx-auto text-center mb-14">
    {label && (
      <p className="text-sm font-semibold text-[#0078D4] uppercase tracking-wide mb-3">
        {label}
      </p>
    )}
    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
      {title}
    </h2>
    <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-[#0078D4] rounded-xl flex items-center justify-center shadow-sm">
      <Workflow className="w-6 h-6 text-white" /> {/* Changed icon to Workflow */}
    </div>
    <span className="text-xl font-bold text-gray-900">LegalAct</span>
  </div>
);

const PRIVACY_POLICY_CONTENT = `
  <h1 class="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
  <p class="text-md text-gray-500 mb-10">Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

  <section>
    <h2>1. Introduction</h2>
    <p>
      At LegalAct ("we", "our", or "us"), we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you use our LegalTech software-as-a-service platform.
    </p>
  </section>

  <section>
    <h2>2. GDPR Compliance & Data Handling</h2>
    <p>
      We process all data in strict compliance with the General Data Protection Regulation (GDPR) and Hungarian data protection laws (NAIH guidelines).
    </p>
    <ul>
      <li><strong>Automated Data Scrubbing:</strong> Evidence images and raw datasets are automatically scrubbed and permanently deleted from our servers 30 days after processing.</li>
      <li><strong>Data Minimization:</strong> We only collect information strictly necessary to perform automated document generation and conflict searching.</li>
      <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256).</li>
    </ul>
  </section>

  <section>
    <h2>3. Information We Collect</h2>
    <p>
      When you use our services, we may collect the following types of information:
    </p>
    <ul>
      <li><strong>Account Data:</strong> Name, email address, and professional affiliation.</li>
      <li><strong>Client Data:</strong> Information inputted into our Client Intake Portal (e.g., names, company details, phone numbers).</li>
      <li><strong>Evidence Data:</strong> Links and metadata pertaining to legal evidence submitted for document generation.</li>
    </ul>
  </section>

  <section>
    <h2>4. Third-Party Services</h2>
    <p>
      We do not sell, rent, or trade your personal information to third parties. We may utilize secure, compliant third-party sub-processors (such as cloud hosting providers) strictly for the purpose of operating the LegalAct platform.
    </p>
  </section>

  <section>
    <h2>5. Your Rights</h2>
    <p>
      Under the GDPR, you have the right to access, rectify, or erase your personal data. You may also have the right to restrict or object to certain processing. To exercise these rights, please contact our Data Protection Officer.
    </p>
  </section>

  <section>
    <h2>6. Contact Us</h2>
    <p>
      If you have any questions regarding this Privacy Policy or how your data is handled, please contact us at <a href="mailto:privacy@legalact.com">privacy@legalact.com</a>.
    </p>
  </section>
`;

const TERMS_OF_SERVICE_CONTENT = `
  <h1 class="text-4xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
  <p class="text-md text-gray-500 mb-10">Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

  <section>
    <h2>1. Agreement to Terms</h2>
    <p>
      By accessing or using the LegalAct platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
    </p>
  </section>

  <section>
    <h2>2. Use of Service</h2>
    <p>
      LegalAct provides automated document generation, conflict searching, and legal timeline calculation tools. These tools are designed to assist legal professionals but do not constitute legal advice. You are solely responsible for verifying the accuracy and legal validity of any documents generated using our platform.
    </p>
  </section>

  <section>
    <h2>3. User Accounts</h2>
    <p>
      You must safeguard your account credentials. LegalAct is not liable for any unauthorized access resulting from your failure to maintain secure passwords.
    </p>
  </section>

  <section>
    <h2>4. Data Ownership</h2>
    <p>
      You retain all rights to the data you upload to the platform. By uploading data, you grant us a temporary license to process it strictly for the purpose of providing the requested services.
    </p>
  </section>

  <section>
    <h2>5. Service Availability</h2>
    <p>
      While we strive for 99.9% uptime, we do not guarantee that the service will be uninterrupted or error-free. We reserve the right to perform scheduled maintenance.
    </p>
  </section>

  <section>
    <h2>6. Limitation of Liability</h2>
    <p>
      In no event shall LegalAct, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform.
    </p>
  </section>
`;

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalContent('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <Logo />

          <nav className="flex items-center gap-5 sm:gap-8 text-sm font-medium">
            <a
              href="#features"
              className="text-gray-700 hover:text-[#0078D4] transition-colors hidden md:block"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-gray-700 hover:text-[#0078D4] transition-colors hidden md:block"
            >
              Workflow
            </a>
            <a
              href="#usecases"
              className="text-gray-700 hover:text-[#0078D4] transition-colors hidden md:block"
            >
              Use Cases
            </a>
            <a
              href="/pricing"
              className="text-gray-700 hover:text-[#0078D4] transition-colors hidden md:block"
            >
              Pricing
            </a>
            <a
              href="/intake"
              className="text-gray-700 hover:text-[#0078D4] transition-colors hidden sm:block"
            >
              Client Portal
            </a>

            <button
              type="button"
              onClick={onLogin}
              className="px-4 py-2 rounded-lg bg-[#0078D4] text-white font-semibold hover:bg-[#005A9E] transition-colors shadow-sm"
            >
              Sign in
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative pt-20 sm:pt-24 pb-24 sm:pb-32 px-5 sm:px-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-semibold text-[#0078D4] mb-6">
                <ShieldCheck className="w-2 h-2" />
                Legal workflow automation for modern firms
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                Spend less time on paperwork and more time on legal work.
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-9 leading-relaxed max-w-2xl">
                LegalAct helps law firms automate client intake, document
                generation, conflict checks, and deadline tracking from one
                organized workspace.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-white bg-[#0078D4] hover:bg-[#005A9E] rounded-lg shadow-sm transition-all"
                >
                  Get started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  See how it works
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">No heavy setup required</span>
                </div>

                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Built for sensitive files</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl opacity-10 blur-3xl" />

                <div className="relative bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                  <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-5 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="ml-4 h-6 flex-1 bg-white border border-gray-200 rounded-md" />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Cases</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Docs</p>
                        <p className="text-2xl font-bold text-gray-900">118</p>
                      </div>
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">7</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-gray-900">
                          Recent Activity
                        </p>
                        <span className="text-xs font-semibold text-[#0078D4] bg-blue-50 px-2 py-1 rounded-full">
                          Live
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              Demand letter generated
                            </p>
                            <p className="text-sm text-gray-500">
                              Ready for review
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              Conflict check completed
                            </p>
                            <p className="text-sm text-gray-500">
                              No matching conflict found
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-yellow-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              Deadline reminder created
                            </p>
                            <p className="text-sm text-gray-500">
                              Follow-up due in 5 days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 px-5 sm:px-6 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5">
              <p className="text-3xl font-bold text-[#0078D4] mb-2">3+</p>
              <p className="text-gray-600 font-medium">
                Core workflows automated
              </p>
            </div>

            <div className="p-5">
              <p className="text-3xl font-bold text-[#0078D4] mb-2">DOCX , PDF</p>
              <p className="text-gray-600 font-medium">
                Document generation support
              </p>
            </div>

            <div className="p-5">
              <p className="text-3xl font-bold text-[#0078D4] mb-2">Excel</p>
              <p className="text-gray-600 font-medium">
                Batch processing friendly
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 px-5 sm:px-6 bg-[#F3F2F1]">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              label="Features"
              title="A practical platform for legal workflow automation"
              description="Start with the workflows that create the most admin burden: intake, document generation, conflict checks, and deadline tracking."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(feature => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group p-7 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-blue-50 text-[#0078D4] rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                      {feature.desc}
                    </p>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-[#0078D4]">
                        {feature.benefit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-24 px-5 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              label="Workflow"
              title="From raw case data to ready-to-review documents"
              description="LegalAct is designed to fit into your existing process instead of forcing your firm into a complicated new system."
            />

            <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="absolute top-8 left-0 w-full h-px bg-gray-200 hidden md:block" />

              {workflowSteps.map(item => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.step}
                    className="relative bg-white text-center p-6 rounded-2xl"
                  >
                    <div className="w-16 h-16 mx-auto bg-[#0078D4] text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-md relative z-10">
                      {item.step}
                    </div>

                    <div className="w-12 h-12 mx-auto bg-blue-50 text-[#0078D4] rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="usecases" className="py-24 px-5 sm:px-6 bg-[#F3F2F1]">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              label="Use Cases"
              title="Built for legal teams that want less manual admin"
              description="Whether you handle IP enforcement, client intake, or compliance documentation, the platform helps reduce repetitive work."
            />

            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map(useCase => {
                const Icon = useCase.icon;

                return (
                  <a
                    key={useCase.title}
                    href={useCase.href}
                    className="group block p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 transition-all hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-blue-50 text-[#0078D4] rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-[#0078D4] transition-colors">
                      {useCase.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed mb-5">
                      {useCase.description}
                    </p>

                    <span className="inline-flex items-center text-sm font-semibold text-[#0078D4]">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-5 sm:px-6 bg-[#0078D4] text-white">
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map(item => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-white/10 border border-white/15 text-center"
                >
                  <Icon className="w-8 h-8 mx-auto mb-4" />
                  <p className="font-semibold mb-2">{item.title}</p>
                  <p className="text-sm text-blue-50 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-24 px-5 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold text-[#0078D4] uppercase tracking-wide mb-3">
              Get started
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Start automating your legal paperwork today.
            </h2>

            <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Set up client intake, process case data, and generate documents
              from one workflow built for legal professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center px-8 py-3 bg-[#0078D4] text-white font-semibold rounded-lg hover:bg-[#005A9E] transition-all shadow-sm"
              >
                Open dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-800 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-[#F3F2F1] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div>
              <Logo />
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                Helping legal teams reduce repetitive admin work through
                practical automation.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#features"
                    className="hover:text-[#0078D4] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#workflow"
                    className="hover:text-[#0078D4] transition-colors"
                  >
                    Workflow
                  </a>
                </li>
                <li>
                  <a
                    href="#usecases"
                    className="hover:text-[#0078D4] transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-4">Company</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="/contact"
                    className="hover:text-[#0078D4] transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="hover:text-[#0078D4] transition-colors"
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <span
                    onClick={() => openModal('Privacy Policy', PRIVACY_POLICY_CONTENT)}
                    className="cursor-pointer hover:text-[#0078D4] transition-colors"
                  >
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => openModal('Terms of Service', TERMS_OF_SERVICE_CONTENT)}
                    className="cursor-pointer hover:text-[#0078D4] transition-colors"
                  >
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} LegalAct. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm text-gray-600">
              <span
                onClick={() => openModal('Privacy Policy', PRIVACY_POLICY_CONTENT)}
                className="cursor-pointer hover:text-[#0078D4] transition-colors"
              >
                Privacy
              </span>
              <span
                onClick={() => openModal('Terms of Service', TERMS_OF_SERVICE_CONTENT)}
                className="cursor-pointer hover:text-[#0078D4] transition-colors"
              >
                Terms
              </span>
              <a
                href="/contact"
                className="hover:text-[#0078D4] transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Modal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
        <div dangerouslySetInnerHTML={{ __html: modalContent }} />
      </Modal>
    </div>
  );
};
