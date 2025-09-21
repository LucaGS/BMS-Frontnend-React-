import React, { useState } from 'react';
import BaumAdder from './BaumAdder';
const Baum: React.FC = () => {
   const token = localStorage.getItem('token') || '';
   const [toggleButtonText, setToggleButtonText] = useState('+');
   const [showBaumAdder ,setShowBaumAdder] = useState(false);
    return (
        <div
       >
    <button onClick={() => setShowBaumAdder(!showBaumAdder)}>{toggleButtonText}</button>
    {showBaumAdder &&(<BaumAdder ></BaumAdder>)}
       </div>
       
    );
};

export default Baum;