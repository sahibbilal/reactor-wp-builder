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
  borderStyle,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  width,
  height,
  minWidth,
  maxWidth,
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
    display: 'flex',
    gap: gap || '20px',
    alignItems: alignItems || 'stretch',
    justifyContent: justifyContent || 'flex-start',
    padding: padding || '0',
    margin: margin || '0',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
    width: width || '100%',
    maxWidth: maxWidth || '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
    ...(backgroundSize ? { backgroundSize } : {}),
    ...(backgroundPosition ? { backgroundPosition } : {}),
    ...(backgroundRepeat ? { backgroundRepeat } : {}),
    ...(height ? { height } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  return (
    <div
      id={id || undefined}
      className={`reactor-row ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Row;

