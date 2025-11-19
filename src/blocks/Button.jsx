import React from 'react';

function Button({ 
  text, 
  link, 
  backgroundColor, 
  color, 
  fontSize,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
  padding, 
  margin,
  borderRadius, 
  borderWidth,
  borderColor,
  borderStyle,
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
    backgroundColor: backgroundColor || '#0073aa',
    color: color || '#ffffff',
    padding: padding || '10px 20px',
    margin: margin || '0',
    borderRadius: borderRadius || '4px',
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : { border: 'none' }),
    ...(borderColor ? { borderColor } : {}),
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    fontSize: fontSize || '16px',
    fontWeight: fontWeight || 'normal',
    textAlign: textAlign || 'center',
    ...(lineHeight ? { lineHeight } : {}),
    ...(letterSpacing ? { letterSpacing } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...(maxWidth ? { maxWidth } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  const content = text || 'Button';

  if (link) {
    return (
      <a
        id={id || undefined}
        href={link}
        className={`reactor-button ${className || ''} ${selected ? 'selected' : ''}`}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      id={id || undefined}
      className={`reactor-button ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content}
    </button>
  );
}

export default Button;

