import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Login from './Components/Login';
import Baum from './Components/Baeume';
import BaumAdder from './Components/BaumAdder';
import Signup from './Components/Signup';
import GruenFlaechen from './Components/GruenFlaechen';
import GruenFlaeche from './Components/GruenFlaeche';
import { useEffect } from 'react';
const Home: React.FC = () => (
  <section className="py-5 text-center">
    <h1 className="display-5 fw-semibold">Willkommen im BMS-Portal</h1>
    <p className="lead text-muted">
      Verwalten Sie Baeume und Gruenflaechen 
    </p>
  </section>
);

const About: React.FC = () => (
  <section className="py-5">
    <h1 className="h2 mb-3">Ueber diese Anwendung</h1>
    <p className="text-muted">
      Dieses Portal unterstuetzt Sie bei der Pflege und Verwaltung staedtischer Baeume und Gruenflaechen.
    </p>
  </section>
);
// Token expiration check


const App: React.FC = () => (
  <Router>
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/Baum" element={<Baum />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/GruenFlaechen" element={<GruenFlaechen />} />
            <Route path="/GruenFlaechen/:gruenFlaecheId/:gruenFlaecheName" element={<GruenFlaeche />} />
          </Routes>
        </div>
      </main>
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>&copy; {new Date().getFullYear()} BMS</small>
      </footer>
    </div>
  </Router>
);

export default App;
