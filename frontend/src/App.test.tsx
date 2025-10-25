import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders Vite + React heading', () => {
    render(<App />);
    const heading = screen.getByText(/vite \+ react/i);
    expect(heading).toBeDefined();
  });
});