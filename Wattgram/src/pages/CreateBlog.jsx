import React, { useState } from 'react';
import { RichTextEditor } from '../components/RichTextEditor';
import { Button } from '../components/Button';
import './CreateBlog.css';

export const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
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
        const uploadRes = await fetch('http://localhost:8080/api/images/upload', {
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
    
    fetch('http://localhost:8080/api/blogs', {
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
      window.location.href = `/blog/${data.id}`;
    })
    .catch(err => alert(err.message));
  };

  return (
    <div className="create-blog-container">
      <div className="create-blog-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
          <input 
            type="text" 
            className="create-blog-title" 
            placeholder="Title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{flex: 1}}
          />
          <div className="create-blog-actions">
            <Button variant="ghost" onClick={() => handlePublish(true)}>Save Draft</Button>
            <Button variant="primary" onClick={() => handlePublish(false)}>Publish</Button>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <label style={{fontSize: '0.875rem', fontWeight: '500'}}>Cover Image:</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>
      </div>
      
      <RichTextEditor value={content} onChange={(e) => setContent(e.target.value)} />
    </div>
  );
};
