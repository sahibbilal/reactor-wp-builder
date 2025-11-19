import React from 'react';

function Section({ children, padding, backgroundColor, margin, className, customCSS, selected }) {
  const style = {
    padding: padding || '20px',
    backgroundColor: backgroundColor || '#ffffff',
    margin: margin || '0',
    minHeight: '50px',
    ...(customCSS ? {} : {}), // Custom CSS would be applied via style tag
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

