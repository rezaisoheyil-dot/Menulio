import { useState } from 'react';
import { Coffee } from 'lucide-react';
import { resolveAssetUrl } from '../data/initialData';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveAssetUrl(src);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 text-stone-400 ${className}`}
        aria-label={alt}
      >
        <Coffee className="w-6 h-6 opacity-70" />
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
