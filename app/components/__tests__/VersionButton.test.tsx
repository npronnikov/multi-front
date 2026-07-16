/**
 * VersionButton Component Tests
 * 
 * These tests require a testing library to be installed:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest
 * 
 * Example usage after installation:
 */

import { render, screen, fireEvent } from '@testing-library/react';
import VersionButton from '../VersionButton';

describe('VersionButton', () => {
  test('renders button with version text', () => {
    const handleClick = jest.fn();
    render(<VersionButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /view version information/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('version');
  });

  test('calls onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(<VersionButton onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('calls onClick when Enter key is pressed', () => {
    const handleClick = jest.fn();
    render(<VersionButton onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('calls onClick when Space key is pressed', () => {
    const handleClick = jest.fn();
    render(<VersionButton onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    const handleClick = jest.fn();
    render(<VersionButton onClick={handleClick} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});

// Export empty object to satisfy module requirements
export {};
