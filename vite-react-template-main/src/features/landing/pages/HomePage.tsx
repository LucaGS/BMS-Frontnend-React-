import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: '1. Anmelden',
    text: 'Über Login registrieren oder anmelden.',
    action: 'Login',
  },
  {
    title: '2. Bäume & Grünflächen sichten',
    text: 'Listen öffnen, Details anzeigen, Bilder hochladen.',
    action: 'Bäume',
  },
  {
    title: '3. Kontrolle erfassen',
    text: 'Im Baum-Detail “Kontrolle hinzufügen”: Datum, Intervall, Verkehrssicherheit, Vitalität, Slider (Schädigungsgrad, Standfestigkeit, Bruchsicherheit) ausfüllen und speichern.',
    action: 'Neue Kontrolle',
  },
];

const HomePage: React.FC = () => (
  <section className="apple-home py-4 py-lg-5">
    <div className="apple-hero card border-0 mb-4 mb-lg-5 overflow-hidden">
      <div className="card-body p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7 text-start">
            <div className="apple-kicker mb-3">BMS </div>
            <h1 className="display-4 fw-semibold mb-3">Baum- und Grünflächenverwaltung </h1>
            <p className="lead text-muted mb-4">
              Verwalten Sie Bäume, Kontrollen und Grünflächen in einer Oberfläche.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/trees" className="btn btn-success btn-lg px-4">
                Zu den Bäumen
              </Link>
              <Link to="/green-areas" className="btn btn-outline-secondary btn-lg px-4">
                Grünflächen öffnen
              </Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="apple-hero-panel p-3 p-lg-4">
              <div className="apple-hero-panel__title mb-3">Schneller Arbeitsfluss</div>
              <div className="apple-stat-row">
                <span>Erfassen</span>
                <strong>Kontrollen mit Befunden</strong>
              </div>
              <div className="apple-stat-row">
                <span>Dokumentieren</span>
                <strong>Bilder, Maße, Standorte</strong>
              </div>
              <div className="apple-stat-row">
                <span>Exportieren</span>
                <strong>PDFs für Außendienst und Archiv</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="row g-4">
      {steps.map((step) => (
        <div key={step.title} className="col-md-4">
          <div className="card h-100 border-0 apple-step-card">
            <div className="card-body d-flex flex-column">
              <div className="apple-step-index mb-3">{step.title}</div>
              <p className="text-muted flex-grow-1">{step.text}</p>
              <span className="badge bg-success align-self-start px-3 py-2">{step.action}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default HomePage;
