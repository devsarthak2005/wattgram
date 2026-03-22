import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';
import { MockBlogData } from '../mockData';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Design', 'Development', 'Typography', 'Life'];

  const [blogs, setBlogs] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/blogs')
      .then(res => {
          if (!res.ok) throw new Error('Server returned ' + res.status);
          return res.json();
      })
      .then(data => setBlogs(Array.isArray(data) ? data : []))
      .catch(err => {
          console.error("Error fetching blogs:", err);
          setBlogs([]);
      });
  }, []);

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setUsers([]);
      return;
    }
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/users/search?query=${searchQuery}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  }, [searchQuery]);

  const filteredBlogs = blogs.filter(blog => {
    const titleMatch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const authorMatch = blog.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    return (titleMatch || authorMatch) && matchesCategory;
  });

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Your Daily Digest</h1>
        <p className="home-subtitle">Discover stories, thinking, and expertise from writers on any topic.</p>
      </div>

      <div className="home-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search blogs or users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {users.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Found Users</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {users.map(u => (
               <Link to={`/profile/${u.username}`} key={u.id} style={{ padding: '0.8rem 1.2rem', background: '#f0f0f0', borderRadius: '50px', textDecoration: 'none', color: '#333', fontWeight: '500' }}>
                 @{u.username} ({u.name || 'No Name'})
               </Link>
            ))}
          </div>
        </div>
      )}

      <div className="blog-grid">
        {filteredBlogs.map(blog => (
          <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card-link">
            <Card className="blog-card">
              <CardHeader title={blog.title} authorDetails={blog.author} meta={blog.date} />
              <CardContent>
                <p>{blog.preview}</p>
                <span className="blog-category">{blog.category}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredBlogs.length === 0 && (
          <div className="empty-state">
            <p>No blogs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
