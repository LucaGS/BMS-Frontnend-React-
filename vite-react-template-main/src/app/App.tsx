import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import GreenAreaList from '@/features/green-areas/components/GreenAreaList';
import GreenAreaDetails from '@/features/green-areas/components/GreenAreaDetails';
import { API_BASE_URL } from '@/shared/config/appConfig';

type LocationState = {
  tree?: Tree;
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
        const response = await fetch(`${API_BASE_URL}/api/Tree/GetAll`, {
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

const App: React.FC = () => (
  <BrowserRouter>
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AppHeader />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/imprint" element={<ImprintPage />} />
            <Route path="/trees" element={<TreeList />} />
            <Route path="/trees/:treeId" element={<RoutedTreeDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/green-areas" element={<GreenAreaList />} />
            <Route path="/green-areas/:greenAreaId/:greenAreaName" element={<GreenAreaDetails />} />
          </Routes>
        </div>
      </main>
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>&copy; {new Date().getFullYear()} BMS</small>
      </footer>
      <CookieBanner />
    </div>
  </BrowserRouter>
);

export default App;
