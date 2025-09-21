import React, { useState } from "react";

interface Baum {
    name: string;
    type: string;
    age: number;
}

interface BaumAdderProps {
    
}

const BaumAdder: React.FC<BaumAdderProps> = ({  }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [age, setAge] = useState<number>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type || age <= 0) return;
        setName("");
        setType("");
        setAge(0);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Type:
                    <input
                        type="text"
                        value={type}
                        onChange={e => setType(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Age:
                    <input
                        type="number"
                        value={age}
                        onChange={e => setAge(Number(e.target.value))}
                        min={1}
                        required
                    />
                </label>
            </div>
            <button type="submit">Add Baum</button>
        </form>
    );
};

export default BaumAdder;