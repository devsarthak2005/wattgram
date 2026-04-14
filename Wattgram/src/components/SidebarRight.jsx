import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

export const SidebarRight = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users?size=5`, { headers });
        if (res.ok) {
          const data = await res.json();
          const currentUserStr = localStorage.getItem('user');
          let currentUsername = null;
          if (currentUserStr) {
            try { currentUsername = JSON.parse(currentUserStr).username; } catch (e) { }
          }
          let users = data.content || [];
          if (currentUsername) {
            users = users.filter(u => u.username !== currentUsername);
          }
          setSuggestedUsers(users.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch suggested users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) navigate(`/explore?q=${query}`);
  };

  return (
    <div className="hidden lg:block w-[350px] pl-8 py-6 sticky top-0 h-screen overflow-y-auto z-10">

      <style>{`
        .search-glow:focus-within {
          box-shadow: 0 0 0 1px #FF6B4A, 0 0 20px rgba(255,107,74,0.1);
        }
        .user-card-hover {
          transition: all 0.25s ease;
        }
        .user-card-hover:hover {
          background: #1a1a1a;
          transform: translateX(2px);
        }
        .follow-btn-glow {
          transition: all 0.25s ease;
        }
        .follow-btn-glow:hover {
          box-shadow: 0 0 16px rgba(255,107,74,0.3);
          background: #FF8566 !important;
        }
      `}</style>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 relative group search-glow rounded-xl transition-all duration-300">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={16} className="text-[#555] group-focus-within:text-[#FF6B4A] transition-colors" />
        </div>
        <input
          type="text"
          name="search"
          placeholder="Search Wattgram"
          className="w-full bg-[#111111] border border-[#1e1e1e] focus:border-[#FF6B4A] focus:bg-[#0a0a0a] text-[#E8E6E3] rounded-xl py-3 pl-11 pr-4 outline-none transition-all text-[14px] placeholder:text-[#444] font-mono"
        />
      </form>

      {/* Who to follow */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
        <div className="p-4 pb-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FF6B4A]" />
          <h2 className="text-[15px] font-bold text-[#E8E6E3] tracking-tight" style={{ marginBottom: 0 }}>Who to follow</h2>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="p-4 text-[#555] text-sm font-mono">Finding creatives...</div>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.username}`}
                className="flex items-center justify-between px-4 py-3 cursor-pointer user-card-hover"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Avatar with story ring */}
                  <div className="story-ring flex-shrink-0" style={{ padding: '2px' }}>
                    <div className="story-ring-inner">
                      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                        {user.profilePicture ? (
                          <img src={getImageUrl(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-[#FF6B4A] text-sm">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-[#E8E6E3] text-[14px] truncate">{user.name || user.username}</p>
                    <p className="text-[12px] text-[#555] truncate font-mono">@{user.username}</p>
                  </div>
                </div>
                <div className="bg-[#FF6B4A] text-white px-4 py-1.5 rounded-lg font-bold text-[12px] tracking-wide follow-btn-glow ml-2 flex-shrink-0">
                  View
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-[#555] text-sm font-mono">No suggestions right now.</div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#444] mt-6 px-2 leading-tight font-mono">
        <a href="#" className="hover:text-[#FF6B4A] transition-colors">Terms</a>
        <a href="#" className="hover:text-[#FF6B4A] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[#FF6B4A] transition-colors">Cookies</a>
        <span className="text-[#333]">© 2026 Wattgram</span>
      </div>
    </div>
  );
};
