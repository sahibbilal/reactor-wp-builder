import React from 'react';

function Heading({ content, level = 2, fontSize, color, className, selected }) {
  const Tag = `h${level}`;
  const style = {
    fontSize: fontSize || '24px',
    color: color || '#000000',
    margin: '0 0 10px 0',
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

