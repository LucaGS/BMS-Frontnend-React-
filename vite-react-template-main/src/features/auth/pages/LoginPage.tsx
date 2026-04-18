import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { storeToken } from '@/shared/lib/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess(false);
      const response = await fetch(`${API_BASE_URL}/api/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        throw new Error('Login fehlgeschlagen. Bitte Zugangsdaten prüfen.');
      }

      const data = await response.json();

      if (data.token) {
        storeToken(data.token);
        setSuccess(true);
      } else {
        throw new Error('Login erfolgreich, aber Rückmeldung fehlt.');
      }
    } catch (submitError) {
      console.error('Error during login:', submitError);
      setSuccess(false);
      setError(submitError instanceof Error ? submitError.message : 'Unbekannter Fehler');
    }
  };

  return (
    <div className="container py-5 auth-shell">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 auth-card">
            <div className="card-body p-4 p-lg-5">
              <div className="auth-kicker text-center mb-2">Sicher anmelden</div>
              <h2 className="h3 mb-4 text-center">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="loginUsername" className="form-label">
                    Benutzername
                  </label>
                  <input
                    id="loginUsername"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    placeholder="Benutzername"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="loginPassword" className="form-label">
                    Passwort
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 btn-lg">
                  Einloggen
                </button>
              </form>
              {error && (
                <div className="alert alert-danger mt-4 mb-0" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success mt-4 mb-0" role="alert">
                  Erfolgreich eingeloggt.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
