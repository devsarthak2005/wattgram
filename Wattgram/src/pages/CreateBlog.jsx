import React, { useState } from 'react';
import { RichTextEditor } from '../components/RichTextEditor';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  
  const handlePublish = async (isDraft = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login first");
      return;
    }
    
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
        if(uploadRes.ok) {
          imageUrl = await uploadRes.text();
        } else {
          alert('Image upload failed');
          return;
        }
      } catch (e) {
        alert('Image upload failed');
        return;
      }
    }
    
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title, 
        preview: content.substring(0, 100) + "...", 
        content, 
        category: "Development",
        image: imageUrl,
        draft: isDraft
      })
    })
    .then(res => {
      if(!res.ok) throw new Error('Failed to publish');
      return res.json();
    })
    .then(data => {
      navigate(`/blog/${data.id}`);
    })
    .catch(err => alert(err.message));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--color-bg-primary)] p-4 md:p-6 lg:p-8">
      {/* Header / Actions */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--color-border)]">
        <input 
          type="text" 
          className="flex-1 bg-transparent border-none outline-none text-4xl font-serif text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] placeholder-opacity-50" 
          placeholder="New Entry Title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button 
            className="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium transition-colors" 
            onClick={() => handlePublish(true)}
          >
            Draft
          </button>
          <button 
            className="px-8 py-2 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] rounded-full font-medium transition-colors shadow-sm tracking-wide"
            onClick={() => handlePublish(false)}
          >
            Publish
          </button>
        </div>
      </header>

      {/* Cover Image Upload */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Cover Image</label>
        <input 
           type="file" 
           accept="image/*" 
           onChange={(e) => setImageFile(e.target.files[0])} 
           className="text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-bg-tertiary)] file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-bg-secondary)] file:transition-colors cursor-pointer"
        />
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 rounded-2xl p-2 min-h-[500px]">
         {/* Using simple textarea for now if RichTextEditor relies on missing css, but assuming it uses its own styling */}
         <RichTextEditor value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
    </div>
  );
};
