import React, { useState, useEffect } from 'react';

export const getInitials = (nameString) => {
  if (!nameString) return "UI";
  const parts = nameString.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UI";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const Avatar = ({ src, name, sizeClass = "w-10 h-10", initialsSizeClass = "text-xs" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const initials = getInitials(name);

  const showFallback = !src || imageError;

  return (
    <div className={`group relative rounded-full overflow-hidden select-none flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm ${sizeClass} bg-gradient-to-br from-[#4F46E5] to-[#6366F1] transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-white/10`}>
      {showFallback ? (
        <span className={`font-extrabold text-white leading-none font-sans ${initialsSizeClass}`}>
          {initials}
        </span>
      ) : (
        <>
          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-full" />
          )}
          
          <img
            src={src}
            alt={name || "User Avatar"}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 rounded-full ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
    </div>
  );
};

export default Avatar;
