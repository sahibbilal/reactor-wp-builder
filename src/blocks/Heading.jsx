import React from 'react';

function Heading({ 
  content, 
  level = 2, 
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
  const Tag = `h${level}`;
  const style = {
    fontSize: fontSize || '24px',
    fontWeight: fontWeight || 'bold',
    color: color || '#000000',
    textAlign: textAlign || 'left',
    margin: margin || '0 0 10px 0',
    padding: padding || '0',
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <Tag
      className={`reactor-heading ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content || 'Heading'}
    </Tag>
  );
}

export default Heading;

