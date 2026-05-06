import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, UploadCloud, Hexagon } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={18} /> },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: <BookOpen size={18} /> },
  ];

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col text-gray-100 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <nav className="glass-panel sticky top-0 z-50 border-b-0 border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="relative flex items-center justify-center w-10 h-10">
                  <Hexagon size={32} className="text-primary-500 absolute animate-glow-pulse" />
                  <div className="w-2 h-2 bg-secondary-500 rounded-full z-10 animate-ping"></div>
                </div>
                <span className="text-xl font-bold tracking-tight neon-text">KBA Nexus</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center px-4 py-2 mt-3 mb-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-200">{user.username}</span>
                <span className="text-xs text-primary-400 uppercase tracking-wider font-bold">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
