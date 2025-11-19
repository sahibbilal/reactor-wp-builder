import React from 'react';

function Image({ src, alt, width, height, className, selected }) {
  const style = {
    width: width || '100%',
    height: height || 'auto',
    display: 'block',
  };

  if (!src) {
    return (
      <div
        className={`reactor-image-placeholder ${className || ''} ${selected ? 'selected' : ''}`}
        style={style}
      >
        <span>Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Image'}
      className={`reactor-image ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    />
  );
}

export default Image;

