import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'bms-cookie-consent';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3"
      style={{ zIndex: 1080, pointerEvents: 'none' }}
    >
      <div
        className="toast show bg-dark text-white shadow-lg border-0"
        role="status"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="toast-body d-flex flex-column flex-md-row align-items-md-center gap-3">
          <div>
            <div className="fw-semibold">Speicherhinweis</div>
            <div className="small text-light">
              Diese Anwendung verwendet nur technisch erforderliche Browser-Speicherungen für Anmeldestatus und
              Hinweisbestätigung. Details finden Sie in der{' '}
              <Link to="/privacy" className="cookie-banner-link">
                Datenschutzerklärung
              </Link>
              .
            </div>
          </div>
          <div className="ms-md-auto d-flex gap-2">
            <button type="button" className="btn btn-light btn-sm" onClick={accept}>
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
