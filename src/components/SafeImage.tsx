import React, { useState } from 'react';
import { LOCAL_FALLBACK_IMAGES } from '../data/seedData';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallback = LOCAL_FALLBACK_IMAGES.conference,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback);

  React.useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
      className={className}
    />
  );
};
