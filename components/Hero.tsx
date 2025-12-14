import React, { useEffect, useState } from 'react';
import { Movie } from '../types';
import { tmdb } from '../services/tmdb';
import { Play, Info } from './Icons';

interface HeroProps {
  movie: Movie | null;
  onInfoClick: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onInfoClick }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!movie) {
    return (
      <div className="h-[70vh] w-full bg-cinema-900 animate-pulse flex items-center justify-center">
        <span className="text-gray-600">Loading Featured Content...</span>
      </div>
    );
  }

  const backdropUrl = tmdb.getImageUrl(movie.backdrop_path, 'original');

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-75 ease-out"
        style={{ 
          backgroundImage: `url(${backdropUrl})`,
          transform: `translateY(${offset}px) scale(1.1)`
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-900 via-cinema-900/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-24 z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 max-w-3xl drop-shadow-lg tracking-tight">
          {movie.title}
        </h1>
        
        <p className="text-gray-200 text-lg md:text-xl mb-6 max-w-2xl line-clamp-3 drop-shadow-md font-light">
          {movie.overview}
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center px-8 py-3 bg-cinema-accent hover:bg-cinema-accentHover text-white rounded-md font-semibold transition-all hover:scale-105 shadow-lg shadow-red-900/20"
            onClick={() => onInfoClick(movie)}
          >
            <Play size={20} className="mr-2 fill-white" />
            Watch Trailer
          </button>
          
          <button 
            onClick={() => onInfoClick(movie)}
            className="flex items-center px-8 py-3 bg-gray-600/60 hover:bg-gray-600/80 backdrop-blur-sm text-white rounded-md font-semibold transition-all hover:scale-105"
          >
            <Info size={20} className="mr-2" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
