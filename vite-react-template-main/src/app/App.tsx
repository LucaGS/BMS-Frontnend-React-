import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { Tree } from '@/entities/tree';
import AppHeader from '@/widgets/layout/AppHeader';
import HomePage from '@/pages/home/HomePage';
import AboutPage from '@/pages/about/AboutPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import TreeList from '@/features/trees/components/TreeList';
import TreeDetails from '@/features/trees/components/TreeDetails';
import GreenAreaList from '@/features/green-areas/components/GreenAreaList';
import GreenAreaDetails from '@/features/green-areas/components/GreenAreaDetails';

type LocationState = {
  tree?: Tree;
};

const RoutedTreeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };

  return <TreeDetails tree={state?.tree} onBack={() => navigate(-1)} />;
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
    </div>
  </BrowserRouter>
);

export default App;
