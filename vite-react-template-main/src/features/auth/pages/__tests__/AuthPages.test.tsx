import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';
import LoginPage from '../LoginPage';
import SignupPage from '../SignupPage';

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
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('submits credentials and stores the returned token', async () => {
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
    expect(await screen.findByRole('alert')).toHaveTextContent(/erfolgreich eingeloggt/i);
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
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('creates an account and stores the token when provided', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ token: 'signup-token' }));

    renderWithRouter(<SignupPage />, { route: '/signup', path: '/signup' });

    await userEvent.type(screen.getByLabelText(/benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/^e-mail-adresse/i), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/^passwort$/i), 'password');
    await userEvent.type(screen.getByLabelText(/passwort bestaetigen/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(localStorage.getItem('token')).toBe('signup-token');
    expect(await screen.findByRole('alert')).toHaveTextContent(/registrierung erfolgreich/i);
  });

  it('shows a validation error when passwords differ', async () => {
    renderWithRouter(<SignupPage />, { route: '/signup', path: '/signup' });

    await userEvent.type(screen.getByLabelText(/^benutzername/i), 'demo');
    await userEvent.type(screen.getByLabelText(/^e-mail-adresse/i), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/^passwort$/i), 'password');
    await userEvent.type(screen.getByLabelText(/passwort bestaetigen/i), 'other');
    await userEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/passwoerter stimmen nicht/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
