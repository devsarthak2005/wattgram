import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Link } from 'react-router-dom';
import './Explore.css';

export const Explore = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/explore`)
      .then(res => res.json())
      .then(data => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching explore blogs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1 className="explore-title">Explore</h1>
        <p className="explore-subtitle">Discover random stories from writers you might like.</p>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="blog-feed">
          {blogs.map(blog => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card-link">
              <Card className="blog-card">
                <CardHeader title={blog.title} authorDetails={blog.authorName || (blog.author && blog.author.username)} meta={blog.date} />
                <CardContent>
                  <p>{blog.preview}</p>
                  <span className="blog-category">{blog.category}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
          {blogs.length === 0 && (
            <div className="empty-state">
              <p>No new blogs found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
