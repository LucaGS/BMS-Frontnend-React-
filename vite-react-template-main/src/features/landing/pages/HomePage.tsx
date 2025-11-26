import React from 'react';

const steps = [
  {
    title: '1. Anmelden',
    text: 'Ueber Login registrieren oder anmelden.',
    action: 'Login',
  },
  {
    title: '2. Baeume & Gruenflaechen sichten',
    text: 'Listen oeffnen, Details anzeigen, Bilder hochladen.',
    action: 'Baeume',
  },
  {
    title: '3. Kontrolle erfassen',
    text: 'Im Baum-Detail “Kontrolle hinzufuegen”: Datum, Intervall, Verkehrssicherheit, Vitalitaet, Slider (Schaedigungsgrad, Standfestigkeit, Bruchsicherheit) ausfuellen und speichern.',
    action: 'Neue Kontrolle',
  },
];

const HomePage: React.FC = () => (
  <section className="py-5">
    <div className="text-center mb-5">
      <h1 className="display-5 fw-semibold">Willkommen im BMS-Portal</h1>
      <p className="lead text-muted">Verwalten Sie Baeume und Gruenflaechen.</p>
    </div>

    <div className="row g-4">
      {steps.map((step) => (
        <div key={step.title} className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <h2 className="h5 fw-semibold">{step.title}</h2>
              <p className="text-muted flex-grow-1">{step.text}</p>
              <span className="badge bg-success align-self-start">{step.action}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    
  </section>
);

export default HomePage;
