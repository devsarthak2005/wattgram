import React, { useState, useRef } from 'react';
import { Image, Smile, MapPin, Calendar } from 'lucide-react';

export const CreatePostInline = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  const handlePublish = async () => {
    if (!content.trim() && !imageFile) return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      alert("Please login first to post");
      return;
    }
    
    setIsPublishing(true);
    let imageUrl = null;
    
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      try {
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/images/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (uploadRes.ok) {
          imageUrl = await uploadRes.text();
        } else {
          alert('Image upload failed');
          setIsPublishing(false);
          return;
        }
      } catch (e) {
        alert('Image upload failed');
        setIsPublishing(false);
        return;
      }
    }
    
    // Auto-generate title from first few words of content
    const title = content.substring(0, 50).split('\n')[0] || "New Post";
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: title, 
          preview: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
          content: content, 
          category: "General",
          image: imageUrl,
          draft: false
        })
      });
      
      if (!res.ok) throw new Error('Failed to publish');
      
      const newPost = await res.json();
      setContent('');
      setImageFile(null);
      
      // Notify parent to append the new post
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="border-b border-[var(--color-border)] p-4 flex gap-4 bg-[var(--color-bg-primary)]">
      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 mt-1">
        {/* User avatar could go here */}
      </div>
      
      <div className="flex-1">
        <textarea 
          placeholder="What is happening?!"
          className="w-full bg-transparent border-none resize-none outline-none text-xl min-h-[52px] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
          rows={Math.max(2, content.split('\n').length)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {imageFile && (
          <div className="relative mt-2 mb-4 w-fit">
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Preview" 
              className="max-h-64 rounded-2xl object-contain border border-[var(--color-border)]"
            />
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 transition-colors"
              onClick={() => setImageFile(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-2">
          <div className="flex gap-1 text-[var(--color-accent)]">
            <button 
              className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              title="Add Image"
            >
              <Image size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            {/* Disabled mock buttons for Twitter-feel */}
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors hidden sm:block">
              <Smile size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors hidden sm:block">
              <Calendar size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors hidden sm:block">
              <MapPin size={20} />
            </button>
          </div>
          
          <button 
            className={`px-4 py-1.5 rounded-full font-bold text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={(!content.trim() && !imageFile) || isPublishing}
            onClick={handlePublish}
          >
            {isPublishing ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};
