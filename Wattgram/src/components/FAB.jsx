import React from 'react';
import { PenSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const FAB = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFabClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/create');
    }
  };

  return (
    <button
      onClick={handleFabClick}
      className="sm:hidden fixed bottom-[88px] right-4 w-14 h-14 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.5)] hover:bg-[var(--color-accent-hover)] transition-transform active:scale-95 z-50"
      title="Create Post"
    >
      <PenSquare size={26} fill="currentColor" className="opacity-90" />
    </button>
  );
};
