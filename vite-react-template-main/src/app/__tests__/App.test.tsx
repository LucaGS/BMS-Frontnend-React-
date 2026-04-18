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
    expect(screen.getByRole('link', { name: /zum login/i })).toBeInTheDocument();
    expect(screen.getAllByText(/nicht eingeloggt/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /baum- und grünflächenverwaltung mit ruhiger, klarer oberfläche/i })).toBeInTheDocument();
    expect(screen.getByText(/bms/i, { selector: 'small' })).toBeInTheDocument();
  });

  it('renders the about page when navigated to /about', () => {
    window.history.pushState({}, '', '/about');
    render(<App />);
    expect(screen.getByRole('heading', { name: /über diese anwendung/i })).toBeInTheDocument();
  });

  it('verifies the stored JWT on app load via green areas request', async () => {
    localStorage.setItem('token', 'jwt-token');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    window.history.pushState({}, '', '/');
    render(<App />);

    expect(await screen.findByText(/eingeloggt/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/GreenAreas/GetAll'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'bearer jwt-token' }),
      })
    );
  });

  it('clears the token and shows a warning when jwt validation fails', async () => {
    localStorage.setItem('token', 'expired-token');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));

    window.history.pushState({}, '', '/');
    render(<App />);

    expect(await screen.findByText(/sitzung ist abgelaufen/i)).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
