import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../constants";
import BaumAdder from "./BaumAdder";
import { Baum } from "../constants";
import GruenFlaecheMap from "./GruenFlaecheMap";


const GruenFlaeche: React.FC = () => {
  const navigate = useNavigate();
  const { gruenFlaecheId } = useParams<{ gruenFlaecheId: string }>();
  const { gruenFlaecheName } = useParams<{ gruenFlaecheName: string }>();
  const [error, setError] = useState<string | null>(null);
  const [baeume, setBaeume] = useState<Baum[]>([]);
  const [showBaumAdder, setBaumAdder] = useState(false);
  const [showMap, setShowMap] = useState(false);
  useEffect(() => {
    const fetchBaeume = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Baum/GetByGruenFlaechenId/${gruenFlaecheId}`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!response.ok) {
          throw new Error("Baeume konnten nicht geladen werden.");
        }
        const data = await response.json();
        console.log("Fetched Baeume data:", data);
        setBaeume(data);
        setError(null);
      } catch (fetchError) {
        console.error("Error fetching Baeume:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler beim Laden der Baeume.");
      }
    };

    fetchBaeume();
  }, [gruenFlaecheId]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h1 className="h4 mb-5">{gruenFlaecheId} | {gruenFlaecheName}</h1>

        <div className="mt-4">
          <button
            type="button"
            className="btn btn-success me-2"
            onClick={() => setBaumAdder((prev) => !prev)}
          >
            {showBaumAdder ? "Formular verbergen" : "Baum hinzufuegen"}
          </button>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate("/GruenFlaechen")}
          >
            Zurueck zur Uebersicht
          </button>
        </div>

        {showBaumAdder && (
          <div className="bg-light border rounded p-3 my-4">
            <BaumAdder />
          </div>
        )}
        <button 

          type="button"
          className="btn btn-outline-primary mb-3"
         onClick={()=> {setShowMap(!showMap)}}>Karte</button>
        {showMap &&(
          <div className="bg-light border rounded p-3 my-4">
            <GruenFlaecheMap baeume={baeume} onError={setError} />
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <ul className="list-group list-group-horizontal flex-wrap">
          {baeume.map((baum) => (
            <li key={baum.id} className="list-group-item d-flex justify-content-between align-items-center">
              {baum.art}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GruenFlaeche;
