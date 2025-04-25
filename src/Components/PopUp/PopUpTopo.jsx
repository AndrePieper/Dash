import React from 'react';
import './PopUpTopo.css';

const PopUpTopo = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`popup-topo ${type}`}>
      {message}
    </div>
  );
};

export default PopUpTopo;