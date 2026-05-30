import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import type { GreenArea } from '@/features/green-areas/types';
import AppBottomSheet from '@/shared/components/AppBottomSheet';
import { authFetch } from '@/shared/lib/auth';

type SavedFilterProfile = {
  id: string;
  name: string;
  searchTerm: string;
  selectedGreenAreaId: string;
};

const FILTER_STORAGE_KEY = 'bms-tree-filter-profiles';

const TreeList: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [greenAreas, setGreenAreas] = useState<GreenArea[]>([]);
  const [selectedGreenAreaId, setSelectedGreenAreaId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedFilterProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as SavedFilterProfile[];
      if (Array.isArray(parsed)) {
        setSavedProfiles(parsed);
      }
    } catch (storageError) {
      console.error('Error reading saved filter profiles:', storageError);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(savedProfiles));
    } catch (storageError) {
      console.error('Error storing filter profiles:', storageError);
    }
  }, [savedProfiles]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [treesResponse, greenAreasResponse] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/Trees/GetAll`),
          authFetch(`${API_BASE_URL}/api/GreenAreas/GetAll`),
        ]);

        if (!treesResponse.ok) {
          throw new Error('Failed to fetch trees');
        }
        if (!greenAreasResponse.ok) {
          throw new Error('Failed to fetch green areas');
        }

        const [treesData, greenAreasData] = await Promise.all([treesResponse.json(), greenAreasResponse.json()]);
        setTrees(Array.isArray(treesData) ? mapTreesFromApi(treesData) : []);
        setGreenAreas(Array.isArray(greenAreasData) ? greenAreasData : []);
      } catch (fetchError) {
        console.error('Error fetching trees:', fetchError);
        setError('Bäume konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGreenAreaId('all');
  };

  const applyProfile = (profile: SavedFilterProfile) => {
    setSearchTerm(profile.searchTerm);
    setSelectedGreenAreaId(profile.selectedGreenAreaId);
    setShowFilterSheet(false);
  };

  const saveCurrentProfile = () => {
    const trimmedName = profileName.trim();
    if (trimmedName.length === 0) {
      return;
    }

    const nextProfile: SavedFilterProfile = {
      id: crypto.randomUUID(),
      name: trimmedName,
      searchTerm,
      selectedGreenAreaId,
    };

    setSavedProfiles((prev) => [nextProfile, ...prev].slice(0, 8));
    setProfileName('');
  };

  const filteredTrees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return trees.filter((tree) => {
      const matchesGreenArea = selectedGreenAreaId === 'all' || tree.greenAreaId === Number(selectedGreenAreaId);
      const matchesTerm =
        term.length === 0 ||
        String(tree.number).toLowerCase().includes(term) ||
        (tree.species ?? '').toLowerCase().includes(term);
      return matchesGreenArea && matchesTerm;
    });
  }, [searchTerm, selectedGreenAreaId, trees]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-muted mb-0">Bäume werden geladen...</p>;
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      );
    }

    if (trees.length === 0) {
      return <p className="text-muted mb-0">Noch keine Bäume vorhanden.</p>;
    }

    if (filteredTrees.length === 0) {
      return <p className="text-muted mb-0">Keine Treffer für die aktuelle Suche/Filter.</p>;
    }

    return (
      <div className="tree-list-results">
        <div className="d-md-none">
          <div className="list-group mobile-entity-list">
            {filteredTrees.map((tree) => {
              const nextInspectionStatus = getNextInspectionStatus(tree.nextInspection);
              const nextInspectionLabel = nextInspectionStatus.hasValue
                ? nextInspectionStatus.relativeLabel ?? nextInspectionStatus.shortLabel
                : 'Keine nächste Kontrolle';

              return (
                <button
                  type="button"
                  className="list-group-item list-group-item-action mobile-entity-list__item"
                  key={tree.id}
                  onClick={() => handleOpenTree(tree)}
                >
                  <div className="mobile-entity-list__header">
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                      Nr. {tree.number ?? tree.id}
                    </span>
                    <span
                      className={`badge ${
                        nextInspectionStatus.isOverdue ? 'bg-danger text-white' : 'text-bg-light border'
                      }`}
                      title={nextInspectionStatus.label}
                    >
                      {nextInspectionLabel}
                    </span>
                  </div>
                  <div className="fw-semibold mb-1">{tree.species || 'Unbekannte Art'}</div>
                  <div className="text-muted small">
                    {tree.crownDiameterMeters ? `Kronendurchmesser ${tree.crownDiameterMeters} m` : 'Keine Angaben'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="d-none d-md-block">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {filteredTrees.map((tree) => {
              const nextInspectionStatus = getNextInspectionStatus(tree.nextInspection);
              const nextInspectionLabel = nextInspectionStatus.hasValue
                ? nextInspectionStatus.relativeLabel ?? nextInspectionStatus.shortLabel
                : 'Keine nächste Kontrolle';

              return (
                <div className="col" key={tree.id}>
                  <button
                    type="button"
                    className="click-card w-100 text-start"
                    onClick={() => handleOpenTree(tree)}
                  >
                    <div
                      className={`card h-100 shadow-sm border-0 ${
                        nextInspectionStatus.isOverdue ? 'border border-danger' : ''
                      }`}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                          <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                            Nr. {tree.number ?? tree.id}
                          </span>
                          <span
                            className={`badge ${
                              nextInspectionStatus.isOverdue ? 'bg-danger text-white' : 'text-bg-light border'
                            }`}
                            title={nextInspectionStatus.label}
                          >
                            {nextInspectionLabel}
                          </span>
                        </div>
                        <h2 className="h6 fw-semibold mb-1">{tree.species || 'Unbekannte Art'}</h2>
                        <p className="text-muted small mb-0">
                          {tree.crownDiameterMeters
                            ? `Kronendurchmesser ${tree.crownDiameterMeters} m`
                            : 'Keine Angaben'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <div className="text-uppercase text-muted small fw-semibold">Bäume</div>
              <h1 className="h4 mb-0">Baumliste</h1>
              <p className="text-muted mb-0">Wählen Sie einen Baum, um Details und Kontrollen zu öffnen.</p>
            </div>
            <div className="badge text-bg-light">
              {filteredTrees.length}/{trees.length} {trees.length === 1 ? 'Baum' : 'Bäume'}
            </div>
          </div>

          <div className="row g-2 mb-3 d-none d-md-flex">
            <div className="col-12 col-md-4">
              <input
                type="search"
                className="form-control"
                placeholder="Suche nach Nummer oder Art"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedGreenAreaId}
                onChange={(event) => setSelectedGreenAreaId(event.target.value)}
              >
                <option value="all">Alle Grünflächen</option>
                {greenAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-stretch">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
                disabled={searchTerm.length === 0 && selectedGreenAreaId === 'all'}
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>

          <div className="d-md-none mb-3">
            <button type="button" className="btn btn-outline-primary w-100" onClick={() => setShowFilterSheet(true)}>
              Suche und Filter
            </button>
          </div>

          {(searchTerm.length > 0 || selectedGreenAreaId !== 'all') && (
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span className="text-muted small">Aktive Eingrenzung:</span>
              {searchTerm.length > 0 && <span className="badge text-bg-light border">Suche: {searchTerm}</span>}
              {selectedGreenAreaId !== 'all' && <span className="badge text-bg-light border">Grünfläche ausgewählt</span>}
            </div>
          )}

          {renderContent()}
        </div>
      </div>

      <div className="d-md-none app-sticky-primary-bar">
        <button type="button" className="btn btn-primary w-100" onClick={() => setShowFilterSheet(true)}>
          Filter und Profile
        </button>
      </div>

      {showFilterSheet && (
        <AppBottomSheet title="Baumsuche und Filter" onClose={() => setShowFilterSheet(false)}>
          <div className="d-grid gap-3">
            <div>
              <label htmlFor="mobileTreeSearch" className="form-label small">
                Suche
              </label>
              <input
                id="mobileTreeSearch"
                type="search"
                className="form-control"
                placeholder="Nummer oder Art"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="mobileTreeArea" className="form-label small">
                Grünfläche
              </label>
              <select
                id="mobileTreeArea"
                className="form-select"
                value={selectedGreenAreaId}
                onChange={(event) => setSelectedGreenAreaId(event.target.value)}
              >
                <option value="all">Alle Grünflächen</option>
                {greenAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={resetFilters}>
                Zurücksetzen
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setShowFilterSheet(false)}>
                Anwenden
              </button>
            </div>

            <div className="border rounded-3 p-3 bg-light">
              <div className="fw-semibold mb-2">Filterprofil speichern</div>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name des Profils"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={saveCurrentProfile}
                  disabled={profileName.trim().length === 0}
                >
                  Speichern
                </button>
              </div>
            </div>

            {savedProfiles.length > 0 && (
              <div>
                <div className="fw-semibold mb-2">Gespeicherte Profile</div>
                <div className="d-grid gap-2">
                  {savedProfiles.map((profile) => (
                    <div key={profile.id} className="d-flex align-items-center gap-2 border rounded-3 p-2 bg-white">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary flex-grow-1 text-start"
                        onClick={() => applyProfile(profile)}
                      >
                        {profile.name}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setSavedProfiles((prev) => prev.filter((entry) => entry.id !== profile.id))}
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AppBottomSheet>
      )}
    </section>
  );
};

export default TreeList;
