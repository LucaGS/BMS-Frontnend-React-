import React, { useState } from "react";
import { API_BASE_URL } from "../constants";

interface GruenFlaeche {
    id: number;
    name: string;
}
interface GruenFlaecheDto {
    name: string;
}
interface GruenFlaechenAdderProps {
    value: GruenFlaeche[];
    onChange: (next: GruenFlaeche[]) => void;
}

const GruenFlaechenAdder: React.FC<GruenFlaechenAdderProps> = ({ value, onChange }) => {
    const [name, setName] = useState("");

    const handleAdd = async () => {
        if (!name) return;
        const newGruenFlaeche: GruenFlaecheDto = {
            name,
        };
        try {
            const response = await fetch(API_BASE_URL + '/api/GruenFlaechen/Create ', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${localStorage.getItem('token') || ''}`,
                },
                body: JSON.stringify(newGruenFlaeche),
            });
            if (!response || !response.ok) {
                throw new Error("Failed to add GruenFlaeche");
            }
            const data = await response.json();
            const createdGruenFlaeche: GruenFlaeche = {
                id: data.id,
                name: data.name,
            };
            onChange([...value, createdGruenFlaeche]);
            console.log("GruenFlaeche added:", createdGruenFlaeche);
            setName("");
        }
        catch (error) {
            console.error("Error adding GruenFlaeche:", error);
        }
    };

    return (
        <div>
            <h2>Gruenflaechen hinzufuegen</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />


                <button onClick={handleAdd}>Hinzufuegen</button>
                
            </div>
        </div>
    );
};

export default GruenFlaechenAdder;