import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import './UserProfile.css';

export const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isOwnProfile = !username && token;

  const [profile, setProfile] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('stories');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');

    // If viewing own profile and not logged in, redirect to login
    if (isOwnProfile && !token) {
      navigate('/login');
      return;
    }

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const profileUrl = isOwnProfile
      ? `${import.meta.env.VITE_API_BASE_URL}/api/users/me`
      : `${import.meta.env.VITE_API_BASE_URL}/api/users/${username}`;
    
    fetch(profileUrl, { headers })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid - clear it and redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Profile fetch failed');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setEditName(data.name || '');
        setEditBio(data.bio || '');
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          console.error(err);
          setProfile({ fetchError: true });
        }
      });

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`, { headers })
      .then(res => res.json())
      .then(data => setUserBlogs(Array.isArray(data) ? data : []))
      .catch(err => {
          console.error(err);
          setUserBlogs([]);
      });

    if (isOwnProfile && token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/me/drafts`, { headers })
        .then(res => res.json())
        .then(data => setDraftBlogs(Array.isArray(data) ? data : []))
        .catch(err => {
            console.error(err);
            setDraftBlogs([]);
        });
    }
  }, [username, isOwnProfile]);

  const authorBlogs = userBlogs.filter(b => profile && b.authorName === profile.username);

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogToDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      if(blogToDelete.draft) {
        setDraftBlogs(draftBlogs.filter(b => b.id !== blogToDelete.id));
      } else {
        setUserBlogs(userBlogs.filter(b => b.id !== blogToDelete.id));
      }
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    })
    .catch(err => alert("Failed to delete"));
  };

  const handleFollow = () => {
    const token = localStorage.getItem('token');
    if(!token) return alert('Please login to follow');
    const method = profile.following ? 'DELETE' : 'POST';
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/follow`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async res => {
      if(!res.ok) throw new Error(await res.text());
      setProfile({
        ...profile,
        following: !profile.following,
        followersCount: profile.following ? profile.followersCount - 1 : profile.followersCount + 1
      });
    }).catch(err => alert(err.message));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    let profilePicUrl = profile.profilePicture;

    if (profilePictureFile) {
      const formData = new FormData();
      formData.append("file", profilePictureFile);
      try {
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/images/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if(uploadRes.ok) {
          profilePicUrl = await uploadRes.text();
        } else {
          alert('Image upload failed');
          return;
        }
      } catch (e) {
        alert('Image upload failed');
        return;
      }
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, bio: editBio, profilePicture: profilePicUrl })
    })
    .then(res => res.json())
    .then(data => {
      setProfile(data);
      setIsEditModalOpen(false);
      setProfilePictureFile(null);
    });
  };

  const fetchFollowers = () => {
    if (!profile) return;
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/followers`, { headers })
      .then(res => res.json())
      .then(data => { setFollowers(data); setIsFollowersModalOpen(true); });
  };

  const fetchFollowing = () => {
    if (!profile) return;
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/following`, { headers })
      .then(res => res.json())
      .then(data => { setFollowing(data); setIsFollowingModalOpen(true); });
  };

  if(!profile) return <div className="profile-container">Loading...</div>;
  if(profile.fetchError) return <div className="profile-container">User not found or an error occurred.</div>;

  const displayBlogs = activeTab === 'stories' ? authorBlogs : draftBlogs;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {profile.profilePicture ? (
          <img src={profile.profilePicture} alt="Profile" className="profile-avatar-lg" style={{objectFit: 'cover'}} />
        ) : (
          <div className="profile-avatar-lg">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
        )}
        <div className="profile-info">
          <h1 className="profile-name">{profile.name || profile.username}</h1>
          <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
          <div className="profile-stats">
            <span><strong>{authorBlogs.length}</strong> Stories</span>
            <span style={{cursor: 'pointer'}} onClick={fetchFollowers}><strong>{profile.followersCount}</strong> Followers</span>
            <span style={{cursor: 'pointer'}} onClick={fetchFollowing}><strong>{profile.followingCount}</strong> Following</span>
          </div>
        </div>
        {isOwnProfile ? (
          <Button variant="outline" className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant={profile.following ? "outline" : "primary"} className="edit-profile-btn" onClick={handleFollow}>
              {profile.following ? "Unfollow" : "Follow"}
            </Button>
            <Button variant="outline" onClick={() => navigate('/chat', { state: { contact: profile } })}>
              Message
            </Button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div style={{display: 'flex', gap: '2rem', borderBottom: '1px solid #eee', marginBottom: '2rem'}}>
          <button style={{background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: 'bold', borderBottom: activeTab === 'stories' ? '2px solid #000' : 'none', color: activeTab === 'stories' ? '#000' : '#666', cursor: 'pointer'}} onClick={() => setActiveTab('stories')}>
             {isOwnProfile ? 'Your Stories' : 'Stories'}
          </button>
          {isOwnProfile && (
            <button style={{background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: 'bold', borderBottom: activeTab === 'drafts' ? '2px solid #000' : 'none', color: activeTab === 'drafts' ? '#000' : '#666', cursor: 'pointer'}} onClick={() => setActiveTab('drafts')}>
               Drafts
            </button>
          )}
        </div>
        
        <div className="profile-stories-list">
          {displayBlogs.length > 0 ? displayBlogs.map(blog => (
            <div key={blog.id} className="story-item">
              {blog.image && (
                <img src={blog.image} alt={blog.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }} />
              )}
              <div className="story-item-info" style={{ flex: 1 }}>
                <Link to={`/blog/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4 className="story-item-title">{blog.title}</h4>
                </Link>
                <div className="story-item-meta">
                  <span>{blog.draft ? 'Draft saved on' : 'Published on'} {new Date(blog.date).toLocaleDateString()}</span>
                  <span className="story-category">{blog.category}</span>
                </div>
              </div>
              {isOwnProfile && (
                <div className="story-item-actions">
                  <button className="icon-btn edit-btn"><Edit2 size={18} /></button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDeleteClick(blog)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          )) : (
            <div className="empty-stories">No {activeTab} yet.</div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete ${blogToDelete?.draft ? 'Draft' : 'Story'}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>"{blogToDelete?.title}"</strong>? This action cannot be undone.</p>
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProfile}>Save</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Profile Picture</label>
            <input type="file" accept="image/*" onChange={e => setProfilePictureFile(e.target.files[0])} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Name</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Bio</label>
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {followers.length > 0 ? followers.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {f.profilePicture ? (
                <img src={f.profilePicture} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {f.name ? f.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <a href={`/profile/${f.username}`} style={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>{f.name || f.username}</a>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>@{f.username}</div>
              </div>
            </div>
          )) : (
            <div>No followers found.</div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {following.length > 0 ? following.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {f.profilePicture ? (
                <img src={f.profilePicture} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {f.name ? f.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <a href={`/profile/${f.username}`} style={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>{f.name || f.username}</a>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>@{f.username}</div>
              </div>
            </div>
          )) : (
            <div>Not following anyone.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};
