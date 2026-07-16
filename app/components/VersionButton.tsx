'use client';

import React from 'react';

interface VersionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function VersionButton({ onClick, className = '' }: VersionButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${className}`}
      aria-label="View version information"
      role="button"
      tabIndex={0}
    >
      version
    </button>
  );
}