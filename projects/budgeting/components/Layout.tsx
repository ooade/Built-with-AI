
import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  Settings, 
  FileText, 
  Wallet,
  Menu,
  X,
  Share2
} from 'lucide-react';
import { ViewType } from '../types';
import { TEXTS } from '../textResources';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: TEXTS.NAVIGATION.DASHBOARD, icon: LayoutDashboard },
    { id: 'expenses', label: TEXTS.NAVIGATION.EXPENSES, icon: Receipt },
    { id: 'reports', label: TEXTS.NAVIGATION.REPORTS, icon: FileText },
    { id: 'import', label: TEXTS.NAVIGATION.IMPORT, icon: Upload },
    { id: 'collaboration', label: TEXTS.NAVIGATION.COLLABORATION, icon: Share2 },
    { id: 'settings', label: TEXTS.NAVIGATION.SETTINGS, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-50 transform transition-transform duration-300 ease-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="h-20 flex items-center mb-6 pl-2">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mr-3 shadow-glow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">{TEXTS.APP.NAME}<span className="text-primary-600">{TEXTS.APP.NAME_HIGHLIGHT}</span></span>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-100 ring-1 ring-gray-200/50' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 stroke-[2px] transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                {TEXTS.APP.USER_NAME.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-xs font-bold text-primary-900">{TEXTS.APP.USER_NAME}</p>
                <p className="text-[10px] font-semibold text-primary-600">{TEXTS.APP.USER_PLAN}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white lg:rounded-l-[32px] shadow-2xl shadow-gray-200/50 relative z-10 border-l border-gray-200/60">
        {/* Mobile Header */}
        <header className="bg-white/90 backdrop-blur-md lg:hidden h-16 flex items-center px-4 justify-between sticky top-0 z-30 border-b border-gray-100">
          <div className="flex items-center">
             <span className="font-extrabold text-gray-900 tracking-tight">{TEXTS.APP.NAME}<span className="text-primary-600">{TEXTS.APP.NAME_HIGHLIGHT}</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
