import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Mail, Bell, User, PenSquare, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const SidebarLeft = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Messages', path: '/chat', icon: Mail },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      <style>{`
        @keyframes navIconBounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .nav-icon-active {
          animation: navIconBounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-accent-dot {
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: #FF6B4A;
          box-shadow: 0 0 8px rgba(255,107,74,0.6);
        }
        .sidebar-logo {
          background: linear-gradient(135deg, #FF6B4A, #FF3CAC);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mobile-nav-indicator {
          width: 20px;
          height: 3px;
          border-radius: 2px;
          background: #FF6B4A;
          box-shadow: 0 0 10px rgba(255,107,74,0.5);
        }
      `}</style>

      {/* ─── DESKTOP / TABLET SIDEBAR ─── */}
      <header className="hidden sm:flex sticky top-0 h-screen w-20 xl:w-72 flex-col pt-6 pb-6 px-3 xl:px-5 border-r border-[#1e1e1e] bg-[#0a0a0a] z-40">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center xl:justify-start xl:px-3 mb-10">
          <span className="text-3xl font-bold tracking-tight sidebar-logo hidden xl:block">
            Wattgram
          </span>
          <span className="text-3xl font-bold tracking-tight sidebar-logo xl:hidden">
            W
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-center xl:justify-start gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-[#1a1a1a] text-[#E8E6E3]' 
                    : 'text-[#8A8A8A] hover:bg-[#111111] hover:text-[#E8E6E3]'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.6)]" />
                )}
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all ${isActive ? 'text-[#FF6B4A]' : ''}`}
                />
                <span className={`hidden xl:inline text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Post Button */}
          <button
            className="w-12 h-12 mt-6 xl:w-full flex items-center justify-center gap-2 bg-[#FF6B4A] hover:bg-[#FF8566] text-white rounded-xl p-2.5 font-bold text-[15px] transition-all mx-auto xl:mx-0 shadow-[0_4px_20px_rgba(255,107,74,0.3)] hover:shadow-[0_6px_28px_rgba(255,107,74,0.4)] hover:-translate-y-0.5 active:scale-95"
            title="Create Post"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <PenSquare size={20} className="xl:hidden" />
            <span className="hidden xl:inline">Post</span>
          </button>
        </nav>

        {/* Bottom: Logout */}
        <div className="mt-auto pt-4 border-t border-[#1e1e1e]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center xl:justify-start gap-4 px-3 py-3 rounded-xl hover:bg-[#111111] transition-all text-[#555] hover:text-[#FF4757] font-medium"
            title="Log Out"
          >
            <LogOut size={22} strokeWidth={1.8} />
            <span className="hidden xl:inline text-[14px]">Log out</span>
          </button>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM NAVIGATION ─── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-[#1e1e1e] z-50 flex items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              {isActive && (
                <div className="absolute top-0 mobile-nav-indicator" />
              )}
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={24}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#FF6B4A]' : 'text-[#555]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.div>
              <span className={`text-[10px] mt-1 font-mono tracking-wide ${
                isActive ? 'text-[#FF6B4A] font-bold' : 'text-[#555]'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
