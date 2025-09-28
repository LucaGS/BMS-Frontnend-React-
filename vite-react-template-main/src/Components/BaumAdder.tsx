import React, { useState } from 'react';

const BaumAdder: React.FC = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [age, setAge] = useState<number>(0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !type || age <= 0) {
      return;
    }
    // TODO: Backend-Anbindung fuer neue Baeume ergaenzen
    setName('');
    setType('');
    setAge(0);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-4">
          <label htmlFor="treeName" className="form-label">
            Name
          </label>
          <input
            id="treeName"
            type="text"
            className="form-control"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="z. B. Eiche"
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="treeType" className="form-label">
            Typ
          </label>
          <input
            id="treeType"
            type="text"
            className="form-control"
            value={type}
            onChange={(event) => setType(event.target.value)}
            required
            placeholder="Baumart"
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="treeAge" className="form-label">
            Alter
          </label>
          <input
            id="treeAge"
            type="number"
            className="form-control"
            value={age}
            onChange={(event) => setAge(Number(event.target.value))}
            min={1}
            required
          />
        </div>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <button type="submit" className="btn btn-success">
          Baum hinzufuegen
        </button>
      </div>
    </form>
  );
};

export default BaumAdder;
