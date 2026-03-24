import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Design', 'Development', 'Typography', 'Life'];

  const [blogs, setBlogs] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`)
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
      setHasMoreUsers(false);
      return;
    }
    
    // When exactly searchQuery changes, reset page to 0
    setUserPage(0);
  }, [searchQuery]);

  React.useEffect(() => {
    if (searchQuery.trim() === '') return;

    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users?keyword=${searchQuery}&page=${userPage}&size=10`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (userPage === 0) {
          setUsers(data.content || []);
        } else {
          setUsers(prev => [...prev, ...(data.content || [])]);
        }
        setHasMoreUsers(!data.last);
      })
      .catch(err => console.error("Error fetching users:", err));
  }, [searchQuery, userPage]);

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
            {hasMoreUsers && (
              <button 
                onClick={() => setUserPage(p => p + 1)}
                style={{ padding: '0.8rem 1.2rem', background: 'transparent', border: '1px solid #333', borderRadius: '50px', cursor: 'pointer', fontWeight: '500' }}
              >
                Load More
              </button>
            )}
          </div>
        </div>
      )}

      <div className="blog-feed">
        {filteredBlogs.map(blog => (
          <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card-link">
            <Card className="blog-card">
              <CardHeader title={blog.title} authorDetails={blog.authorName || blog.author?.name} meta={blog.date} />
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
