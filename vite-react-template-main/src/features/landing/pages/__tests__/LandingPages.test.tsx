import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test/test-utils';
import HomePage from '../HomePage';
import AboutPage from '../AboutPage';

describe('HomePage', () => {
  it('renders welcome content', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /willkommen im bms-portal/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/verwalten sie baeume und gruenflaechen/i)).toBeInTheDocument();
  });
});

describe('AboutPage', () => {
  it('shows information text', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /ueber diese anwendung/i })).toBeInTheDocument();
    expect(screen.getByText(/pflege und verwaltung/i)).toBeInTheDocument();
  });
});
