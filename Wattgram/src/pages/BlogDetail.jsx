import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, ArrowLeft, Repeat2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/getImageUrl';

export const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
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

  if (!blog) return <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">Loading post...</div>;

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
          setComments([data, ...comments]);
          setNewComment('');
      });
  };

  const handleShare = () => {
    const url = window.location.origin + `/blog/${blog.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  const authorText = blog.authorName || (blog.author && blog.author.username) || 'Anonymous';
  const handleText = `@${authorText.toLowerCase().replace(/\s+/g, '')}`;

  const formatDate = (dateString, full = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (full) {
      return date.toLocaleDateString('en-US', { hour: 'numeric', minute: 'numeric', year: 'numeric', month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--color-bg-primary)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/90 backdrop-blur-md p-4 flex items-center gap-6 cursor-pointer mb-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">Narrative</h1>
      </header>
      
      {/* Main Post Content */}
      {/* Main Post Content */}
      <article className="px-4 sm:px-8 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-text-primary)] leading-tight mb-6">
          {blog.title || 'Untitled'}
        </h1>

        {blog.image && (
          <div className="mb-10 w-full bg-[var(--color-bg-secondary)] overflow-hidden rounded-2xl relative aspect-[21/9]">
            <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; if(e.target.parentElement) e.target.parentElement.style.display='none'; }} />
          </div>
        )}

        {/* Author Header */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-[var(--color-border)]">
          <Link to={`/profile/${authorText}`} className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
               {authorText.charAt(0).toUpperCase()}
            </div>
            <div>
               <div className="font-bold text-[15px] text-[var(--color-text-primary)] group-hover:underline uppercase tracking-wider">{authorText}</div>
               <div className="text-[13px] text-[var(--color-text-secondary)]">{formatDate(blog.date, true)}</div>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
            <button className="hover:text-[var(--color-text-primary)] transition-colors" onClick={handleShare}>
              <Share2 size={18} />
            </button>
            <button className="hover:text-[var(--color-text-primary)] transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Post Body (Drop cap style for first letter, generic otherwise) */}
        <div className="text-[17px] sm:text-[19px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words mt-2 font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
          {blog.content || blog.preview}
        </div>

        {/* Post Actions Sub-footer */}
        <div className="flex items-center justify-start gap-8 py-8 mt-12 border-t border-[var(--color-border)] text-[var(--color-text-secondary)]">
          <button 
            className={`flex items-center gap-2 group transition-colors hover:text-[var(--color-text-primary)] ${hasLiked ? 'text-[var(--color-danger)]' : ''}`} 
            onClick={handleLike}
          >
            <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} className="transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold">{likes} Likes</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <span className="text-sm font-semibold">{comments.length} Reflections</span>
          </div>
        </div>
      </article>

      {/* Reflections Area */}
      <div className="bg-[var(--color-bg-secondary)] py-12 px-4 sm:px-8 border-t border-[var(--color-border)] flex-1">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-2xl font-serif font-bold mb-8 text-[var(--color-text-primary)]">Reflections</h2>
          
          {/* Reply Input Area */}
          <div className="bg-[var(--color-bg-tertiary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-10 flex gap-4 items-start border border-transparent hover:border-[var(--color-border)] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
               U
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <textarea 
                placeholder="Share your reflection..." 
                className="w-full bg-transparent border-none outline-none text-[15px] font-base text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] resize-none"
                value={newComment}
                rows={2}
                onChange={e => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button 
                  className="px-6 py-2 bg-[var(--color-accent)] text-white font-medium rounded-full disabled:opacity-50 transition-all shadow-sm"
                  disabled={!newComment.trim()}
                  onClick={handleCommentSubmit}
                >
                  Publish
                </button>
              </div>
            </div>
          </div>

      {/* Comments Feed */}
          <div className="flex flex-col gap-6">
            {comments.map(c => {
               const commentAuthor = c.authorName || 'User';
               const commentHandle = `@${commentAuthor.toLowerCase().replace(/\s+/g, '')}`;
               return (
                 <motion.div 
                   key={c.id} 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   className="bg-[var(--color-bg-tertiary)] p-6 rounded-2xl shadow-sm border border-transparent hover:border-[var(--color-border)] transition-colors"
                 >
                   <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
                       {commentAuthor.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-2">
                         <Link to={`/profile/${commentAuthor}`} className="font-bold text-[13px] text-[var(--color-text-primary)] hover:underline block uppercase tracking-wider">{commentAuthor}</Link>
                         <span className="text-[13px] text-[var(--color-text-secondary)]">{formatDate(c.date)}</span>
                       </div>
                       <div className="text-[15px] font-base text-[var(--color-text-primary)] whitespace-pre-wrap break-words leading-relaxed">
                         {c.content}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
