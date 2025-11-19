import React from 'react';

function Row({ children, gap, alignItems, justifyContent, padding, backgroundColor, className, selected }) {
  const style = {
    display: 'flex',
    gap: gap || '20px',
    alignItems: alignItems || 'stretch',
    justifyContent: justifyContent || 'flex-start',
    padding: padding || '0',
    backgroundColor: backgroundColor || 'transparent',
    minHeight: '50px',
  };

  return (
    <div
      className={`reactor-row ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Row;

