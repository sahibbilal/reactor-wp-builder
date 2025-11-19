import React from 'react';

function Container({ 
  children, 
  padding, 
  backgroundColor, 
  margin,
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
    padding: padding || '20px',
    backgroundColor: backgroundColor || 'transparent',
    margin: margin || '0',
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
      className={`reactor-container ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Container;

