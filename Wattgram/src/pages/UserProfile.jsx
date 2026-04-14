import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Calendar, MessageCircle, Heart, Share, MoreHorizontal, Bookmark } from 'lucide-react';
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
        if (blogToDelete.draft) {
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
    if (!token) return alert('Please login to follow');
    const method = profile.following ? 'DELETE' : 'POST';
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/follow`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        setProfile({
          ...profile,
          following: !profile.following,
          followersCount: profile.following ? profile.followersCount - 1 : profile.followersCount + 1
        });
      }).catch(err => alert(err.message));
  };

  const handleBlock = () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to block');
    const method = profile.blockedByMe ? 'DELETE' : 'POST';
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${profile.username}/block`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
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
        if (uploadRes.ok) {
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

  if (!profile) return (
    <div className="p-8 text-center text-[#555] font-mono flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#FF6B4A] border-t-transparent rounded-full animate-spin" />
        <span>Loading profile…</span>
      </div>
    </div>
  );
  if (profile.fetchError) return <div className="p-8 text-center text-[#555] font-mono">User not found or an error occurred.</div>;

  const displayBlogs = activeTab === 'stories' ? authorBlogs : draftBlogs;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      <style>{`
        .profile-banner {
          background: linear-gradient(135deg, rgba(255,107,74,0.15) 0%, rgba(120,75,160,0.1) 50%, rgba(43,134,197,0.08) 100%);
          position: relative;
        }
        .profile-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.5;
        }
        .profile-banner::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, #0a0a0a, transparent);
        }
        .stat-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
          color: #E8E6E3;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #555;
        }
        .follow-btn-glow {
          box-shadow: 0 4px 20px rgba(255,107,74,0.3);
          transition: all 0.25s ease;
        }
        .follow-btn-glow:hover {
          box-shadow: 0 6px 28px rgba(255,107,74,0.4);
          transform: translateY(-1px);
        }
        .profile-tab {
          transition: all 0.2s ease;
          position: relative;
        }
        .profile-tab-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: #FF6B4A;
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(255,107,74,0.5);
        }
        .profile-post-card {
          transition: all 0.25s ease;
        }
        .profile-post-card:hover {
          background: #141414;
          transform: translateX(2px);
        }
      `}</style>

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1e1e1e] px-4 py-2 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8A8A8A] hover:text-[#E8E6E3]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
        </button>
        <div>
          <h1 className="text-[16px] font-bold leading-tight tracking-tight" style={{ marginBottom: 0 }}>{profile.name || profile.username}</h1>
          <p className="text-[11px] text-[#555] leading-tight font-mono">{authorBlogs.length} posts</p>
        </div>
      </header>

      {/* ═══ CINEMATIC PROFILE HEADER ═══ */}
      <div className="relative">
        {/* Full-bleed Banner */}
        <div className="profile-banner h-44 sm:h-56 w-full" />

        {/* Overlapping Avatar */}
        <div className="absolute left-6 -bottom-16 sm:-bottom-20 z-10">
          <div className="story-ring p-[3px]">
            <div className="story-ring-inner">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                {profile.profilePicture ? (
                  <img src={getImageUrl(profile.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-[#FF6B4A]">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="pt-20 sm:pt-24 px-6 pb-6 bg-[#0a0a0a]">
        {/* Action Buttons — positioned top right */}
        <div className="flex justify-end items-center gap-2 -mt-12 sm:-mt-14 mb-4">
          {isOwnProfile ? (
            <motion.button
              onClick={() => setIsEditModalOpen(true)}
              className="px-5 py-2 border border-[#2a2a2a] rounded-xl font-bold text-[13px] text-[#E8E6E3] hover:bg-[#1a1a1a] hover:border-[#FF6B4A] transition-all tracking-wide"
              whileTap={{ scale: 0.95 }}
            >
              Edit profile
            </motion.button>
          ) : (
            <>
              <button className="p-2.5 border border-[#1e1e1e] rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8A8A8A]">
                <MoreHorizontal size={18} />
              </button>
              <button
                onClick={() => navigate('/chat', { state: { contact: profile } })}
                className="p-2.5 border border-[#1e1e1e] rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8A8A8A]"
              >
                <MessageCircle size={18} />
              </button>
              {profile.blockedByMe ? (
                <motion.button
                  onClick={handleBlock}
                  className="px-5 py-2 bg-[#FF4757] text-white rounded-xl font-bold text-[13px] hover:bg-[#FF6B81] transition-colors tracking-wide"
                  whileTap={{ scale: 0.95 }}
                >
                  Unblock
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-xl font-bold text-[13px] transition-all tracking-wide
                    ${profile.following 
                      ? 'border border-[#2a2a2a] text-[#E8E6E3] hover:border-[#FF4757] hover:text-[#FF4757] hover:bg-[#FF4757]/5' 
                      : 'bg-[#FF6B4A] text-white follow-btn-glow hover:bg-[#FF8566]'
                    }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {profile.following ? "Following" : "Follow"}
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Name & Handle */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-[#E8E6E3] leading-tight tracking-tight" style={{ marginBottom: '0.15rem' }}>
            {profile.name || profile.username}
          </h1>
          <p className="text-[14px] text-[#555] font-mono">@{profile.username}</p>
        </div>

        {/* Bio */}
        <div className="text-[14px] leading-relaxed text-[#8A8A8A] mb-4 max-w-[480px]">
          {profile.bio || 'No bio yet.'}
        </div>

        {/* Joined date */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#444] font-mono mb-5">
          <Calendar size={13} />
          <span>Joined March 2026</span>
        </div>

        {/* Stats — Bold cinematic layout */}
        <div className="flex gap-8 mb-2">
          <button onClick={fetchFollowing} className="flex flex-col items-start group hover:opacity-80 transition-opacity">
            <span className="stat-number">{profile.followingCount || 0}</span>
            <span className="stat-label">Following</span>
          </button>
          <button onClick={fetchFollowers} className="flex flex-col items-start group hover:opacity-80 transition-opacity">
            <span className="stat-number">{profile.followersCount || 0}</span>
            <span className="stat-label">Followers</span>
          </button>
          <div className="flex flex-col items-start">
            <span className="stat-number">{authorBlogs.length}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex w-full border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <button
          className={`flex-1 py-4 font-bold text-[12px] tracking-[0.1em] uppercase font-mono profile-tab
            ${activeTab === 'stories' ? 'text-[#E8E6E3] profile-tab-active' : 'text-[#555] hover:text-[#8A8A8A] hover:bg-[#111]'}`}
          onClick={() => setActiveTab('stories')}
        >
          Posts
        </button>
        {isOwnProfile && (
          <button
            className={`flex-1 py-4 font-bold text-[12px] tracking-[0.1em] uppercase font-mono profile-tab
              ${activeTab === 'drafts' ? 'text-[#E8E6E3] profile-tab-active' : 'text-[#555] hover:text-[#8A8A8A] hover:bg-[#111]'}`}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts
          </button>
        )}
      </div>

      {/* Posts List */}
      <div className="flex-1 min-h-[50vh]">
        <AnimatePresence>
          {displayBlogs.length > 0 ? displayBlogs.map((blog, index) => {
            const authorText = blog.authorName || profile.name || profile.username;
            const handleText = `@${profile.username}`;

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/blog/${blog.id}`} className="block border-b border-[#1e1e1e] p-5 profile-post-card overflow-hidden group/post">
                  <div className="flex gap-4 relative">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#1a1a1a] overflow-hidden border border-[#1e1e1e]">
                      {profile.profilePicture ? (
                        <img src={getImageUrl(profile.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#FF6B4A] text-sm">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5 text-[13px] truncate">
                          <span className="font-bold text-[#E8E6E3] truncate">{authorText}</span>
                          <span className="text-[#555] truncate font-mono text-[11px]">{handleText}</span>
                          <span className="text-[#333]">·</span>
                          <span className="text-[#555] flex-shrink-0 font-mono text-[11px]">{formatDate(blog.date)}</span>
                          {blog.draft && <span className="ml-2 text-[10px] bg-[#1a1a1a] text-[#FF6B4A] px-2 py-0.5 rounded-lg font-bold font-mono border border-[#2a2a2a]">Draft</span>}
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity">
                            <button className="p-1.5 text-[#555] hover:text-[#FF6B4A] hover:bg-[#FF6B4A]/10 rounded-lg transition-colors" onClick={(e) => { e.preventDefault(); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="p-1.5 text-[#555] hover:text-[#FF4757] hover:bg-[#FF4757]/10 rounded-lg transition-colors" onClick={(e) => { e.preventDefault(); handleDeleteClick(blog); }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-[14px] text-[#E8E6E3] w-full break-words whitespace-pre-wrap leading-relaxed">
                        {blog.preview || blog.title}
                      </div>

                      {blog.image && (
                        <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden border border-[#1e1e1e]">
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
                        <div className="flex items-center gap-6 mt-3 text-[#444]">
                          <button className="flex items-center gap-1.5 group p-0 m-0 hover:text-[#FF6B4A] transition-colors" onClick={(e) => e.preventDefault()}>
                            <MessageCircle size={15} />
                          </button>
                          <button className="flex items-center gap-1.5 group p-0 m-0 hover:text-[#FF4757] transition-colors" onClick={(e) => e.preventDefault()}>
                            <Heart size={15} />
                          </button>
                          <button className="flex items-center gap-1.5 group p-0 m-0 hover:text-[#FF6B4A] transition-colors" onClick={(e) => e.preventDefault()}>
                            <Share size={15} />
                          </button>
                          <button className="ml-auto flex items-center group p-0 m-0 hover:text-[#FF6B4A] transition-colors" onClick={(e) => e.preventDefault()}>
                            <Bookmark size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          }) : (
            <div className="p-12 text-center mt-8">
              {isOwnProfile ? (
                <>
                  <div className="text-3xl mb-3">✦</div>
                  <h2 className="text-xl font-bold text-[#E8E6E3] mb-2 tracking-tight">No {activeTab} yet</h2>
                  <p className="text-[#555] text-sm font-mono">When you post something, it will show up here.</p>
                </>
              ) : (
                <p className="text-[#555] font-mono">@{profile.username} hasn't posted anything yet.</p>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete ${blogToDelete?.draft ? 'Draft' : 'Post'}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong className="text-[#E8E6E3]">"{blogToDelete?.title}"</strong>? This action cannot be undone.</p>
      </Modal>

      {/* Edit Profile Modal */}
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
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-[11px] font-bold text-[#555] uppercase tracking-widest font-mono">Profile Picture</label>
            <input type="file" accept="image/*" onChange={e => setProfilePictureFile(e.target.files[0])}
              className="text-[#8A8A8A] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#1a1a1a] file:text-[#FF6B4A] hover:file:bg-[#222] transition-colors cursor-pointer"
            />
          </div>
          <div>
            <label className="block mb-2 text-[11px] font-bold text-[#555] uppercase tracking-widest font-mono">Name</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#1e1e1e] rounded-xl text-[#E8E6E3] outline-none focus:border-[#FF6B4A] focus:shadow-[0_0_0_3px_rgba(255,107,74,0.15)] transition-all text-[14px]"
            />
          </div>
          <div>
            <label className="block mb-2 text-[11px] font-bold text-[#555] uppercase tracking-widest font-mono">Bio</label>
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
              className="w-full p-3 bg-[#1a1a1a] border border-[#1e1e1e] rounded-xl text-[#E8E6E3] font-[inherit] outline-none resize-none focus:border-[#FF6B4A] focus:shadow-[0_0_0_3px_rgba(255,107,74,0.15)] transition-all text-[14px] leading-relaxed"
            />
          </div>
        </div>
      </Modal>

      {/* Followers Modal */}
      <Modal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
      >
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {followers.length > 0 ? followers.map(f => (
            <Link key={f.id} to={`/profile/${f.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#1e1e1e] flex items-center justify-center overflow-hidden flex-shrink-0">
                {f.profilePicture ? (
                  <img src={getImageUrl(f.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[#FF6B4A] text-sm">{f.name ? f.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-[#E8E6E3] text-[14px]">{f.name || f.username}</p>
                <p className="text-[12px] text-[#555] font-mono">@{f.username}</p>
              </div>
            </Link>
          )) : (
            <div className="text-[#555] text-sm font-mono text-center py-4">No followers found.</div>
          )}
        </div>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
      >
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {following.length > 0 ? following.map(f => (
            <Link key={f.id} to={`/profile/${f.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#1e1e1e] flex items-center justify-center overflow-hidden flex-shrink-0">
                {f.profilePicture ? (
                  <img src={getImageUrl(f.profilePicture)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[#FF6B4A] text-sm">{f.name ? f.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-[#E8E6E3] text-[14px]">{f.name || f.username}</p>
                <p className="text-[12px] text-[#555] font-mono">@{f.username}</p>
              </div>
            </Link>
          )) : (
            <div className="text-[#555] text-sm font-mono text-center py-4">Not following anyone.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};
