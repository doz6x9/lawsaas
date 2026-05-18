import React, { useState } from 'react';
import { Briefcase, ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
  };

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
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col md:flex-row gap-12">

        {/* Contact Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-[#0078D4] mt-0.5 mr-4" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                <p className="text-sm text-gray-600 mt-1">support@legalact.com</p>
                <p className="text-sm text-gray-600">sales@legalact.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-5 h-5 text-[#0078D4] mt-0.5 mr-4" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Phone</h3>
                <p className="text-sm text-gray-600 mt-1">+36 1 234 5678</p>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri from 9am to 5pm (CET)</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-[#0078D4] mt-0.5 mr-4" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Office</h3>
                <p className="text-sm text-gray-600 mt-1">Budapest, 1051<br/>Kossuth Lajos tér 1.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-md p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent</h3>
                <p className="text-sm text-gray-600">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-1.5">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] sm:text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#005A9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
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
