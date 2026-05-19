import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  Search,
  Globe,
  Settings,
  Check,
  ArrowRight,
  MoreHorizontal,
  Menu,
  X
} from 'lucide-react';

interface ServiceModule {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: React.ElementType;
  isRequired?: boolean;
  author: string;
  type: string;
  uses: string;
}

const serviceModules: ServiceModule[] = [
  {
    id: 'm365-core-security',
    title: 'Microsoft 365 Core & Security',
    description: 'Core requirement and security audit for your M365 environment.',
    price: 150000,
    icon: ShieldCheck,
    isRequired: true,
    author: 'LegalAct Consulting',
    type: 'Automated',
    uses: '10K+ uses'
  },
  {
    id: 'automated-document-generator',
    title: 'Automated Document Generator',
    description: 'Automatic Word document generation via Power Automate workflows.',
    price: 250000,
    icon: FileText,
    author: 'LegalAct Templates',
    type: 'Instant',
    uses: '5K+ uses'
  },
  {
    id: 'conflict-of-interest-search',
    title: 'Conflict of Interest Search',
    description: 'Custom conflict search database built natively on SharePoint.',
    price: 120000,
    icon: Search,
    author: 'LegalAct Templates',
    type: 'Automated',
    uses: '2K+ uses'
  },
  {
    id: 'client-intake-portal',
    title: 'Client Intake Portal',
    description: 'Secure client portal with seamless Microsoft 365 integration.',
    price: 300000,
    icon: Globe,
    author: 'LegalAct Consulting',
    type: 'Scheduled',
    uses: '1K+ uses'
  },
  {
    id: 'custom-power-automate-development',
    title: 'Custom Power Automate Flow',
    description: 'Tailored workflow automation to streamline your legal processes.',
    price: 150000,
    icon: Settings,
    author: 'LegalAct Consulting',
    type: 'Custom',
    uses: 'New'
  },
];

const ServiceConfigurator: React.FC = () => {
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(() => {
    const requiredModule = serviceModules.find(module => module.isRequired);
    return requiredModule ? [requiredModule.id] : [];
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleModule = (id: string) => {
    const module = serviceModules.find(m => m.id === id);
    if (module?.isRequired) return;

    setSelectedModuleIds(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(moduleId => moduleId !== id)
        : [...prevSelected, id]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedModuleIds.reduce((sum, id) => {
      const module = serviceModules.find(m => m.id === id);
      return sum + (module ? module.price : 0);
    }, 0);
  }, [selectedModuleIds]);

  const formattedTotalPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">LegalAct Integrations</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">All flows</a>
            <a href="#usecases" className="text-gray-600 hover:text-blue-600 transition-colors">Featured</a>
            <a href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Remote work</a>
            <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Email</a>
            <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Data collection</a>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col items-center gap-4 py-4 text-sm font-medium">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">All flows</a>
              <a href="#usecases" className="text-gray-600 hover:text-blue-600 transition-colors">Featured</a>
              <a href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Remote work</a>
              <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Email</a>
              <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Data collection</a>
            </nav>
          </div>
        )}
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Start from a template</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {serviceModules.length} templates
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center">
              Sort by: Popularity <MoreHorizontal className="w-4 h-4 ml-2 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
          {serviceModules.map((module) => {
            const isSelected = selectedModuleIds.includes(module.id);
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`
                  flex flex-col border rounded-xl bg-white p-4 h-48 cursor-pointer transition-all
                  hover:shadow-xl hover:border-blue-300
                  ${isSelected ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-200'}
                  ${module.isRequired ? 'cursor-default opacity-70' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 border border-blue-200 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2" title={module.title}>
                    {module.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">By {module.author}</p>
                </div>

                <div className="flex justify-between items-end mt-2 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-700">{module.type}</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{module.uses}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(module.price)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 p-4 px-8 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Total Investment:</span> {formattedTotalPrice}
            <span className="ml-4 text-gray-500 hidden sm:inline">({selectedModuleIds.length} modules selected)</span>
          </div>
          <div className="flex space-x-3">
            <a href="/" className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 font-medium text-gray-700">
              Cancel
            </a>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center">
              Create flow <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigurator;
