import React from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LegalAct</span>
          </div>
          <a href="/" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 sm:py-24">
        <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-md text-gray-500 mb-10">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
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
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LegalAct Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
