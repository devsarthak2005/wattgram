import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Mail, Bell, User, PenSquare } from 'lucide-react';

export const SidebarLeft = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Default to dark now based on dark-first theme
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Messages', path: '/chat', icon: Mail },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* --- DESKTOP / TABLET SIDEBAR --- */}
      <header className="hidden sm:flex sticky top-0 h-screen w-20 xl:w-64 flex-col pt-4 pb-6 px-2 xl:px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] z-40 transition-colors duration-200">
        <Link to="/" className="flex items-center justify-center xl:justify-start w-12 h-12 xl:w-auto xl:px-4 mb-8">
          <span className="text-3xl font-serif italic font-bold text-[var(--color-accent)] hidden xl:block">Curator</span>
          <span className="text-3xl font-serif italic font-bold text-[var(--color-accent)] xl:hidden">C</span>
        </Link>

        <nav className="flex-1 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors group ${isActive ? 'font-bold' : 'font-medium text-[var(--color-text-primary)]'}`}
              >
                <Icon size={28} className={isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)]'} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:inline text-xl">{item.name}</span>
              </Link>
            );
          })}

          {/* Post Button for Desktop */}
          <button 
            className="w-12 h-12 mt-8 xl:w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full p-2 font-medium text-[15px] transition-all mx-auto xl:mx-0 shadow-md"
            title="Create Post"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <PenSquare size={20} className="xl:hidden" />
            <span className="hidden xl:inline">Post</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          {/* Logout */}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-secondary)] font-medium"
            title="Log Out"
          >
            <User size={24} />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-t border-[var(--color-border)] z-50 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full text-[var(--color-text-primary)]"
            >
              <Icon 
                size={26} 
                className={isActive ? 'text-[var(--color-text-primary)] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-[var(--color-text-secondary)]'} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium text-[var(--color-text-secondary)]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

