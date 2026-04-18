import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen } from '@/test/test-utils';
import AppHeader from '../AppHeader';

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows login and signup links when no token is present', () => {
    renderWithRouter(<AppHeader authStatus="unauthenticated" onLogout={vi.fn()} />);

    expect(screen.getByRole('link', { name: /startseite/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /registrieren/i })).toBeInTheDocument();
    expect(screen.getByText(/nicht eingeloggt/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows logout when authenticated and calls logout on click', async () => {
    const onLogout = vi.fn();

    renderWithRouter(<AppHeader authStatus="authenticated" onLogout={onLogout} />);

    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    expect(screen.getByText(/eingeloggt/i)).toBeInTheDocument();

    await userEvent.click(logoutButton);

    expect(onLogout).toHaveBeenCalled();
  });
});
