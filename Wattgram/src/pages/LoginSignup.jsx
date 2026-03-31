import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

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
      if(!res.ok) throw new Error(await res.text() || 'Authentication failed');
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] p-4">
      <div className="w-full max-w-[440px] bg-[var(--color-bg-primary)] rounded-3xl p-8 sm:p-10 shadow-lg border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mb-6 shadow-sm">
             <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] mb-2 tracking-tight">
            {isLogin ? 'Welcome back' : 'Join Wattgram'}
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            {isLogin 
              ? 'Enter your details to access your account.' 
              : 'Create an account to start sharing and reading posts.'}
          </p>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
            label="Email Address" 
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
            className="w-full mt-4 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-full font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-[15px] flex items-center justify-center gap-2">
          <span className="text-[var(--color-text-secondary)]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            className="font-bold text-[var(--color-accent)] hover:text-blue-600 hover:underline transition-colors" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
