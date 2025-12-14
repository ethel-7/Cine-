import React from 'react';
import { Movie } from '../types';
import { tmdb } from '../services/tmdb';
import { Star } from './Icons';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  variant?: 'portrait' | 'landscape';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, variant = 'portrait' }) => {
  const imageUrl = tmdb.getImageUrl(movie.poster_path);
  
  return (
    <div 
      className="group relative cursor-pointer flex-shrink-0 transition-all duration-500 hover:scale-105 hover:z-20 py-4"
      onClick={() => onClick(movie)}
      style={{ width: variant === 'portrait' ? '200px' : '350px' }}
    >
      <div className={`relative overflow-hidden rounded-xl bg-cinema-800 shadow-xl transition-shadow duration-300 group-hover:shadow-[0_0_25px_rgba(229,9,20,0.4)] ${variant === 'portrait' ? 'aspect-[2/3]' : 'aspect-video'}`}>
        <img 
          src={imageUrl} 
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-300 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
            <span className="flex items-center text-yellow-400 font-bold">
              <Star size={12} className="mr-1 fill-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span className="text-gray-500">•</span>
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;