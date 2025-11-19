import React from 'react';

function Button({ text, link, backgroundColor, color, padding, borderRadius, className, selected }) {
  const style = {
    backgroundColor: backgroundColor || '#0073aa',
    color: color || '#ffffff',
    padding: padding || '10px 20px',
    borderRadius: borderRadius || '4px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    fontSize: '16px',
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

