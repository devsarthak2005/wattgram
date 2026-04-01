import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Home } from './pages/Home';
import { BlogDetail } from './pages/BlogDetail';
import { CreateBlog } from './pages/CreateBlog';
import { LoginSignup } from './pages/LoginSignup';
import { UserProfile } from './pages/UserProfile';
import { Explore } from './pages/Explore';
import { Chat } from './pages/Chat';
import { FAB } from './components/FAB';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
        <div className="max-w-[1265px] mx-auto flex justify-center">
          {/* Left Sidebar / Bottom Nav */}
          <SidebarLeft />

          {/* Main Feed/Content */}
          <main className="w-full sm:w-[600px] sm:min-w-[600px] border-x border-[var(--color-border)] min-h-screen pb-20 sm:pb-0 relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/create" element={<CreateBlog />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/:username" element={<UserProfile />} />
            </Routes>
          </main>

          {/* Right Sidebar */}
          <SidebarRight />
        </div>
        
        {/* Mobile Floating Action Button */}
        <FAB />
      </div>
    </Router>
  );
}

export default App;
