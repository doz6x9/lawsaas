import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  Search,
  Globe,
  Settings,
  Check,
  ArrowRight,
  MoreHorizontal
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
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans">

      {/* MS Style Header */}
      <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-4 shadow-sm shrink-0">
        <div className="flex items-center">
          <button className="p-2 hover:bg-white/10 rounded-sm focus:outline-none">
             <div className="grid grid-cols-3 gap-[2px] w-4 h-4">
                {[...Array(9)].map((_, i) => <div key={i} className="bg-white rounded-sm"></div>)}
             </div>
          </button>
          <span className="ml-4 text-base font-semibold tracking-wide">LegalAct Integrations</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto">

        {/* Title and Horizontal Tabs */}
        <div className="mb-6 border-b border-gray-200">
           <h1 className="text-2xl font-semibold text-gray-900 mb-6">Start from a template</h1>
           <div className="flex space-x-8 text-sm font-medium">
              <button className="pb-3 border-b-2 border-[#0078D4] text-[#0078D4]">All flows</button>
              <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900">Featured</button>
              <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900">Remote work</button>
              <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900">Email</button>
              <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900">Data collection</button>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
           <div className="text-sm text-gray-600">
             Showing {serviceModules.length} templates
           </div>
           <div className="flex space-x-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm bg-white hover:bg-gray-50 flex items-center">
                 Sort by: Popularity <MoreHorizontal className="w-4 h-4 ml-2 text-gray-500" />
              </button>
           </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-20">
          {serviceModules.map((module) => {
            const isSelected = selectedModuleIds.includes(module.id);
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`
                  flex flex-col border rounded-md bg-white p-4 h-48 cursor-pointer transition-shadow
                  hover:shadow-sm hover:border-gray-300
                  ${isSelected ? 'border-[#0078D4] ring-1 ring-[#0078D4]' : 'border-gray-200'}
                  ${module.isRequired ? 'cursor-default' : ''}
                `}
              >
                {/* Icons Area */}
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-gray-200 rounded-sm">
                    <Icon className="h-5 w-5 text-[#0078D4]" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-[#0078D4] text-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Body Area */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2" title={module.title}>
                    {module.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">By {module.author}</p>
                </div>

                {/* Footer Metadata */}
                <div className="flex justify-between items-end mt-2 pt-3 border-t border-gray-100">
                   <span className="text-xs font-semibold text-gray-700">{module.type}</span>
                   <div className="text-right">
                     <p className="text-[11px] text-gray-500">{module.uses}</p>
                     {/* For configurator context, we also show price */}
                     <p className="text-xs font-bold text-gray-900 mt-0.5">
                       {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(module.price)}
                     </p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer Summary Bar (Mimicking MS dialog footer) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-8 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-700">
             <span className="font-semibold text-gray-900">Total Investment:</span> {formattedTotalPrice}
             <span className="ml-4 text-gray-500">({selectedModuleIds.length} modules selected)</span>
          </div>
          <div className="flex space-x-3">
             <a href="/" className="px-4 py-1.5 text-sm border border-gray-300 rounded-sm bg-white hover:bg-gray-50 font-medium text-gray-700">
               Cancel
             </a>
             <button className="px-4 py-1.5 text-sm bg-[#0078D4] text-white rounded-sm hover:bg-[#005A9E] font-medium flex items-center">
               Create flow <ArrowRight className="w-4 h-4 ml-2" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigurator;
