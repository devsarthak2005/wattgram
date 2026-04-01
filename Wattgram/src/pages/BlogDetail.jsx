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
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] p-2 flex items-center gap-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </header>
      
      {/* Main Post Content */}
      <article className="p-4 border-b border-[var(--color-border)]">
        {/* Author Header */}
        <div className="flex items-center justify-between mb-3">
          <Link to={`/profile/${authorText}`} className="flex items-center gap-3 w-full group">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
               {authorText.charAt(0).toUpperCase()}
            </div>
            <div>
               <div className="font-bold text-[17px] text-[var(--color-text-primary)] group-hover:underline leading-tight">{authorText}</div>
               <div className="text-[15px] text-[var(--color-text-secondary)] leading-tight">{handleText}</div>
            </div>
          </Link>
          <button className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors flex-shrink-0">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Post Body */}
        <div className="text-[17px] text-[var(--color-text-primary)] leading-normal whitespace-pre-wrap break-words mt-2">
          {blog.preview && <span className="font-bold block mb-2">{blog.title}</span>}
          {blog.content || blog.preview}
        </div>

        {blog.image && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full bg-[var(--color-bg-secondary)] relative">
            <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full object-cover max-h-[500px]" onError={(e) => { e.target.style.display = 'none'; if(e.target.parentElement) e.target.parentElement.style.display='none'; }} />
          </div>
        )}

        {/* Post Metadata (Date/Views) */}
        <div className="text-[15px] text-[var(--color-text-secondary)] mt-4 py-4 border-b border-[var(--color-border)]">
          {formatDate(blog.date, true)} · <strong>{(likes * 2) + 24}</strong> Views
        </div>

        {/* Post Actions (Likes, Retweets, etc) */}
        <div className="flex items-center justify-around py-2 border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
          <button className="flex items-center gap-2 group p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors flex-1 justify-center">
            <MessageCircle size={22} />
            <span className="text-[15px]">{comments.length}</span>
          </button>
          <button className="flex items-center gap-2 group p-2 rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors flex-1 justify-center">
            <Repeat2 size={22} />
          </button>
          <button 
            className={`flex items-center gap-2 group p-2 rounded-full transition-colors flex-1 justify-center ${hasLiked ? 'text-pink-600' : 'hover:bg-pink-500/10 hover:text-pink-500'}`} 
            onClick={handleLike}
          >
            <Heart size={22} fill={hasLiked ? 'currentColor' : 'none'} />
            <span className="text-[15px]">{likes}</span>
          </button>
          <button className="flex items-center gap-2 group p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors flex-1 justify-center" onClick={handleShare}>
            <Share2 size={22} />
          </button>
        </div>
      </article>

      {/* Reply Input Area */}
      <div className="p-4 border-b border-[var(--color-border)] flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex-shrink-0"></div>
        <div className="flex-1 flex gap-2 items-center">
          <input 
            type="text" 
            placeholder="Post your reply" 
            className="flex-1 bg-transparent border-none outline-none text-[17px] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
          />
          <button 
            className="px-4 py-1.5 bg-[var(--color-accent)] text-white font-bold rounded-full disabled:opacity-50 transition-opacity"
            disabled={!newComment.trim()}
            onClick={handleCommentSubmit}
          >
            Reply
          </button>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="flex-1 pb-16">
        {comments.map(c => {
           const commentAuthor = c.authorName || 'User';
           const commentHandle = `@${commentAuthor.toLowerCase().replace(/\s+/g, '')}`;
           return (
             <motion.div 
               key={c.id} 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="p-4 border-b border-[var(--color-border)] flex gap-3 hover:bg-[var(--color-bg-secondary)] transition-colors"
             >
               <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
                 {commentAuthor.charAt(0).toUpperCase()}
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex flex-wrap items-center gap-1 text-[15px] mb-1 leading-tight">
                   <Link to={`/profile/${commentAuthor}`} className="font-bold text-[var(--color-text-primary)] hover:underline truncate">{commentAuthor}</Link>
                   <span className="text-[var(--color-text-secondary)] truncate">{commentHandle}</span>
                   <span className="text-[var(--color-text-secondary)]">·</span>
                   <span className="text-[var(--color-text-secondary)] hover:underline flex-shrink-0">{formatDate(c.date)}</span>
                 </div>
                 <div className="text-[15px] text-[var(--color-text-primary)] whitespace-pre-wrap break-words pb-2">
                   {c.content}
                 </div>
                 
                 <div className="flex items-center justify-between mt-1 text-[var(--color-text-secondary)] max-w-sm">
                    <button className="flex items-center gap-2 group p-0 m-0"><div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500"><MessageCircle size={16} /></div></button>
                    <button className="flex items-center gap-2 group p-0 m-0"><div className="p-2 -m-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-500"><Repeat2 size={16} /></div></button>
                    <button className="flex items-center gap-2 group p-0 m-0"><div className="p-2 -m-2 rounded-full group-hover:bg-pink-500/10 group-hover:text-pink-500"><Heart size={16} /></div></button>
                 </div>
               </div>
             </motion.div>
           );
        })}
      </div>
    </div>
  );
};
