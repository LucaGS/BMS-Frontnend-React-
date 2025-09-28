import React, { useState } from 'react';
import BaumAdder from './BaumAdder';

const Baum: React.FC = () => {
  const [showBaumAdder, setShowBaumAdder] = useState(false);

  const handleToggle = () => {
    setShowBaumAdder((prev) => !prev);
  };

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h4 mb-1">Baeume verwalten</h1>
              <p className="text-muted mb-0">Fuegen Sie neue Baeume zur Sammlung hinzu.</p>
            </div>
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={handleToggle}
            >
              {showBaumAdder ? 'Baumformular verbergen' : 'Neuen Baum anlegen'}
            </button>
          </div>
          {showBaumAdder && (
            <div className="border rounded p-3 bg-light">
              <BaumAdder />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Baum;
