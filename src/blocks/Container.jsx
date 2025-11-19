import React from 'react';

function Container({ children, padding, backgroundColor, margin, className, selected }) {
  const style = {
    padding: padding || '20px',
    backgroundColor: backgroundColor || 'transparent',
    margin: margin || '0',
    minHeight: '50px',
  };

  return (
    <div
      className={`reactor-container ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Container;

