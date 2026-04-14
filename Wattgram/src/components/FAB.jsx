import React from 'react';
import { PenSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <motion.button
      onClick={handleFabClick}
      className="sm:hidden fixed bottom-[88px] right-4 w-14 h-14 bg-[#FF6B4A] text-white rounded-2xl flex items-center justify-center z-50"
      style={{
        boxShadow: '0 4px 24px rgba(255,107,74,0.4), 0 0 40px rgba(255,107,74,0.15)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9, rotate: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      title="Create Post"
    >
      <PenSquare size={24} strokeWidth={2} />
    </motion.button>
  );
};
