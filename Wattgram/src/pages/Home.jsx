import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/getImageUrl';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { CreatePostInline } from '../components/CreatePostInline';

export const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentingBlog, setCommentingBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [likeAnimating, setLikeAnimating] = useState({});

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

  const handleLike = useCallback((e, blogId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to like this blog");
      return;
    }
    
    // Trigger animation
    setLikeAnimating(prev => ({ ...prev, [blogId]: true }));
    setTimeout(() => setLikeAnimating(prev => ({ ...prev, [blogId]: false })), 600);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
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
  }, []);

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
    if (!commentText.trim() || !commentingBlog) return;
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
        if (b.id === commentingBlog.id) {
          return { ...b, commentsCount: (b.commentsCount || 0) + 1 };
        }
        return b;
      }));
      setIsCommentModalOpen(false);
      setCommentingBlog(null);
      setCommentText('');
    }).catch(err => console.error("Error posting comment:", err));
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 0.8
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <style>{`
        .post-card {
          transition: box-shadow 0.4s ease, border-color 0.4s ease, transform 0.3s ease;
        }
        .post-card:hover {
          box-shadow: 0 0 40px rgba(255,107,74,0.06), 0 8px 32px rgba(0,0,0,0.3);
          border-color: #2a2a2a;
          transform: translateY(-2px);
        }
        .like-btn-magnetic {
          transition: all 0.15s ease;
        }
        .like-btn-magnetic:hover {
          transform: scale(1.15);
        }
        .like-btn-magnetic:active {
          transform: scale(0.9);
        }
        .heart-pulse {
          animation: heartPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .heart-burst::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          animation: heartBurst 0.5s ease-out forwards;
        }
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background: rgba(255,107,74,0.08);
          color: #FF6B4A;
          transform: scale(1.05);
        }
        .tab-indicator {
          background: #FF6B4A;
          box-shadow: 0 0 12px rgba(255,107,74,0.5);
        }
      `}</style>

      {/* Sticky Top Header */}
      <header 
        className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1e1e1e] px-5 pt-5 pb-0 cursor-pointer" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="flex gap-8 pb-0">
          {['Curated', 'Following', 'Recent'].map((tab, i) => (
            <button 
              key={tab}
              className={`relative text-[11px] font-bold tracking-[0.15em] uppercase pb-3 transition-colors font-mono
                ${i === 0 
                  ? 'text-[#E8E6E3]' 
                  : 'text-[#555] hover:text-[#8A8A8A]'
                }`}
            >
              {tab}
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] tab-indicator rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Inline Create Post */}
      <CreatePostInline onPostCreated={handlePostCreated} />

      {/* Feed — Masonry Layout */}
      <div className="flex-1 px-3 sm:px-0">
        <motion.div
          className="masonry-feed pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {blogs.map((blog, index) => {
              const authorText = blog.authorName || blog.author?.name || 'Anonymous';
              const handleText = `@${authorText.toLowerCase().replace(/\s+/g, '')}`;

              return (
                <motion.div
                  key={blog.id}
                  variants={cardVariants}
                  layout
                >
                  <div className="post-card bg-[#111111] rounded-2xl border border-[#1e1e1e] overflow-hidden">
                    <Link to={`/blog/${blog.id}`} className="block cursor-pointer">
                      
                      {/* Image first for visual impact */}
                      {blog.image && (
                        <div className="relative w-full overflow-hidden bg-[#1a1a1a]">
                          <img
                            src={getImageUrl(blog.image)}
                            alt="Post Media"
                            className="w-full h-auto object-cover"
                            style={{ maxHeight: '400px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.parentElement) {
                                e.target.parentElement.style.display = 'none';
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                        </div>
                      )}

                      <div className="p-5">
                        {/* Author Row */}
                        <div className="flex items-center gap-3 mb-4">
                          {/* Avatar with story ring */}
                          <div className="story-ring flex-shrink-0" style={{ padding: '2px' }}>
                            <div className="story-ring-inner">
                              <div className="w-9 h-9 rounded-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
                                {(blog.authorProfilePicture || blog.author?.profilePicture) ? (
                                  <img src={getImageUrl(blog.authorProfilePicture || blog.author?.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-[#FF6B4A] text-xs">{authorText.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[#E8E6E3] text-[13px] block leading-tight">{authorText}</span>
                            <span className="text-[11px] text-[#555] font-mono">{handleText} · {formatDate(blog.date)}</span>
                          </div>
                          
                          <button className="text-[#333] hover:text-[#8A8A8A] transition-colors p-1 rounded-lg hover:bg-[#1a1a1a]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                          </button>
                        </div>

                        {/* Content */}
                        <h2 className="text-lg font-bold text-[#E8E6E3] mb-2 leading-snug tracking-tight">
                          {blog.title || 'Untitled'}
                        </h2>
                        <div className="text-[14px] text-[#8A8A8A] w-full break-words whitespace-pre-wrap leading-relaxed mb-1">
                          {blog.preview || blog.content ? (String(blog.preview || blog.content).substring(0, 120) + '…') : ''}
                        </div>
                      </div>
                    </Link>

                    {/* Action Bar */}
                    <div className="flex items-center gap-1 px-5 pb-4 pt-1">
                      {/* Like Button — Magnetic */}
                      <button
                        className={`like-btn-magnetic relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg action-btn
                          ${blog.likedByCurrentUser ? 'text-[#FF4757]' : 'text-[#555]'}`}
                        onClick={(e) => handleLike(e, blog.id)}
                      >
                        <motion.div
                          animate={likeAnimating[blog.id] ? { scale: [1, 1.4, 0.9, 1.15, 1] } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className={`relative ${likeAnimating[blog.id] ? 'heart-burst' : ''}`}
                        >
                          <Heart 
                            size={16} 
                            fill={blog.likedByCurrentUser ? 'currentColor' : 'none'} 
                            className={likeAnimating[blog.id] ? 'heart-pulse' : ''}
                          />
                        </motion.div>
                        <span className="text-[12px] font-bold font-mono">{blog.likesCount || blog.likes?.length || 0}</span>
                      </button>

                      {/* Comment */}
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555] action-btn" 
                        onClick={(e) => openCommentModal(e, blog)}
                      >
                        <MessageCircle size={16} />
                        <span className="text-[12px] font-bold font-mono">{blog.commentsCount || blog.comments?.length || 0}</span>
                      </button>

                      {/* Share */}
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555] action-btn" 
                        onClick={(e) => {
                          e.preventDefault();
                          const url = window.location.origin + `/blog/${blog.id}`;
                          navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
                        }}
                      >
                        <Share size={16} />
                      </button>

                      {/* Bookmark — pushed right */}
                      <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555] action-btn">
                        <Bookmark size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {blogs.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">✦</div>
            <p className="text-lg font-bold text-[#E8E6E3] mb-2 tracking-tight">Welcome to Wattgram</p>
            <p className="text-[#555] text-sm font-mono">No posts yet. Be the first to share your vision.</p>
          </div>
        )}
      </div>

      {/* Comment Modal */}
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
            <div className="text-[13px] border-l-2 border-[#FF6B4A] pl-3 ml-2 text-[#8A8A8A] mb-2 font-mono">
              Replying to @{commentingBlog.authorName || commentingBlog.author?.username || 'user'}
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full bg-[#1a1a1a] text-[#E8E6E3] border border-[#1e1e1e] rounded-xl p-4 outline-none resize-none min-h-[100px] focus:border-[#FF6B4A] focus:shadow-[0_0_0_3px_rgba(255,107,74,0.15)] transition-all text-[14px] placeholder:text-[#444]"
          />
        </div>
      </Modal>
    </div>
  );
};
