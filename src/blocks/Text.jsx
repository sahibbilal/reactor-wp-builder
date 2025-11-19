import React from 'react';

function Text({ content, fontSize, color, className, selected }) {
  const style = {
    fontSize: fontSize || '16px',
    color: color || '#000000',
    margin: '0',
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

