import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Calendar, MapPin, Link as LinkIcon, MessageCircle, Repeat2, Heart, Share, MoreHorizontal } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/getImageUrl';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
  }, [username, isOwnProfile, navigate]);

  const authorBlogs = userBlogs.filter(b => profile && b.authorName === profile.username);

  // Remaining Handlers
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

  const handleBlock = () => {
    const token = localStorage.getItem('token');
    if(!token) return alert('Please login to block');
    const method = profile.blockedByMe ? 'DELETE' : 'POST';
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/block`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async res => {
      if(!res.ok) throw new Error(await res.text());
      setProfile(prev => ({
        ...prev,
        blockedByMe: !prev.blockedByMe,
        following: !prev.blockedByMe ? false : prev.following,
        followersCount: (!prev.blockedByMe && prev.following) ? prev.followersCount - 1 : prev.followersCount
      }));
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

  if(!profile) return <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">Loading profile...</div>;
  if(profile.fetchError) return <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">User not found or an error occurred.</div>;

  const displayBlogs = activeTab === 'stories' ? authorBlogs : draftBlogs;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] p-2 flex items-center gap-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">{profile.name || profile.username}</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-tight">{authorBlogs.length} Posts</p>
        </div>
      </header>

      {/* Banner & Avatar Profile Section */}
      <div className="relative bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        {/* Banner Placeholder */}
        <div className="h-32 sm:h-48 bg-[var(--color-accent)]/20 w-full relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/30 to-transparent"></div>
        </div>

        {/* Profile Info Row (Avatar + Action Buttons) */}
        <div className="flex justify-between items-start px-4 pt-3 pb-4 relative">
          {/* Avatar (Overlapping banner) */}
          <div className="absolute -top-16 left-4 rounded-full border-4 border-[var(--color-bg-primary)] bg-[var(--color-bg-primary)]">
            {profile.profilePicture ? (
              <img src={getImageUrl(profile.profilePicture)} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-3xl font-bold text-[var(--color-text-secondary)]">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="w-24 sm:w-32 h-12"></div> {/* Spacer for Avatar */}

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1.5 border border-[var(--color-border)] rounded-full font-bold text-[15px] hover:bg-[var(--color-bg-tertiary)] transition-colors"
               >
                Edit profile
              </button>
            ) : (
              <>
                <button className="p-2 border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
                  <MoreHorizontal size={20} />
                </button>
                <button 
                  onClick={() => navigate('/chat', { state: { contact: profile } })}
                  className="p-2 border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  <MessageCircle size={20} />
                </button>
                {profile.blockedByMe ? (
                  <button 
                    onClick={handleBlock}
                    className="px-4 py-1.5 bg-red-500 text-white border border-red-500 rounded-full font-bold text-[15px] hover:bg-red-600 transition-colors"
                  >
                    Unblock
                  </button>
                ) : (
                  <button 
                    onClick={handleFollow}
                    className={`px-4 py-1.5 rounded-full font-bold text-[15px] transition-colors ${profile.following ? 'border border-[var(--color-border)] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' : 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-90'}`}
                  >
                    {profile.following ? "Following" : "Follow"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="px-4 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-[var(--color-text-primary)] leading-tight">{profile.name || profile.username}</h1>
            <p className="text-[15px] text-[var(--color-text-secondary)]">@{profile.username}</p>
          </div>
          
          <div className="mt-3 text-[15px] leading-snug">
            {profile.bio || 'No bio yet.'}
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-[15px] text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1"><Calendar size={16} /> Joined March 2026</span>
          </div>

          <div className="flex gap-4 mt-3 text-[15px]">
            <button onClick={fetchFollowing} className="hover:underline group">
              <span className="font-bold text-[var(--color-text-primary)]">{profile.followingCount}</span> <span className="text-[var(--color-text-secondary)]">Following</span>
            </button>
            <button onClick={fetchFollowers} className="hover:underline group">
              <span className="font-bold text-[var(--color-text-primary)]">{profile.followersCount}</span> <span className="text-[var(--color-text-secondary)]">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-[var(--color-border)] mt-2">
          <button 
            className="flex-1 hover:bg-[var(--color-bg-tertiary)] transition-colors relative"
            onClick={() => setActiveTab('stories')}
          >
            <div className={`py-4 font-bold ${activeTab === 'stories' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
              Posts
              {activeTab === 'stories' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[var(--color-accent)] rounded-t-full"></div>}
            </div>
          </button>
          {isOwnProfile && (
            <button 
              className="flex-1 hover:bg-[var(--color-bg-tertiary)] transition-colors relative"
              onClick={() => setActiveTab('drafts')}
            >
              <div className={`py-4 font-bold ${activeTab === 'drafts' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                Drafts
                {activeTab === 'drafts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[var(--color-accent)] rounded-t-full"></div>}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 min-h-[50vh]">
        <AnimatePresence>
          {displayBlogs.length > 0 ? displayBlogs.map(blog => {
            const authorText = blog.authorName || profile.name || profile.username;
            const handleText = `@${profile.username}`;
            
            return (
              <motion.div 
                key={blog.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/blog/${blog.id}`} className="block border-b border-[var(--color-border)] p-4 hover:bg-[var(--color-bg-secondary)] transition-colors overflow-hidden group/post">
                  <div className="flex gap-3 relative">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full border border-[var(--color-border)] flex-shrink-0 bg-[var(--color-bg-tertiary)] overflow-hidden">
                       {profile.profilePicture ? (
                         <img src={getImageUrl(profile.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center font-bold text-[var(--color-text-secondary)]">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
                       )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-[15px] truncate">
                          <span className="font-bold text-[var(--color-text-primary)] hover:underline truncate">{authorText}</span>
                          <span className="text-[var(--color-text-secondary)] truncate">{handleText}</span>
                          <span className="text-[var(--color-text-secondary)]">·</span>
                          <span className="text-[var(--color-text-secondary)] hover:underline flex-shrink-0">{formatDate(blog.date)}</span>
                          {blog.draft && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">Draft</span>}
                        </div>
                        {isOwnProfile && (
                           <div className="flex gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity">
                             <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full" onClick={(e) => { e.preventDefault(); /* nav to edit */ }}>
                               <Edit2 size={16} />
                             </button>
                             <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={(e) => { e.preventDefault(); handleDeleteClick(blog); }}>
                               <Trash2 size={16} />
                             </button>
                           </div>
                        )}
                      </div>
                      
                      <div className="text-[15px] text-[var(--color-text-primary)] w-full break-words whitespace-pre-wrap">
                        {blog.preview || blog.title}
                      </div>

                      {blog.image && (
                        <div className="mt-3 relative w-full pt-[56.25%] rounded-2xl overflow-hidden border border-[var(--color-border)]">
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

                      {!blog.draft && (
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
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          }) : (
            <div className="p-8 text-center text-[var(--color-text-secondary)] mt-8">
              {isOwnProfile ? (
                 <>
                   <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">No {activeTab} yet</h2>
                   <p>When you post something, it will show up here.</p>
                 </>
              ) : (
                <p>@{profile.username} hasn't posted anything yet.</p>
              )}
            </div>
          )}
        </AnimatePresence>
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
                <img src={getImageUrl(f.profilePicture)} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
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
                <img src={getImageUrl(f.profilePicture)} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
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
