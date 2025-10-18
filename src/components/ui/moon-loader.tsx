import React from 'react';

interface MoonLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'teal' | 'blue' | 'green' | 'purple' | 'gray';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const dotSizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
  xl: 'w-3 h-3'
};

const colorClasses = {
  teal: {
    ring: 'border-teal-200',
    dot: 'bg-teal-500'
  },
  blue: {
    ring: 'border-blue-200', 
    dot: 'bg-blue-500'
  },
  green: {
    ring: 'border-green-200',
    dot: 'bg-green-500'
  },
  purple: {
    ring: 'border-purple-200',
    dot: 'bg-purple-500'
  },
  gray: {
    ring: 'border-gray-200',
    dot: 'bg-gray-500'
  }
};

export const MoonLoader: React.FC<MoonLoaderProps> = ({ 
  size = 'md', 
  className = '',
  color = 'teal'
}) => {
  const sizeClass = sizeClasses[size];
  const dotSizeClass = dotSizeClasses[size];
  const colorClass = colorClasses[color] || colorClasses.teal; // Fallback to teal if invalid color

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Outer ring - static background */}
      <div 
        className={`absolute inset-0 rounded-full border-2 ${colorClass.ring}`}
      ></div>
      
      {/* Moving dot - positioned at top and rotates around */}
      <div 
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${dotSizeClass} ${colorClass.dot} rounded-full`}
        style={{
          animation: 'moonLoaderRotate 1s linear infinite',
          transformOrigin: '50% 200%'
        }}
      ></div>
      
      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moonLoaderRotate {
            0% {
              transform: translateX(-50%) rotate(0deg);
            }
            100% {
              transform: translateX(-50%) rotate(360deg);
            }
          }
        `
      }} />
    </div>
  );
};

export default MoonLoader;
