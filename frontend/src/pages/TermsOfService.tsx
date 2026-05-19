import React from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-md text-gray-500 mb-10">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
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
