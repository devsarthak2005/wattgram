import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Search } from 'lucide-react';
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
          // Filter out current user if logged in
          const currentUserStr = localStorage.getItem('user');
          let currentUsername = null;
          if (currentUserStr) {
            try { currentUsername = JSON.parse(currentUserStr).username; } catch(e){}
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
    <div className="hidden lg:block w-[350px] pl-8 py-4 sticky top-0 h-screen overflow-y-auto z-10 transition-colors duration-200">
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-accent)] transition-colors" />
        </div>
        <input 
          type="text" 
          name="search"
          placeholder="Search" 
          className="w-full bg-[var(--color-bg-secondary)] border border-transparent focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-full py-3 pl-12 pr-4 outline-none transition-all shadow-sm focus:shadow-[0_0_0_1px_var(--color-accent)]"
        />
      </form>

      {/* Modern Card: Who to follow */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] p-4 pb-2">Who to follow</h2>
        
        <div className="flex flex-col">
          {loading ? (
            <div className="p-4 text-[var(--color-text-secondary)] text-sm">Finding people...</div>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <Link 
                key={user.id} 
                to={`/profile/${user.username}`}
                className="flex items-center justify-between hover:bg-[var(--color-bg-tertiary)] px-4 py-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img src={getImageUrl(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-[var(--color-text-secondary)]">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-[var(--color-text-primary)] text-[15px] truncate hover:underline">{user.name || user.username}</p>
                    <p className="text-[14px] text-[var(--color-text-secondary)] truncate">@{user.username}</p>
                  </div>
                </div>
                {/* 
                  Normally we could put a follow button here. 
                  But since it's a Link, clicking anywhere goes to profile.
                  For aesthetics we add a visual button outline.
                */}
                <div className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-4 py-1.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity ml-2">
                  View
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-[var(--color-text-secondary)] text-sm">No suggestions right now.</div>
          )}
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[var(--color-text-secondary)] mt-4 px-4 leading-tight">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <span>© 2026 Wattgram.</span>
      </div>
    </div>
  );
};
