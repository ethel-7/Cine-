import React, { useEffect, useState } from 'react';
import { Movie, MovieDetail } from '../types';
import { tmdb } from '../services/tmdb';
import { X, Calendar, Clock, Star, Play, TrendingUp, Plus, Check } from './Icons';
import MovieCard from './MovieCard';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onMovieClick: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ 
  movie, 
  onClose, 
  onMovieClick,
  isInWatchlist,
  onToggleWatchlist
}) => {
  const [details, setDetails] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      setShowVideo(false);
      tmdb.getMovieDetails(movie.id)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setLoading(false));

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [movie]);

  if (!movie) return null;

  const backdropUrl = tmdb.getImageUrl(movie.backdrop_path, 'original');
  const trailer = details?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] bg-cinema-900 border border-white/10 md:rounded-2xl shadow-2xl overflow-y-auto hide-scrollbar flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 hover:scale-110 transition-all"
        >
          <X size={24} />
        </button>

        {/* Header / Video Section */}
        <div className="relative aspect-video w-full bg-black shrink-0">
          {showVideo && trailer ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&iv_load_policy=3&modestbranding=1`}
              title={trailer.name || "Movie Trailer"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-cinema-900/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-xl max-w-4xl">
                  {details?.title || movie.title}
                </h2>
                
                {details?.tagline && (
                  <p className="text-xl text-gray-300 mb-6 italic font-light font-amharic opacity-90">{details.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  {trailer && (
                    <button 
                      onClick={() => setShowVideo(true)}
                      className="flex items-center px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
                    >
                      <Play size={20} className="mr-2 fill-black" />
                      Play Trailer
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onToggleWatchlist(movie)}
                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all border ${
                      isInWatchlist 
                      ? 'bg-cinema-accent/20 border-cinema-accent text-cinema-accent hover:bg-cinema-accent/30' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {isInWatchlist ? (
                      <>
                        <Check size={20} className="mr-2" />
                        Added to List
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="mr-2" />
                        Add to List
                      </>
                    )}
                  </button>
                </div>

                {details && (
                  <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                    <span className="flex items-center text-green-400 font-bold">
                      <TrendingUp size={16} className="mr-1" />
                      {Math.round(details.vote_average * 10)}% Match
                    </span>
                    <span>{details.release_date.split('-')[0]}</span>
                    <span className="border border-gray-600 px-1.5 py-0.5 text-xs rounded">HD</span>
                    {details.runtime > 0 && <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 p-8 md:p-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap gap-2">
              {details?.genres?.map(g => (
                <span key={g.id} className="text-gray-200 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm hover:bg-white/10 transition-colors cursor-default">{g.name}</span>
              ))}
            </div>

            <div>
               <h3 className="text-gray-400 font-bold uppercase text-sm tracking-wider mb-2">Synopsis</h3>
               <p className="text-lg leading-relaxed text-gray-200 font-light">
                 {details?.overview || movie.overview}
               </p>
            </div>

            {details && details.credits && (
              <div className="pt-8 border-t border-white/10">
                <h3 className="text-gray-400 font-bold uppercase text-sm tracking-wider mb-4">Cast</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                  {details.credits.cast.slice(0, 6).map(person => (
                    <div key={person.id} className="text-center group">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 mb-3 mx-auto ring-2 ring-transparent group-hover:ring-cinema-accent transition-all">
                        {person.profile_path ? (
                          <img 
                            src={tmdb.getImageUrl(person.profile_path, 'w500')} 
                            alt={person.name}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium truncate">{person.name}</p>
                      <p className="text-xs text-gray-500 truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recommended */}
          <div className="lg:col-span-1 border-l border-white/5 lg:pl-12">
            <h3 className="text-gray-400 font-bold uppercase text-sm tracking-wider mb-6">More Like This</h3>
            <div className="grid grid-cols-2 gap-4">
               {details?.similar?.results?.slice(0, 6).map(m => (
                 <div key={m.id} className="cursor-pointer group" onClick={() => onMovieClick(m)}>
                   <div className="aspect-[2/3] rounded-lg overflow-hidden relative bg-gray-800">
                      <img 
                        src={tmdb.getImageUrl(m.poster_path)} 
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="fill-white text-white" />
                      </div>
                   </div>
                   <p className="text-sm mt-2 text-gray-400 truncate group-hover:text-white transition-colors">{m.title}</p>
                 </div>
               ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MovieModal;