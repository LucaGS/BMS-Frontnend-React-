import { describe, expect, it } from 'vitest';
import { render, renderWithRouter, screen } from '@/test/test-utils';
import HomePage from '../HomePage';
import AboutPage from '../AboutPage';

describe('HomePage', () => {
  it('renders welcome content', () => {
    renderWithRouter(<HomePage />, { route: '/', path: '/' });
    expect(
      screen.getByRole('heading', {
        name: /baum- und grünflächenverwaltung mit ruhiger, klarer oberfläche/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zu den bäumen/i })).toBeInTheDocument();
    expect(screen.getByText(/schneller arbeitsfluss/i)).toBeInTheDocument();
  });
});

describe('AboutPage', () => {
  it('shows information text', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /über diese anwendung/i })).toBeInTheDocument();
    expect(screen.getByText(/pflege und verwaltung/i)).toBeInTheDocument();
  });
});
