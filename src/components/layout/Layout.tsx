import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Settings2, 
  History, 
  FileText, 
  Settings,
  Activity,
  MessageSquareWarning,
  Factory
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentSessionId = useAppStore(state => state.currentSessionId);

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'New CAD Analysis', path: '/cad-upload', icon: UploadCloud },
    { name: 'Component Library', path: '/library', icon: Factory },
    { 
      name: 'Parameter Recommendations', 
      path: currentSessionId ? `/recommendations/${currentSessionId}` : '#', 
      icon: Settings2,
      disabled: !currentSessionId
    },
    { 
      name: 'Trial & Defect Feedback', 
      path: currentSessionId ? `/feedback/${currentSessionId}` : '#', 
      icon: MessageSquareWarning,
      disabled: !currentSessionId
    },
    { name: 'Optimization History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Machine Profiles', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <Activity className="text-cyan-400" />
            <h1 className="font-bold text-xl tracking-tight">CastPilot AI</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">HPDC Process Intelligence</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.disabled ? (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 cursor-not-allowed">
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        isActive
                          ? 'bg-teal-600/20 text-teal-400'
                          : 'hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 text-xs flex items-center justify-between">
            <div>
              <p className="text-slate-300 font-medium">System Online</p>
              <p className="text-slate-500 font-mono mt-0.5">v2.4.1-prod</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {currentSessionId && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-md border border-teal-100 font-semibold flex items-center gap-2">
                <Activity size={14} />
                Active Analysis: {currentSessionId.split('_')[1]}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border border-teal-200">
              EN
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
