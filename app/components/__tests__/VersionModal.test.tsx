/**
 * VersionModal Component Tests
 * 
 * These tests require a testing library to be installed:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest
 * 
 * Example usage after installation:
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VersionModal from '../VersionModal';

// Mock the API module
jest.mock('../lib/api/version', () => ({
  fetchVersionData: jest.fn(),
  getFrontendVersion: jest.fn(() => Promise.resolve('0.1.0')),
}));

import { fetchVersionData } from '../lib/api/version';

describe('VersionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(<VersionModal isOpen={false} onClose={jest.fn()} />);
    
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  test('renders modal when isOpen is true', () => {
    (fetchVersionData as jest.Mock).mockResolvedValue({
      backendVersion: '0.0.1-SNAPSHOT',
      frontendVersion: '0.1.0',
    });
    
    render(<VersionModal isOpen={true} onClose={jest.fn()} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    (fetchVersionData as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<VersionModal isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.getByText(/loading version information/i)).toBeInTheDocument();
  });

  test('displays version data after successful fetch', async () => {
    const mockVersionData = {
      backendVersion: '0.0.1-SNAPSHOT',
      frontendVersion: '0.1.0',
      gitCommitHash: 'abc123',
      buildTimestamp: '2024-01-15T10:30:00',
    };
    
    (fetchVersionData as jest.Mock).mockResolvedValue(mockVersionData);
    
    render(<VersionModal isOpen={true} onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('0.1.0')).toBeInTheDocument();
      expect(screen.getByText('0.0.1-SNAPSHOT')).toBeInTheDocument();
      expect(screen.getByText('abc123')).toBeInTheDocument();
    });
  });

  test('displays error message when API fails', async () => {
    (fetchVersionData as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<VersionModal isOpen={true} onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/unable to load version information/i)).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    (fetchVersionData as jest.Mock).mockResolvedValue({
      backendVersion: '0.0.1-SNAPSHOT',
      frontendVersion: '0.1.0',
    });
    
    render(<VersionModal isOpen={true} onClose={handleClose} />);
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  test('calls onClose when Escape key is pressed', async () => {
    const handleClose = jest.fn();
    (fetchVersionData as jest.Mock).mockResolvedValue({
      backendVersion: '0.0.1-SNAPSHOT',
      frontendVersion: '0.1.0',
    });
    
    render(<VersionModal isOpen={true} onClose={handleClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay is clicked', async () => {
    const handleClose = jest.fn();
    (fetchVersionData as jest.Mock).mockResolvedValue({
      backendVersion: '0.0.1-SNAPSHOT',
      frontendVersion: '0.1.0',
    });
    
    render(<VersionModal isOpen={true} onClose={handleClose} />);
    
    await waitFor(() => {
      const overlay = screen.getByRole('dialog').parentElement || screen.getByRole('dialog');
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});

// Export empty object to satisfy module requirements
export {};