import React from 'react';

function Divider({ height, color, margin, className, selected }) {
  const style = {
    height: height || '1px',
    backgroundColor: color || '#cccccc',
    margin: margin || '20px 0',
    border: 'none',
    width: '100%',
  };

  return (
    <hr
      className={`reactor-divider ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    />
  );
}

export default Divider;

