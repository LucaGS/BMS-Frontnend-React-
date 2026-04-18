import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';
import LoginPage from '../LoginPage';
import SignupPage from '../SignupPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const createJsonResponse = (data: unknown, ok = true, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
    statusText: ok ? 'OK' : 'Bad Request',
  });

describe('LoginPage', () => {
  const fetchMock = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
    navigateMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('submits credentials, stores the returned token, and navigates to green areas', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ token: 'jwt-123' }));

    renderWithRouter(<LoginPage />, { route: '/login', path: '/login' });

    await userEvent.type(screen.getByLabelText(/e-mail-adresse/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/passwort/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /einloggen/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Auth/Login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(localStorage.getItem('token')).toBe('jwt-123');
    expect(navigateMock).toHaveBeenCalledWith('/green-areas', { replace: true });
  });

  it('surfaces errors returned by the API', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}, false, 401));

    renderWithRouter(<LoginPage />, { route: '/login', path: '/login' });

    await userEvent.type(screen.getByLabelText(/e-mail-adresse/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/passwort/i), 'bad' );
    await userEvent.click(screen.getByRole('button', { name: /einloggen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/login fehlgeschlagen/i);
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('SignupPage', () => {
  const fetchMock = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
    navigateMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('creates an account, stores the token, and navigates to green areas when provided', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ token: 'signup-token' }));

    renderWithRouter(<SignupPage />, { route: '/signup', path: '/signup' });

    await userEvent.type(screen.getByLabelText(/benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/^e-mail-adresse/i), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/^passwort$/i), 'password');
    await userEvent.type(screen.getByLabelText(/passwort bestätigen/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(localStorage.getItem('token')).toBe('signup-token');
    expect(navigateMock).toHaveBeenCalledWith('/green-areas', { replace: true });
  });

  it('shows a validation error when passwords differ', async () => {
    renderWithRouter(<SignupPage />, { route: '/signup', path: '/signup' });

    await userEvent.type(screen.getByLabelText(/^benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/^e-mail-adresse/i), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/^passwort$/i), 'password');
    await userEvent.type(screen.getByLabelText(/passwort bestätigen/i), 'other');
    await userEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/passwörter stimmen nicht/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
