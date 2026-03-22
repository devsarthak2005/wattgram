import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import './BlogDetail.css';

export const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`, { headers })
      .then(res => res.json())
      .then(data => {
          setBlog(data);
          setLikes(data.likesCount || 0);
          setHasLiked(data.likedByCurrentUser || false);
      })
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}/comments`, { headers })
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!blog) return <div className="blog-detail-container">Loading...</div>;

  const handleLike = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to like this blog");
        return;
    }
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
        if(res.ok) {
            setLikes(hasLiked ? likes - 1 : likes + 1);
            setHasLiked(!hasLiked);
        }
    });
  };

  const handleCommentSubmit = () => {
    if(!newComment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to comment");
        return;
    }
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
    }).then(res => res.json())
      .then(data => {
          setComments([...comments, data]);
          setNewComment('');
      });
  };

  return (
    <article className="blog-detail-container">
      <header className="blog-header">
        <h1 className="blog-title">{blog.title}</h1>
        
        <div className="blog-author-block">
          <div className="author-avatar">{blog.authorName ? blog.authorName.charAt(0).toUpperCase() : 'U'}</div>
          <div className="author-info">
            <Link to={`/profile/${blog.authorName}`} className="author-name" style={{ textDecoration: 'none', color: 'inherit' }}>
              {blog.authorName}
            </Link>
            <div className="author-meta">
              <span className="blog-date">{new Date(blog.date).toLocaleDateString()}</span>
              <span>·</span>
              <span>5 min read</span>
            </div>
          </div>
        </div>

        <div className="blog-actions">
          <div className="action-group">
            <button className={`action-btn ${hasLiked ? 'liked' : ''}`} onClick={handleLike}>
              <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{likes}</span>
            </button>
            <button className="action-btn">
              <MessageCircle size={20} />
              <span>{comments.length}</span>
            </button>
          </div>
          <div className="action-group">
            <button className="action-btn"><Share2 size={20} /></button>
            <button className="action-btn"><MoreHorizontal size={20} /></button>
          </div>
        </div>
      </header>
      
      {blog.image && (
        <div className="blog-cover-image" style={{ marginBottom: '2rem' }}>
          <img src={blog.image} alt={blog.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />
        </div>
      )}

      <div className="blog-content">
        <p className="blog-lead">{blog.preview}</p>
        <p>{blog.content}</p>
      </div>

      <hr className="blog-divider" />
      
      <section className="comments-section">
        <h3>Responses ({comments.length})</h3>
        <div className="comment-box">
          <textarea 
             placeholder="What are your thoughts?" 
             className="comment-input"
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
          ></textarea>
          <div className="comment-actions">
            <Button size="sm" onClick={handleCommentSubmit}>Respond</Button>
          </div>
        </div>
        <div className="comments-list" style={{ marginTop: '2rem' }}>
          {comments.map(c => (
             <div key={c.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                   <Link to={`/profile/${c.authorName}`} style={{ textDecoration: 'none', color: 'inherit' }}>{c.authorName}</Link>
                   <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem'}}>{new Date(c.date).toLocaleDateString()}</span>
                </div>
                <div>{c.content}</div>
             </div>
          ))}
        </div>
      </section>
    </article>
  );
};
