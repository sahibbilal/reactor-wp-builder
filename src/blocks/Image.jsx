import React from 'react';

function Image({ src, alt, width, height, className, selected, attachmentId, sizes }) {
  const style = {
    width: width || '100%',
    height: height || 'auto',
    display: 'block',
  };

  // Use responsive image if sizes are available
  let imageSrc = src;
  if (sizes && sizes.medium) {
    imageSrc = sizes.medium.url;
  } else if (sizes && sizes.thumbnail) {
    imageSrc = sizes.thumbnail.url;
  }

  if (!src) {
    return (
      <div
        className={`reactor-image-placeholder ${className || ''} ${selected ? 'selected' : ''}`}
        style={{
          ...style,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          border: '2px dashed #ccc',
          color: '#666',
        }}
      >
        <span>Click to add image</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc || src}
      alt={alt || 'Image'}
      className={`reactor-image ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
      loading="lazy"
    />
  );
}

export default Image;

