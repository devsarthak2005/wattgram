import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { BlogDetail } from './pages/BlogDetail';
import { CreateBlog } from './pages/CreateBlog';
import { LoginSignup } from './pages/LoginSignup';
import { UserProfile } from './pages/UserProfile';
import { Explore } from './pages/Explore';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/create" element={<CreateBlog />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:username" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
