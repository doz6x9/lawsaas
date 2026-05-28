import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  Menu,
  Scale,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';

interface ServiceConfiguratorProps {
  embedded?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  audience: string;
  price: string;
  period: string;
  description: string;
  icon: React.ElementType;
  highlighted?: boolean;
  features: string[];
  cta: string;
  href: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'solo',
    name: 'Solo Lawyer',
    audience: 'Independent attorneys',
    price: '19 900 Ft',
    period: '/ month',
    description: 'A focused workspace for document generation, contacts, deadlines, and HUN court research.',
    icon: Scale,
    features: [
      '100 generated documents per month',
      '200 HUN court searches per month',
      '5 saved legal searches',
      'Contact directory and conflict checks',
      'Batch document generation'
    ],
    cta: 'Start solo',
    href: '/intake'
  },
  {
    id: 'small_firm',
    name: 'Small Firm',
    audience: '2-10 person legal teams',
    price: '59 900 Ft',
    period: '/ month',
    description: 'Higher usage limits for firms handling recurring matters, client records, and templates.',
    icon: Users,
    highlighted: true,
    features: [
      '1 000 generated documents per month',
      '2 000 HUN court searches per month',
      '50 saved legal searches',
      'Matter workspace and timeline',
      'Priority onboarding support'
    ],
    cta: 'Choose small firm',
    href: '/intake'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    audience: 'Legal departments',
    price: 'Custom',
    period: '',
    description: 'Custom limits, deployment support, and workflow design for larger legal operations.',
    icon: Building2,
    features: [
      'Custom document and search limits',
      'Template versioning support',
      'Advanced audit and retention setup',
      'Custom integrations',
      'Dedicated implementation planning'
    ],
    cta: 'Talk to us',
    href: '/contact'
  }
];

const capabilityRows = [
  ['Document generation', 'Included', 'Higher limits', 'Custom limits'],
  ['HUN court search', 'CSV-backed search', 'CSV-backed search', 'Custom data workflows'],
  ['Contacts and conflicts', 'Included', 'Included', 'Custom import support'],
  ['Matter management', 'Core workspace', 'Core workspace', 'Advanced workflow setup'],
  ['Support', 'Standard', 'Priority onboarding', 'Dedicated implementation']
];

const ServiceConfigurator: React.FC<ServiceConfiguratorProps> = ({ embedded = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={`${embedded ? 'min-h-full' : 'min-h-screen'} bg-gray-50 text-gray-800 font-sans`}>
      {!embedded && (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-xl font-bold text-gray-900">LegalAct</a>
            <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
              <a href="/" className="text-gray-600 transition-colors hover:text-blue-600">Home</a>
              <a href="/huncourt" className="text-gray-600 transition-colors hover:text-blue-600">Case Law Search</a>
              <a href="/pricing" className="text-blue-700">Pricing</a>
              <a href="/intake" className="text-gray-600 transition-colors hover:text-blue-600">Portal</a>
            </nav>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {isMenuOpen && (
            <nav className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm font-medium md:hidden">
              <a href="/" className="text-gray-600">Home</a>
              <a href="/huncourt" className="text-gray-600">Case Law Search</a>
              <a href="/pricing" className="text-blue-700">Pricing</a>
              <a href="/intake" className="text-gray-600">Portal</a>
            </nav>
          )}
        </header>
      )}

      <main className={embedded ? 'w-full' : 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'}>
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Static MVP pricing
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Simple plans for Hungarian legal teams
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
              Start with document generation, contact management, conflict checks, deadlines, and HUN court research. Billing automation can come later; this page keeps the MVP clear and deployable.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Request custom setup
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pricingPlans.map(plan => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.id}
                className={`rounded-md border bg-white p-6 shadow-sm ${plan.highlighted ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-950">{plan.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{plan.audience}</p>
                  </div>
                  {plan.highlighted && (
                    <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-950">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-sm text-gray-500">{plan.period}</span>}
                  <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">{plan.description}</p>
                </div>

                <ul className="mb-6 space-y-3 text-sm text-gray-700">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition ${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'}`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            );
          })}
        </section>

        <section className="mt-8 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-950">Plan comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Capability</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Solo Lawyer</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Small Firm</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {capabilityRows.map(row => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={`px-5 py-4 ${index === 0 ? 'font-medium text-gray-950' : 'text-gray-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServiceConfigurator;
