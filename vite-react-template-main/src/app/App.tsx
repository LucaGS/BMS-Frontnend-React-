import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import AppHeader from '@/widgets/layout/AppHeader';
import CookieBanner from '@/widgets/layout/CookieBanner';
import HomePage from '@/features/landing/pages/HomePage';
import AboutPage from '@/features/landing/pages/AboutPage';
import ImprintPage from '@/features/landing/pages/ImprintPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import TreeList from '@/features/trees/components/TreeList';
import TreeDetails from '@/features/trees/components/TreeDetails';
import InspectionDetails from '@/features/inspections/components/InspectionDetails';
import InspectionListPage from '@/features/inspections/pages/InspectionListPage';
import GreenAreaList from '@/features/green-areas/components/GreenAreaList';
import GreenAreaDetails from '@/features/green-areas/components/GreenAreaDetails';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { AUTH_TOKEN_CHANGED_EVENT, clearStoredToken, getStoredToken } from '@/shared/lib/auth';

type LocationState = {
  tree?: Tree;
};

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

const RoutedTreeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };
  const { treeId } = useParams<{ treeId?: string }>();
  const locationTree = state?.tree;
  const [resolvedTree, setResolvedTree] = useState<Tree | null>(locationTree ?? null);
  const [isLoading, setIsLoading] = useState(!locationTree && Boolean(treeId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationTree) {
      setResolvedTree(locationTree);
      setIsLoading(false);
      setError(null);
    }
  }, [locationTree]);

  useEffect(() => {
    if (locationTree || !treeId) {
      return;
    }

    let isCancelled = false;

    const loadTree = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/Trees/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load trees.');
        }

        const payload = await response.json();
        const trees = Array.isArray(payload) ? mapTreesFromApi(payload) : [];
        const numericTreeId = Number.parseInt(treeId, 10);
        const foundTree = trees.find((tree) => tree.id === numericTreeId) ?? null;

        if (!isCancelled) {
          setResolvedTree(foundTree);
          if (!foundTree) {
            setError('Baum konnte nicht geladen werden.');
          }
        }
      } catch (loadError) {
        if (!isCancelled) {
          console.error('Error loading tree:', loadError);
          setError('Baum konnte nicht geladen werden.');
          setResolvedTree(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTree();

    return () => {
      isCancelled = true;
    };
  }, [locationTree, treeId]);

  if (!resolvedTree && isLoading) {
    return (
      <section>
        <div className="card shadow-sm border-0">
          <div className="card-body p-5 text-center text-muted">Baumdaten werden geladen...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      {error && !resolvedTree && !isLoading && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      <TreeDetails tree={resolvedTree} onBack={() => navigate(-1)} />
    </>
  );
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => (getStoredToken() ? 'checking' : 'unauthenticated'));
  const [authMessage, setAuthMessage] = useState<string | null>(() =>
    getStoredToken() ? 'Sitzung wird geprüft...' : 'Sie sind aktuell nicht eingeloggt.',
  );

  const verifyAuth = React.useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setAuthStatus('unauthenticated');
      setAuthMessage('Sie sind aktuell nicht eingeloggt.');
      return;
    }

    setAuthStatus('checking');
    setAuthMessage('Sitzung wird geprüft...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${token}`,
        },
      });

      if (response.ok) {
        setAuthStatus('authenticated');
        setAuthMessage(null);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        clearStoredToken();
        setAuthStatus('unauthenticated');
        setAuthMessage('Ihre Sitzung ist abgelaufen. Bitte erneut einloggen.');
        return;
      }

      setAuthStatus('authenticated');
      setAuthMessage('Anmeldung konnte gerade nicht vollständig geprüft werden.');
    } catch (authError) {
      console.error('Error checking authentication status:', authError);
      setAuthStatus('authenticated');
      setAuthMessage('Anmeldung konnte gerade nicht geprüft werden.');
    }
  }, []);

  useEffect(() => {
    void verifyAuth();
  }, [verifyAuth]);

  useEffect(() => {
    const handleAuthChanged = () => {
      void verifyAuth();
    };

    window.addEventListener('storage', handleAuthChanged);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthChanged as EventListener);
    return () => {
      window.removeEventListener('storage', handleAuthChanged);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthChanged as EventListener);
    };
  }, [verifyAuth]);

  const handleLogout = React.useCallback(() => {
    clearStoredToken();
    setAuthStatus('unauthenticated');
    setAuthMessage('Sie wurden abgemeldet.');
  }, []);

  const showUnauthenticatedBanner = authStatus === 'unauthenticated' && location.pathname !== '/login' && location.pathname !== '/signup';
  const showCheckingBanner = authStatus === 'checking';

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <AppHeader authStatus={authStatus} onLogout={handleLogout} />
      {(showCheckingBanner || showUnauthenticatedBanner) && (
        <div className="container app-container mt-3">
          <div className={`alert app-auth-banner ${showCheckingBanner ? 'alert-info' : 'alert-warning'}`} role="status">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <span>{authMessage}</span>
              {showUnauthenticatedBanner && (
                <Link to="/login" className="btn btn-sm btn-outline-secondary align-self-start align-self-md-center">
                  Zum Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="app-main flex-grow-1 py-4 py-lg-5">
        <div className="container app-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/imprint" element={<ImprintPage />} />
            <Route path="/trees" element={<TreeList />} />
            <Route path="/trees/:treeId" element={<RoutedTreeDetails />} />
            <Route path="/inspections" element={<InspectionListPage />} />
            <Route path="/inspections/:inspectionId" element={<InspectionDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/green-areas" element={<GreenAreaList />} />
            <Route path="/green-areas/:greenAreaId/:greenAreaName" element={<GreenAreaDetails />} />
          </Routes>
        </div>
      </main>
      <footer className="app-footer text-center py-3 mt-auto">
        <small>&copy; {new Date().getFullYear()} BMS</small>
      </footer>
      <CookieBanner />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
