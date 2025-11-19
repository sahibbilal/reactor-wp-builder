import React from 'react';

function Button({ 
  text, 
  link, 
  backgroundColor, 
  color, 
  fontSize,
  fontWeight,
  textAlign,
  padding, 
  margin,
  borderRadius, 
  borderWidth,
  borderColor,
  className, 
  selected 
}) {
  const style = {
    backgroundColor: backgroundColor || '#0073aa',
    color: color || '#ffffff',
    padding: padding || '10px 20px',
    margin: margin || '0',
    borderRadius: borderRadius || '4px',
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : { border: 'none' }),
    ...(borderColor ? { borderColor } : {}),
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    fontSize: fontSize || '16px',
    fontWeight: fontWeight || 'normal',
    textAlign: textAlign || 'center',
  };

  const content = text || 'Button';

  if (link) {
    return (
      <a
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
      className={`reactor-button ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content}
    </button>
  );
}

export default Button;

