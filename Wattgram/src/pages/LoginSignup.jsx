import React, { useState } from 'react';
import { Input } from '../components/Input';
import { motion } from 'framer-motion';

export const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isLogin ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/login` : `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`;
    const payload = isLogin
      ? { usernameOrEmail: email, password }
      : { name, username, email, password };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text() || 'Authentication failed');
        if (isLogin) return res.json();
        return res.text();
      })
      .then(async data => {
        if (isLogin) {
          localStorage.setItem('token', data.accessToken);
          try {
            const userRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
              headers: { 'Authorization': `Bearer ${data.accessToken}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (e) {
            console.error("Failed to fetch user profile during login", e);
          }
          window.location.href = '/';
        } else {
          alert('Registration successful! Please login.');
          setIsLogin(true);
        }
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      <style>{`
        .auth-gradient-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(255,107,74,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(120,75,160,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(43,134,197,0.04) 0%, transparent 50%);
          animation: gradientShift 12s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .auth-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(17,17,17,0.8);
          border: 1px solid rgba(30,30,30,0.8);
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.5),
            0 0 80px rgba(255,107,74,0.03),
            inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .auth-submit {
          background: linear-gradient(135deg, #FF6B4A 0%, #FF3CAC 100%);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255,107,74,0.3);
        }
        .auth-submit:hover {
          box-shadow: 0 6px 30px rgba(255,107,74,0.4);
          transform: translateY(-1px);
        }
        .auth-submit:active {
          transform: translateY(0) scale(0.98);
        }
        .logo-glow {
          box-shadow: 0 0 30px rgba(255,107,74,0.3), 0 0 60px rgba(255,107,74,0.1);
        }
      `}</style>

      {/* Animated gradient background */}
      <div className="auth-gradient-bg" />

      <motion.div 
        className="w-full max-w-[420px] auth-card rounded-2xl p-8 sm:p-10 relative z-10"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-[#FF6B4A] rounded-2xl flex items-center justify-center mb-6 logo-glow">
            <span className="text-white font-bold text-2xl tracking-tight">W</span>
          </div>
          <motion.h2 
            className="text-2xl font-bold text-[#E8E6E3] mb-2 tracking-tight"
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '0.5rem' }}
          >
            {isLogin ? 'Welcome back' : 'Join Wattgram'}
          </motion.h2>
          <p className="text-[14px] text-[#555] font-mono">
            {isLogin
              ? 'Enter your credentials to continue.'
              : 'Create an account to start creating.'}
          </p>
        </div>

        <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <Input
                label="Full Name"
                placeholder="Eleanor Shellstrop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                required
              />
              <Input
                label="Username"
                placeholder="eleanors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                required
              />
            </>
          )}
          <Input
            label="Email"
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full mt-5 py-3.5 auth-submit text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 tracking-wide"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#1e1e1e] text-center text-[14px] flex items-center justify-center gap-2">
          <span className="text-[#555]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            className="font-bold text-[#FF6B4A] hover:text-[#FF8566] transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
