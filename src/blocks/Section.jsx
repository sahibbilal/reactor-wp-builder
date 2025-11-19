import React from 'react';

function Section({ 
  children, 
  padding, 
  backgroundColor, 
  margin, 
  borderWidth,
  borderRadius,
  borderColor,
  className, 
  customCSS, 
  selected 
}) {
  const style = {
    padding: padding || '20px',
    backgroundColor: backgroundColor || '#ffffff',
    margin: margin || '0',
    minHeight: '50px',
    ...(borderWidth ? { borderWidth, borderStyle: 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <section
      className={`reactor-section ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </section>
  );
}

export default Section;

