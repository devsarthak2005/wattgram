import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, MessageCircle, User, Moon, Sun, LogOut, PenSquare } from 'lucide-react';

export const SidebarLeft = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
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
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 h-screen w-20 xl:w-64 flex flex-col pt-4 pb-6 px-2 xl:px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] z-40 transition-colors duration-200">
      <Link to="/" className="flex items-center justify-center xl:justify-start w-12 h-12 xl:w-auto xl:px-4 mb-4 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
        <span className="text-2xl font-bold text-[var(--color-accent)] hidden xl:block">Wattgram</span>
        <span className="text-2xl font-bold text-[var(--color-accent)] xl:hidden">W</span>
      </Link>

      <nav className="flex-1 space-y-2">
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
      </nav>

      <div className="mt-auto space-y-4">
        {/* Post Button */}
        <button 
          className="w-12 h-12 xl:w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full p-3 font-bold text-[17px] shadow-sm transition-colors mx-auto xl:mx-0"
          title="Create Post"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Optionally focus on the create post textarea from here
          }}
        >
          <PenSquare size={24} className="xl:hidden" />
          <span className="hidden xl:inline">Post</span>
        </button>

        <div className="flex flex-col gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-primary)] font-medium" 
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            <span className="hidden xl:inline">Theme</span>
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-danger)] font-medium"
            title="Log Out"
          >
            <LogOut size={24} />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
