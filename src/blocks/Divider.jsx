import React from 'react';

function Divider({ 
  height, 
  color, 
  margin,
  padding,
  backgroundColor,
  borderWidth,
  borderRadius,
  borderColor,
  borderStyle,
  width,
  opacity,
  boxShadow,
  transform,
  transition,
  className,
  customCSS,
  id,
  selected 
}) {
  const style = {
    height: height || '1px',
    backgroundColor: backgroundColor || color || '#cccccc',
    margin: margin || '20px 0',
    border: 'none',
    width: width || '100%',
    ...(padding ? { padding } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  return (
    <hr
      id={id || undefined}
      className={`reactor-divider ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    />
  );
}

export default Divider;

