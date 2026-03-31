import React from 'react';

export const SidebarRight = () => {
  return (
    <div className="hidden lg:block w-80 pl-8 py-4 sticky top-0 h-screen overflow-y-auto">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 mb-4">
        <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-4">What's happening</h2>
        
        <div className="space-y-4">
          <div className="hover:bg-[var(--color-bg-tertiary)] -mx-4 px-4 py-2 cursor-pointer transition-colors">
            <p className="text-xs text-[var(--color-text-tertiary)]">Trending in Tech</p>
            <p className="font-bold text-[var(--color-text-primary)]">#ReactJS</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">15.4K Posts</p>
          </div>
          <div className="hover:bg-[var(--color-bg-tertiary)] -mx-4 px-4 py-2 cursor-pointer transition-colors">
            <p className="text-xs text-[var(--color-text-tertiary)]">Trending</p>
            <p className="font-bold text-[var(--color-text-primary)]">Tailwind CSS v4</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">8,200 Posts</p>
          </div>
          <div className="hover:bg-[var(--color-bg-tertiary)] -mx-4 px-4 py-2 cursor-pointer transition-colors">
            <p className="text-xs text-[var(--color-text-tertiary)]">Sports · Trending</p>
            <p className="font-bold text-[var(--color-text-primary)]">Championship</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">120K Posts</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4">
        <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-4">Who to follow</h2>
        
        <div className="space-y-4">
          {[1, 2, 3].map((user) => (
            <div key={user} className="flex items-center justify-between hover:bg-[var(--color-bg-tertiary)] -mx-4 px-4 py-2 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)] text-sm">Suggested User</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">@user{user}</p>
                </div>
              </div>
              <button className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-4 py-1.5 rounded-full font-bold text-sm hover:opacity-90">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
{/* 
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)] mt-4 px-2">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <span>© 2026 Wattgram.</span>
      </div> */}
    </div>
  );
};
