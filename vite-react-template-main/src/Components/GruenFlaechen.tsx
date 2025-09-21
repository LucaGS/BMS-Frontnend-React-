import React from "react";
import GruenFlaechenAdder from "./GruenFlaechenAdder";

const GruenFlaechen: React.FC = () => {
    const [showGruenFlaechenAdder, setGruenFlaechenAdder] = React.useState(false);
    const GruenFlaechen = {}
    return (
        <div>
            <h1>GruenFlaechen Component</h1>
            <button onClick={() => {setGruenFlaechenAdder(!showGruenFlaechenAdder)}}>+</button>
            {showGruenFlaechenAdder && <GruenFlaechenAdder />}
        </div>
    );
};

export default GruenFlaechen;