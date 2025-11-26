import React from 'react';

const ImprintPage: React.FC = () => (
  <section className="py-5">
    <h1 className="h3 fw-semibold mb-4">Impressum</h1>
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h2 className="h5">Betreiber</h2>
        <p className="mb-4">
          Luca Stieme <br />
          Die Premen&auml;cker 2D <br />
          61138 Niederdorfelden <br />
          Deutschland
        </p>

        <h3 className="h6">Kontakt</h3>
        <p className="mb-4">
          E-Mail: luca.stieme@outlook.de
        </p>

        <h3 className="h6">Vertretungsberechtigt</h3>
        <p className="mb-4">Luca Stieme</p>

        <h3 className="h6">Hinweise</h3>
        <p className="mb-0 text-muted">
          Inhalte werden mit groesster Sorgfalt gepflegt. Fuer externe Links wird keine Haftung
          uebernommen. Diese Anwendung dient der Verwaltung von Baeumen und Gruenflaechen.
        </p>
      </div>
    </div>
  </section>
);

export default ImprintPage;
