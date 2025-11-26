import React from 'react';
import { Link } from 'react-router-dom';

const InspectionListPage: React.FC = () => (
  <section className="card shadow-sm border-0">
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div className="text-uppercase text-muted small fw-semibold mb-1">Kontrollen</div>
          <h1 className="h4 mb-0">Kontrolluebersicht</h1>
          <p className="text-muted mb-0">
            Navigieren Sie zu einem Baum und erfassen oder oeffnen Sie dessen Kontrollen.
          </p>
        </div>
        <Link to="/trees" className="btn btn-outline-primary">
          Zur Baumliste
        </Link>
      </div>
      <div className="border rounded-3 p-3 bg-light">
        <h2 className="h6">So finden Sie Kontrollen</h2>
        <ol className="mb-0 text-muted ps-3">
          <li>Oeffnen Sie die Baumliste und waehlen Sie einen Baum aus.</li>
          <li>Scrollen Sie zu &quot;Kontrollen&quot; und oeffnen Sie die gewuenschte Kontrolle.</li>
          <li>Nutzen Sie die Breadcrumbs auf Detailseiten, um schnell zurueckzuspringen.</li>
        </ol>
      </div>
    </div>
  </section>
);

export default InspectionListPage;
