import React from 'react';

function Row({ 
  children, 
  gap, 
  alignItems, 
  justifyContent, 
  padding, 
  margin,
  backgroundColor, 
  borderWidth,
  borderRadius,
  borderColor,
  className, 
  selected 
}) {
  const style = {
    display: 'flex',
    gap: gap || '20px',
    alignItems: alignItems || 'stretch',
    justifyContent: justifyContent || 'flex-start',
    padding: padding || '0',
    margin: margin || '0',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <div
      className={`reactor-row ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Row;

