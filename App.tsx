import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { Movie } from './types';
import { tmdb, hasApiKey, setApiKey } from './services/tmdb';
import { ChevronRight, AlertCircle, X, Search, Heart, Film } from './components/Icons';

type ViewState = 'home' | 'search' | 'watchlist';

function App() {
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  
  // Watchlist State (Persisted)
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialization
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyMissing(true);
      setLoading(false);
    } else {
      loadInitialData();
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist Watchlist
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [trendRes, popRes, topRes, upRes] = await Promise.all([
        tmdb.getTrending(),
        tmdb.getPopular(),
        tmdb.getTopRated(),
        tmdb.getUpcoming()
      ]);

      setTrending(trendRes.results);
      setPopular(popRes.results);
      setTopRated(topRes.results);
      setUpcoming(upRes.results);

      // Pick a random movie from trending for Hero, preferably with a backdrop
      const validHeroMovies = trendRes.results.filter(m => m.backdrop_path);
      setHeroMovie(validHeroMovies[Math.floor(Math.random() * validHeroMovies.length)] || validHeroMovies[0]);

    } catch (error) {
      console.error("Failed to load data", error);
      // If error is due to auth, show modal again
      if (error instanceof Error && (error.message.includes('Invalid') || error.message.includes('missing'))) {
        setApiKeyMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim().length > 10) {
      setApiKey(apiKeyInput.trim());
      setApiKeyMissing(false);
      loadInitialData();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    setLoading(true);
    try {
      const res = await tmdb.searchMovies(query);
      setSearchResults(res.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const renderRow = (title: string, movies: Movie[]) => (
    <div className="mb-12 animate-slide-up">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-cinema-accent transition-colors flex items-center gap-2">
          <div className="w-1 h-6 bg-cinema-accent rounded-full"></div>
          {title}
        </h2>
        <div className="flex items-center text-sm font-semibold text-gray-400 hover:text-white cursor-pointer group transition-colors">
          Explore All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform ml-1" />
        </div>
      </div>
      
      <div className="relative group">
        <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 lg:px-8 pb-8 hide-scrollbar snap-x z-10 relative">
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MovieCard movie={movie} onClick={setSelectedMovie} />
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-cinema-900 via-cinema-900/60 to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-cinema-900 via-cinema-900/60 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );

  const renderGrid = (movies: Movie[], emptyMessage: React.ReactNode) => (
    <div className="pt-32 px-4 sm:px-6 lg:px-8 min-h-screen animate-fade-in">
       {movies.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 text-gray-500">
           {emptyMessage}
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
           {movies.map(movie => (
             <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} variant="portrait" />
           ))}
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cinema-900 text-white font-sans selection:bg-cinema-accent selection:text-white">
      
      {/* API Key Modal */}
      {apiKeyMissing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border-t border-cinema-accent/50 shadow-[0_0_50px_-12px_rgba(229,9,20,0.5)]">
            <AlertCircle size={48} className="mx-auto text-cinema-accent mb-4" />
            <h2 className="text-2xl font-bold mb-2">Setup API Access</h2>
            <p className="text-gray-400 mb-6 text-sm">
              To browse movies on <strong>Cineማ</strong>, this app requires a free API Key from <strong>The Movie Database (TMDB)</strong>.
            </p>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your TMDB API Key here"
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 mb-4 text-white focus:border-cinema-accent focus:outline-none transition-colors"
            />
            <button
              onClick={handleSaveApiKey}
              className="w-full bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              Start Watching
            </button>
            <p className="mt-4 text-xs text-gray-500">
              Don't have one? <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="text-white hover:underline">Get it here</a>.
            </p>
          </div>
        </div>
      )}

      <Navbar 
        onSearch={handleSearch} 
        onOpenSettings={() => setApiKeyMissing(true)}
        onOpenWatchlist={() => setCurrentView('watchlist')}
        onHomeClick={() => setCurrentView('home')}
        isScrolled={isScrolled}
        watchlistCount={watchlist.length}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero movie={heroMovie} onInfoClick={setSelectedMovie} />
            
            <div className="-mt-32 relative z-20 space-y-4">
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinema-accent"></div>
                </div>
              ) : (
                <>
                  {renderRow("Trending Now", trending)}
                  {renderRow("Top Rated", topRated)}
                  {renderRow("Popular on Cineማ", popular)}
                  {renderRow("Coming Soon", upcoming)}
                </>
              )}
            </div>
          </>
        )}

        {currentView === 'search' && (
          <div className="min-h-screen">
             <div className="pt-32 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
               <button 
                 onClick={() => setCurrentView('home')} 
                 className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
               >
                 <X />
               </button>
               <h2 className="text-3xl font-bold">Results for "{searchQuery}"</h2>
             </div>
             
             {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-8 animate-pulse">
                 {[...Array(10)].map((_, i) => (
                   <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
                 ))}
               </div>
             ) : (
               renderGrid(searchResults, (
                 <>
                   <Search size={48} className="mx-auto mb-4 opacity-30" />
                   <p className="text-xl">No movies found matching your criteria.</p>
                 </>
               ))
             )}
          </div>
        )}

        {currentView === 'watchlist' && (
          <div className="min-h-screen">
             <div className="pt-32 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
               <button 
                 onClick={() => setCurrentView('home')} 
                 className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
               >
                 <X />
               </button>
               <h2 className="text-3xl font-bold flex items-center gap-3">
                 <Heart className="text-cinema-accent fill-cinema-accent" />
                 My Watchlist
               </h2>
             </div>
             
             {renderGrid(watchlist, (
               <>
                 <Film size={48} className="mx-auto mb-4 opacity-30" />
                 <p className="text-xl mb-2">Your watchlist is empty.</p>
                 <p className="text-sm">Start adding movies to keep track of what you want to watch.</p>
                 <button 
                    onClick={() => setCurrentView('home')}
                    className="mt-6 px-6 py-2 bg-cinema-accent rounded text-white font-semibold hover:bg-cinema-accentHover transition-colors"
                 >
                   Browse Movies
                 </button>
               </>
             ))}
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onMovieClick={setSelectedMovie}
          isInWatchlist={watchlist.some(m => m.id === selectedMovie.id)}
          onToggleWatchlist={toggleWatchlist}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-black py-16 px-4 border-t border-gray-900 mt-20">
        <div className="container mx-auto text-center">
           <div className="flex justify-center items-center gap-2 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <Film size={24} />
             <span className="text-xl font-bold">CINE<span className="font-amharic">ማ</span></span>
           </div>
           <p className="text-gray-500 text-sm mb-4">Designed with ❤️ for Cinema Lovers</p>
           <p className="text-gray-600 text-xs">Data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;