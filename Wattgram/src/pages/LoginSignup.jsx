import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './LoginSignup.css';

export const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:8080/api/auth/login' : 'http://localhost:8080/api/auth/register';
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
    .then(data => {
      if (isLogin) {
        localStorage.setItem('token', data.accessToken);
        window.location.href = '/';
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    })
    .catch(err => alert(err.message));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Welcome back' : 'Join Wattgram'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Enter your details to access your account.' 
            : 'Create an account to start writing and reading stories.'}
        </p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
          
          <Button type="submit" className="auth-submit-btn" size="lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-switch">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button 
            className="auth-switch-btn" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
