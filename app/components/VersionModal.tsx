'use client';

import React, { useEffect, useState } from 'react';
import { fetchVersionData, getFrontendVersion, VersionData } from '../lib/api/version';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVersionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchVersionData();
      setVersionData(data);
    } catch {
      setError('Unable to load version information');
      // Fallback to frontend version only
      setVersionData({
        backendVersion: 'unknown',
        frontendVersion: await getFrontendVersion(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadVersionData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-modal-title"
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="version-modal-title" className="text-xl font-bold">Application Version</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading version information...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : versionData ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Frontend Version</p>
              <p className="text-lg font-semibold">{versionData.frontendVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Backend Version</p>
              <p className="text-lg font-semibold">{versionData.backendVersion}</p>
            </div>
            {versionData.gitCommitHash && (
              <div>
                <p className="text-sm text-gray-600">Git Commit</p>
                <p className="text-sm font-mono break-all">{versionData.gitCommitHash}</p>
              </div>
            )}
            {versionData.buildTimestamp && (
              <div>
                <p className="text-sm text-gray-600">Build Time</p>
                <p className="text-sm">{versionData.buildTimestamp}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}