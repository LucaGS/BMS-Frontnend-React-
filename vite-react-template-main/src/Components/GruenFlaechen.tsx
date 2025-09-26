import React, { useEffect, useState } from "react";
import GruenFlaechenAdder from "./GruenFlaechenAdder";
import { API_BASE_URL } from "../constants";
import { useNavigate } from "react-router-dom";

interface GruenFlaeche {
    id: number;
    name: string;
}
// Function to fetch GruenFlaechen from the backend 
const fetchGruenFlaechen = async(): Promise<GruenFlaeche[]> => {
    try {
        const response = await fetch(API_BASE_URL + '/api/GruenFlaechen/GetAll', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('token') || ''}`,
            },
        });
        if (!response || !response.ok) {
            throw new Error("Failed to fetch GruenFlaechen");
        }
        return response.json();
    }
    catch (error) {
        console.error("Error fetching GruenFlaechen:", error);
        return Promise.resolve([]);}
}
const GruenFlaechen: React.FC = () => {
    const navigate = useNavigate();

    const [showGruenFlaechenAdder, setGruenFlaechenAdder] = React.useState(false); // State to control visibility of the adder
    const [gruenFlaechen, setGruenFlaechen] = useState<GruenFlaeche[]>([]); //State to hold the list of GruenFlaechen

    //Initial fetch of GruenFlaechen
   useEffect(() => {
         fetchGruenFlaechen().then(setGruenFlaechen);
   }, []);

    return (
        <div>
            <h1>GruenFlaechen Component</h1>
            <button onClick={() => { setGruenFlaechenAdder(!showGruenFlaechenAdder); }}>+</button>
            {showGruenFlaechenAdder && (
                <GruenFlaechenAdder value={gruenFlaechen} onChange={setGruenFlaechen} />
            )}
            <ul>
                {gruenFlaechen.map((gf) => (
                    <li key={gf.id}>
                        <button type="button" onClick={() => navigate(`/GruenFlaechen/${gf.id}`, { state: gf })}>
                            {gf.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GruenFlaechen;