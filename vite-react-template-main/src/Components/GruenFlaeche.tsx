import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface GruenFlaecheData {
    id: number;
    name: string;
}

const GruenFlaeche: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedGruenFlaeche = location.state as GruenFlaecheData | undefined;

    if (!selectedGruenFlaeche) {
        return (
            <div>
                <h1>GruenFlaeche</h1>
                <p>Keine GruenFlaeche ausgewaehlt.</p>
                <button type="button" onClick={() => navigate('/GruenFlaechen')}>Zurueck zur Uebersicht</button>
            </div>
        );
    }

    return (
        <div>
            <h1>{selectedGruenFlaeche.name}</h1>
            <p>ID: {selectedGruenFlaeche.id}</p>
        </div>
    );
};

export default GruenFlaeche;
