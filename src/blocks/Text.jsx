import React from 'react';

function Text({ 
  content, 
  fontSize, 
  fontWeight,
  color, 
  textAlign,
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
    fontSize: fontSize || '16px',
    fontWeight: fontWeight || 'normal',
    color: color || '#000000',
    textAlign: textAlign || 'left',
    margin: margin || '0',
    padding: padding || '0',
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <p
      className={`reactor-text ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content || 'Text block'}
    </p>
  );
}

export default Text;

