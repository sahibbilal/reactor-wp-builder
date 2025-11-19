import React from 'react';

function Column({ 
  children, 
  width, 
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
    // Use width if provided, otherwise default to auto (flex will handle it)
    ...(width ? { width: width } : { flex: '1 1 auto' }),
    padding: padding || '10px',
    margin: margin || '0',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
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

