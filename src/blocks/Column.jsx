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
  borderStyle,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
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
    // Use width if provided, otherwise default to auto (flex will handle it)
    ...(width ? { width: width, maxWidth: maxWidth || width } : { flex: '1 1 auto', maxWidth: maxWidth || '100%' }),
    padding: padding || '10px',
    margin: margin || '0',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
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
      className={`reactor-column ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Column;

