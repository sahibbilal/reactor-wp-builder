import React from 'react';

function Container({ 
  children, 
  padding, 
  backgroundColor, 
  margin,
  borderWidth,
  borderRadius,
  borderColor,
  className, 
  selected 
}) {
  const style = {
    padding: padding || '20px',
    backgroundColor: backgroundColor || 'transparent',
    margin: margin || '0',
    minHeight: '50px',
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
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

