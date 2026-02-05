import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { PinProtection } from "./components/PinProtection";
import { 
  LayoutDashboard, 
  Users, 
  Facebook, 
  FileText,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import ToolsFounders from "./pages/ToolsFounders";
import Profiles from "./pages/Profiles";
import Templates from "./pages/Templates";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tools-founders", icon: Users, label: "Tools & Founders" },
  { path: "/profiles", icon: Facebook, label: "FB Profiles" },
  { path: "/templates", icon: FileText, label: "Templates" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-violet-700" data-testid="app-title">
              FounderReach
            </h1>
            <button 
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
              onClick={onClose}
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-violet-50 text-violet-700 border border-violet-200' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                  data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">
              Multi-Profile Outreach Manager
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
            data-testid="open-sidebar-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="ml-3 text-lg font-bold text-violet-700">FounderReach</h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <PinProtection>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tools-founders" element={<ToolsFounders />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/templates" element={<Templates />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </PinProtection>
  );
}

export default App;
