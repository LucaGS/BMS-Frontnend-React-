import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithRouter, screen } from '@/test/test-utils';
import AppHeader from '../AppHeader';

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows login and signup links when no token is present', () => {
    renderWithRouter(<AppHeader />);

    expect(screen.getByRole('link', { name: /startseite/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /registrieren/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows logout when token exists and clears it on click', async () => {
    localStorage.setItem('token', 'jwt-token');

    renderWithRouter(<AppHeader />);

    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();

    await userEvent.click(logoutButton);

    expect(localStorage.getItem('token')).toBeNull();
    expect(await screen.findByRole('link', { name: /login/i })).toBeInTheDocument();
  });
});
