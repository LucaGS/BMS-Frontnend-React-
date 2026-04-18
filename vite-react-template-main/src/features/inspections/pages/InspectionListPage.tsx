import React from 'react';
import { Link } from 'react-router-dom';

const InspectionListPage: React.FC = () => (
  <section className="card shadow-sm border-0">
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div className="text-uppercase text-muted small fw-semibold mb-1">Kontrollen</div>
          <h1 className="h4 mb-0">Kontrollübersicht</h1>
          <p className="text-muted mb-0">
            Navigieren Sie zu einem Baum und erfassen oder öffnen Sie dessen Kontrollen.
          </p>
        </div>
        <Link to="/trees" className="btn btn-outline-primary">
          Zur Baumliste
        </Link>
      </div>
      <div className="flow-panel">
        <div className="flow-panel__header mb-3">
          <div>
            <h2 className="h6 mb-1">So kommen Sie am schnellsten zur Kontrolle</h2>
            <p className="text-muted mb-0 small">Kontrollen sind bewusst am Baum aufgehängt, damit Kontext, Bilder und Standort nicht verloren gehen.</p>
          </div>
        </div>
        <div className="flow-steps row g-3 mb-3">
          <div className="col-md-4">
            <div className="flow-step h-100">
              <div className="flow-step__index">1</div>
              <div className="fw-semibold mb-1">Baum öffnen</div>
              <div className="text-muted small">Starten Sie in der Baumliste mit Suche oder Grünflächenfilter.</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="flow-step h-100">
              <div className="flow-step__index">2</div>
              <div className="fw-semibold mb-1">Kontrolle hinzufügen</div>
              <div className="text-muted small">Im Baumdetail liegt das Formular direkt über der Kontrollhistorie.</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="flow-step h-100">
              <div className="flow-step__index">3</div>
              <div className="fw-semibold mb-1">Eintrag öffnen</div>
              <div className="text-muted small">Vorhandene Kontrollen lassen sich von dort direkt prüfen und exportieren.</div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/trees" className="btn btn-success">
            Baum auswählen
          </Link>
          <Link to="/green-areas" className="btn btn-outline-secondary">
            Über Grünflächen navigieren
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default InspectionListPage;
