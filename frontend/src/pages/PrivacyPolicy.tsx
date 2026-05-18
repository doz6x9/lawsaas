import React from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <Briefcase className="w-5 h-5 mr-3 text-white" />
          <span className="text-base font-semibold tracking-wide">LegalAct</span>
        </div>
        <a href="/" className="flex items-center text-sm font-medium hover:underline opacity-90 hover:opacity-100">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="bg-white border border-gray-200 shadow-sm rounded-md p-8 sm:p-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
              <p>
                At LegalAct ("we", "our", or "us"), we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you use our LegalTech software-as-a-service platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. GDPR Compliance & Data Handling</h2>
              <p>
                We process all data in strict compliance with the General Data Protection Regulation (GDPR) and Hungarian data protection laws (NAIH guidelines).
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Automated Data Scrubbing:</strong> Evidence images and raw datasets are automatically scrubbed and permanently deleted from our servers 30 days after processing.</li>
                <li><strong>Data Minimization:</strong> We only collect information strictly necessary to perform automated document generation and conflict searching.</li>
                <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Information We Collect</h2>
              <p>
                When you use our services, we may collect the following types of information:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Account Data:</strong> Name, email address, and professional affiliation.</li>
                <li><strong>Client Data:</strong> Information inputted into our Client Intake Portal (e.g., names, company details, phone numbers).</li>
                <li><strong>Evidence Data:</strong> Links and metadata pertaining to legal evidence submitted for document generation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
              <p>
                We do not sell, rent, or trade your personal information to third parties. We may utilize secure, compliant third-party sub-processors (such as cloud hosting providers) strictly for the purpose of operating the LegalAct platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Your Rights</h2>
              <p>
                Under the GDPR, you have the right to access, rectify, or erase your personal data. You may also have the right to restrict or object to certain processing. To exercise these rights, please contact our Data Protection Officer.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Contact Us</h2>
              <p>
                If you have any questions regarding this Privacy Policy or how your data is handled, please contact us at privacy@legalact.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LegalAct Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
