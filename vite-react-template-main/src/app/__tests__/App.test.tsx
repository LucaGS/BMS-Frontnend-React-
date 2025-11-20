import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import App from '../App';

const fetchMock = vi.spyOn(global, 'fetch');

describe('App', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
  });

  it('renders the home route with navigation and footer', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByRole('link', { name: /bms/i })).toBeInTheDocument();
    expect(screen.getByText(/willkommen im bms-portal/i)).toBeInTheDocument();
    expect(screen.getByText(/bms/i, { selector: 'small' })).toBeInTheDocument();
  });

  it('renders the about page when navigated to /about', () => {
    window.history.pushState({}, '', '/about');
    render(<App />);
    expect(screen.getByRole('heading', { name: /ueber diese anwendung/i })).toBeInTheDocument();
  });
});
