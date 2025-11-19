import React from 'react';

function Column({ children, width, padding, backgroundColor, className, selected }) {
  const style = {
    width: width || '100%',
    padding: padding || '10px',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
  };

  return (
    <div
      className={`reactor-column ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Column;

