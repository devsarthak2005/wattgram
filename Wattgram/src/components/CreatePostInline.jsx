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
    <div className="border-b border-[#1e1e1e] p-5 flex gap-4 bg-[#0a0a0a]">
      <style>{`
        .compose-area {
          transition: border-color 0.3s ease;
        }
        .compose-area:focus-within {
          border-color: #2a2a2a;
        }
        .compose-btn {
          transition: all 0.2s ease;
        }
        .compose-btn:hover {
          color: #FF6B4A;
          background: rgba(255,107,74,0.08);
          transform: scale(1.1);
        }
      `}</style>

      {/* User avatar placeholder */}
      <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#1e1e1e] flex-shrink-0 mt-1 flex items-center justify-center">
        <span className="text-[#FF6B4A] font-bold text-sm">✦</span>
      </div>

      <div className="flex-1">
        <textarea
          placeholder="Share something extraordinary…"
          className="w-full bg-transparent border-none resize-none outline-none text-[16px] min-h-[52px] text-[#E8E6E3] placeholder-[#333] leading-relaxed"
          rows={Math.max(2, content.split('\n').length)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {imageFile && (
          <div className="relative mt-3 mb-4 w-fit">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="max-h-56 rounded-xl object-contain border border-[#1e1e1e]"
            />
            <button
              className="absolute top-2 right-2 bg-[#0a0a0a]/80 text-white rounded-lg p-1.5 hover:bg-[#FF4757] transition-colors"
              onClick={() => setImageFile(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e] mt-2">
          <div className="flex gap-0.5 text-[#444]">
            <button
              className="p-2 rounded-lg compose-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Add Image"
            >
              <Image size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button className="p-2 rounded-lg compose-btn hidden sm:block">
              <Smile size={18} />
            </button>
            <button className="p-2 rounded-lg compose-btn hidden sm:block">
              <Calendar size={18} />
            </button>
            <button className="p-2 rounded-lg compose-btn hidden sm:block">
              <MapPin size={18} />
            </button>
          </div>

          <button
            className="px-5 py-2 rounded-xl font-bold text-[13px] bg-[#FF6B4A] text-white hover:bg-[#FF8566] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(255,107,74,0.25)] hover:shadow-[0_4px_20px_rgba(255,107,74,0.35)] hover:-translate-y-0.5 active:scale-95 tracking-wide"
            disabled={(!content.trim() && !imageFile) || isPublishing}
            onClick={handlePublish}
          >
            {isPublishing ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};
