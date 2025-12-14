import React, { useState } from 'react';
import { Search, Settings, X, Film, Heart } from './Icons';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onOpenWatchlist: () => void;
  onHomeClick: () => void;
  isScrolled: boolean;
  watchlistCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenSettings, 
  onOpenWatchlist, 
  onHomeClick,
  isScrolled,
  watchlistCount
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setSearchOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-cinema-900/95 backdrop-blur-xl border-white/5 py-3 shadow-2xl' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group select-none"
          onClick={onHomeClick}
        >
          <Film className="text-cinema-accent group-hover:rotate-12 transition-transform duration-500 ease-out" size={32} />
          <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-gray-100 transition-colors">
            CINE<span className="text-cinema-accent font-amharic text-3xl align-middle inline-block -mt-1 ml-0.5">ማ</span>
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Watchlist Link - Desktop */}
          <button 
            onClick={onOpenWatchlist}
            className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="relative">
              My List
              {watchlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-cinema-accent text-[10px] text-white px-1.5 rounded-full">
                  {watchlistCount}
                </span>
              )}
            </span>
          </button>

          {/* Search Bar */}
          <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'bg-white/10 rounded-full px-3 py-1 ring-1 ring-white/20' : ''}`}>
            {searchOpen ? (
              <form onSubmit={handleSubmit} className="flex items-center">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titles, people, genres..."
                  className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 text-sm px-3 py-1 w-32 md:w-64 outline-none"
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X size={18} className="text-gray-400 hover:text-white" />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-gray-300 hover:text-white transition-colors p-1"
              >
                <Search size={22} />
              </button>
            )}
          </div>
          
          {/* Watchlist Icon - Mobile */}
          <button 
            onClick={onOpenWatchlist}
            className="md:hidden relative text-gray-300 hover:text-white transition-colors"
          >
            <Heart size={22} />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cinema-accent rounded-full"></span>
            )}
          </button>

          <button 
            onClick={onOpenSettings}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Settings size={22} />
          </button>
          
          <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-tr from-cinema-accent to-purple-600 shadow-[0_0_15px_rgba(229,9,20,0.4)]"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;