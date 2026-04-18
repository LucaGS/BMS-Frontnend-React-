import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import AppHeader from '@/widgets/layout/AppHeader';
import CookieBanner from '@/widgets/layout/CookieBanner';
import HomePage from '@/features/landing/pages/HomePage';
import AboutPage from '@/features/landing/pages/AboutPage';
import ImprintPage from '@/features/landing/pages/ImprintPage';
import PrivacyPage from '@/features/landing/pages/PrivacyPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { AUTH_TOKEN_CHANGED_EVENT, authFetch, clearStoredToken, getStoredToken } from '@/shared/lib/auth';

const TreeList = React.lazy(() => import('@/features/trees/components/TreeList'));
const TreeDetails = React.lazy(() => import('@/features/trees/components/TreeDetails'));
const InspectionDetails = React.lazy(() => import('@/features/inspections/components/InspectionDetails'));
const InspectionListPage = React.lazy(() => import('@/features/inspections/pages/InspectionListPage'));
const GreenAreaList = React.lazy(() => import('@/features/green-areas/components/GreenAreaList'));
const GreenAreaDetails = React.lazy(() => import('@/features/green-areas/components/GreenAreaDetails'));

type LocationState = {
  tree?: Tree;
};

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

const RouteFallback: React.FC = () => (
  <section>
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center text-muted">Ansicht wird geladen...</div>
    </div>
  </section>
);

const ProtectedRoute: React.FC<{
  authStatus: AuthStatus;
  children: React.ReactNode;
}> = ({ authStatus, children }) => {
  const location = useLocation();

  if (authStatus === 'checking') {
    return (
      <section>
        <div className="card shadow-sm border-0">
          <div className="card-body p-5 text-center text-muted">Sitzung wird geprüft...</div>
        </div>
      </section>
    );
  }

  if (authStatus !== 'authenticated') {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children}</>;
};

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
        const response = await authFetch(`${API_BASE_URL}/api/Trees/GetAll`);

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
      <Suspense fallback={<RouteFallback />}>
        <TreeDetails tree={resolvedTree} onBack={() => navigate(-1)} />
      </Suspense>
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
      const response = await authFetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
        headers: {
          'Content-Type': 'application/json',
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
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route
              path="/trees"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <Suspense fallback={<RouteFallback />}>
                    <TreeList />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trees/:treeId"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <RoutedTreeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspections"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <Suspense fallback={<RouteFallback />}>
                    <InspectionListPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspections/:inspectionId"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <Suspense fallback={<RouteFallback />}>
                    <InspectionDetails />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/green-areas"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <Suspense fallback={<RouteFallback />}>
                    <GreenAreaList />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/green-areas/:greenAreaId/:greenAreaName"
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <Suspense fallback={<RouteFallback />}>
                    <GreenAreaDetails />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
      <footer className="app-footer text-center py-3 mt-auto">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3 px-3">
          <small>&copy; {new Date().getFullYear()} BMS</small>
          <Link to="/imprint" className="app-footer__link">
            Impressum
          </Link>
          <Link to="/privacy" className="app-footer__link">
            Datenschutz
          </Link>
        </div>
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
