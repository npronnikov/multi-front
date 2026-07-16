'use client';

import React, { useState } from 'react';
import VersionButton from './VersionButton';
import VersionModal from './VersionModal';

interface VersionLayoutWrapperProps {
  children: React.ReactNode;
}

export default function VersionLayoutWrapper({ children }: VersionLayoutWrapperProps) {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Application</h1>
            <VersionButton onClick={() => setIsVersionModalOpen(true)} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <VersionModal 
        isOpen={isVersionModalOpen} 
        onClose={() => setIsVersionModalOpen(false)} 
      />
    </>
  );
}
