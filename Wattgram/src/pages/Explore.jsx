import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Repeat2, Heart, Share } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] p-4">
        <h1 className="text-xl font-bold">Explore</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Discover random stories from writers you might like.</p>
      </header>

      {loading ? (
        <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium z-0">Loading trending posts...</div>
      ) : (
        <div className="flex-1">
          <AnimatePresence>
            {blogs.map(blog => {
              const authorText = blog.authorName || (blog.author && blog.author.username) || 'Anonymous';
              const handleText = `@${authorText.toLowerCase().replace(/\s+/g, '')}`;

              return (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/blog/${blog.id}`} className="block border-b border-[var(--color-border)] p-4 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
                        {authorText.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[15px] mb-1">
                          <span className="font-bold text-[var(--color-text-primary)] hover:underline truncate">{authorText}</span>
                          <span className="text-[var(--color-text-secondary)] truncate">{handleText}</span>
                          <span className="text-[var(--color-text-secondary)]">·</span>
                          <span className="text-[var(--color-text-secondary)] hover:underline flex-shrink-0">{formatDate(blog.date)}</span>
                        </div>

                        <div className="text-[15px] text-[var(--color-text-primary)] w-full break-words whitespace-pre-wrap">
                          {blog.preview || blog.title}
                        </div>

                        {blog.image && (
                          <div className="mt-3 relative w-full pt-[56.25%] rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                            <img
                              src={getImageUrl(blog.image)}
                              alt="Post Media"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) e.target.parentElement.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 max-w-md text-[var(--color-text-secondary)]">
                          <button className="flex items-center gap-2 group p-0 m-0" onClick={(e) => e.preventDefault()}>
                            <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                              <MessageCircle size={18} />
                            </div>
                          </button>
                          <button className="flex items-center gap-2 group p-0 m-0" onClick={(e) => e.preventDefault()}>
                            <div className="p-2 -m-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                              <Repeat2 size={18} />
                            </div>
                          </button>
                          <button className="flex items-center gap-2 group p-0 m-0" onClick={(e) => e.preventDefault()}>
                            <div className="p-2 -m-2 rounded-full group-hover:bg-pink-500/10 group-hover:text-pink-500 transition-colors">
                              <Heart size={18} />
                            </div>
                          </button>
                          <button className="flex items-center gap-2 group p-0 m-0" onClick={(e) => e.preventDefault()}>
                            <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                              <Share size={18} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {blogs.length === 0 && (
            <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">
              <p>No new blogs found right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
