import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
  });
  const [correctPasswordCheck, setCorrectPasswordCheck] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Bitte alle Felder ausfuellen.');
      return;
    }

    if (formData.password !== correctPasswordCheck) {
      setError('Die Passwoerter stimmen nicht ueberein.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/Auth/register`;
      console.log('Submitting to URL:', url);
      const response = await fetch(`${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registrierung fehlgeschlagen.');
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setSuccess('Registrierung erfolgreich!');
      setFormData({ username: '', email: '', password: '' });
      setCorrectPasswordCheck('');
    } catch (submitError) {
      console.error('Error during signup:', submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unbekannter Fehler bei der Registrierung.',
      );
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-lg-5">
              <h2 className="h3 text-center mb-4">Registrieren</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="signupUsername" className="form-label">
                    Benutzername
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="signupUsername"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="signupEmail" className="form-label">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="signupEmail"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="signupPassword" className="form-label">
                    Passwort
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="signupPassword"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="signupPasswordConfirm" className="form-label">
                    Passwort bestaetigen
                  </label>
                  <input
                    type="password"
                    name="correctPasswordCheck"
                    id="signupPasswordConfirm"
                    className="form-control"
                    value={correctPasswordCheck}
                    onChange={(event) => setCorrectPasswordCheck(event.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Konto erstellen
                </button>
              </form>
              {error && (
                <div className="alert alert-danger mt-4 mb-0" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success mt-4 mb-0" role="alert">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
