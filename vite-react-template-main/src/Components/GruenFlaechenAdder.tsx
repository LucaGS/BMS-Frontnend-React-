import React, { useState } from "react";

interface GruenFlaeche {
    id: number;
    name: string
}
interface GruenFlaecheDto {
    name: string;
}

const GruenFlaechenAdder: React.FC = () => {
    const [gruenFlaechen, setGruenFlaechen] = useState<GruenFlaeche[]>([]);
    const [name, setName] = useState("");



    const handleAdd = () => {
        if (!name) return;
        const newGruenFlaeche: GruenFlaecheDto = {
            name,
            
        };
        try{
            
        }
        //setGruenFlaechen([...gruenFlaechen, newGruenFlaeche]);
        setName("");
   
    
    };

    return (
        <div>
            <h2>Grünflächen hinzufügen</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
             
                <input
                    type="text"
                    placeholder="Kunden Name"
                  
                    onChange={(e) => setName(e.target.value)}
                />
            
                
                <button onClick={handleAdd}>Hinzufügen</button>
            </div>
            <ul>
                {gruenFlaechen.map((gf) => (
                    <li key={gf.id}>
                        {gf.name} 
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GruenFlaechenAdder;