import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/getImageUrl';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentingBlog, setCommentingBlog] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`)
      .then(res => {
        if (!res.ok) throw new Error('Server returned ' + res.status);
        return res.json();
      })
      .then(data => {
        setBlogs(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      });
  }, []);

  const handlePostCreated = (newPost) => {
    setBlogs(prev => [newPost, ...prev]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = (e, blogId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to like this blog");
        return;
    }
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
        if(res.ok) {
            setBlogs(prev => prev.map(b => {
                if (b.id === blogId) {
                    const hasLiked = b.likedByCurrentUser;
                    return {
                        ...b,
                        likedByCurrentUser: !hasLiked,
                        likesCount: hasLiked ? Math.max(0, (b.likesCount || 1) - 1) : (b.likesCount || 0) + 1
                    };
                }
                return b;
            }));
        }
    }).catch(err => console.error("Error liking blog:", err));
  };

  const openCommentModal = (e, blog) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to comment");
        return;
    }
    setCommentingBlog(blog);
    setCommentText('');
    setIsCommentModalOpen(true);
  };

  const submitComment = () => {
    if(!commentText.trim() || !commentingBlog) return;
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${commentingBlog.id}/comments`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText })
    }).then(res => {
        if (!res.ok) throw new Error("Failed to post comment");
        return res.json();
    }).then(() => {
        setBlogs(prev => prev.map(b => {
            if(b.id === commentingBlog.id) {
                return { ...b, commentsCount: (b.commentsCount || 0) + 1 };
            }
            return b;
        }));
        setIsCommentModalOpen(false);
        setCommentingBlog(null);
        setCommentText('');
    }).catch(err => console.error("Error posting comment:", err));
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/90 backdrop-blur-md p-4 cursor-pointer mb-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="flex gap-6 mt-2 pb-2">
          <button className="text-[11px] font-bold tracking-widest uppercase border-b-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] pb-1">Curated For You</button>
          <button className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pb-1 transition-colors">Following</button>
          <button className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pb-1 transition-colors">Recent</button>
        </div>
      </header>

      {/* Inline Create Post Component */}
      <CreatePostInline onPostCreated={handlePostCreated} />

      {/* Feed */}
      <div className="flex-1">
        <AnimatePresence>
          {blogs.map(blog => {
            const authorText = blog.authorName || blog.author?.name || 'Anonymous';
            const handleText = `@${authorText.toLowerCase().replace(/\s+/g, '')}`;
            
            return (
              <motion.div 
                key={blog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-[var(--color-bg-tertiary)] p-6 rounded-2xl shadow-sm mb-6 max-w-2xl mx-auto border border-transparent hover:border-[var(--color-border)] transition-all">
                  <Link to={`/blog/${blog.id}`} className="block cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[var(--color-bg-secondary)] overflow-hidden flex items-center justify-center">
                         {(blog.authorProfilePicture || blog.author?.profilePicture) ? (
                           <img src={getImageUrl(blog.authorProfilePicture || blog.author?.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           <span className="font-bold text-[var(--color-text-secondary)]">{authorText.charAt(0).toUpperCase()}</span>
                         )}
                      </div>
                      
                      {/* Author Info */}
                      <div className="flex-1 min-w-0 flex items-center justify-between text-[13px]">
                        <div>
                          <span className="font-bold text-[var(--color-text-primary)] hover:underline block">{authorText}</span>
                          <span className="text-[var(--color-text-secondary)]">{handleText} · {formatDate(blog.date)}</span>
                        </div>
                        <button className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="min-w-0 mt-2">
                      <h2 className="text-2xl font-serif text-[var(--color-text-primary)] mb-2 leading-tight">
                        {blog.title || 'Untitled Narrative'}
                      </h2>
                      <div className="text-[15px] font-base text-[var(--color-text-secondary)] w-full break-words whitespace-pre-wrap leading-relaxed mb-4">
                        {blog.preview || blog.content ? (String(blog.preview || blog.content).substring(0, 150) + '...') : ''}
                      </div>

                      {blog.image && (
                        <div className="relative w-full rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] aspect-[4/3] sm:aspect-video">
                          <img 
                            src={getImageUrl(blog.image)} 
                            alt="Post Media" 
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.style.display = 'none'; 
                              if (e.target.parentElement) {
                                e.target.parentElement.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Action buttons */}
                  <div className="flex items-center gap-6 mt-4 text-[var(--color-text-tertiary)] max-w-sm">
                    <button 
                      className={`flex items-center gap-1.5 group p-0 m-0 ${blog.likedByCurrentUser ? 'text-[var(--color-danger)]' : 'hover:text-[var(--color-text-primary)]'}`} 
                      onClick={(e) => handleLike(e, blog.id)}>
                      <Heart size={16} fill={blog.likedByCurrentUser ? 'currentColor' : 'none'} className="transition-all" />
                      <span className="text-xs font-semibold">{blog.likesCount || blog.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 group p-0 m-0 hover:text-[var(--color-text-primary)] transition-colors" onClick={(e) => openCommentModal(e, blog)}>
                      <MessageCircle size={16} />
                      <span className="text-xs font-semibold">{blog.commentsCount || blog.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 group p-0 m-0 hover:text-[var(--color-text-primary)] transition-colors" onClick={(e) => {
                        e.preventDefault();
                        const url = window.location.origin + `/blog/${blog.id}`;
                        navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard!"));
                    }}>
                      <Share size={16} />
                      <span className="text-xs font-semibold">{blog.sharesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {blogs.length === 0 && (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">
            <p className="text-lg font-bold mb-2">Welcome to Wattgram!</p>
            <p>No posts yet. Be the first to share your thoughts above.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isCommentModalOpen} 
        onClose={() => {
            setIsCommentModalOpen(false);
            setCommentingBlog(null);
        }}
        title="Post your reply"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCommentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitComment} disabled={!commentText.trim()}>Reply</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
            {commentingBlog && (
                <div className="text-[15px] border-l-2 border-[var(--color-border)] pl-3 ml-2 text-[var(--color-text-secondary)] mb-2">
                    Replying to @{commentingBlog.authorName || commentingBlog.author?.username || 'user'}
                </div>
            )}
            <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post your reply"
                className="w-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-xl p-3 outline-none resize-none min-h-[100px]"
            />
        </div>
      </Modal>
    </div>
  );
};
