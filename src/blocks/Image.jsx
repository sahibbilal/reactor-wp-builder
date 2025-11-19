import React, { useMemo } from 'react';

function Image({ 
  src, 
  alt, 
  width, 
  height, 
  padding,
  margin,
  backgroundColor,
  borderWidth,
  borderRadius,
  borderColor,
  borderStyle,
  opacity,
  boxShadow,
  transform,
  transition,
  className, 
  customCSS,
  id,
  selected, 
  attachmentId, 
  sizes,
  imageSize = 'medium'
}) {
  const style = {
    width: width || '100%',
    height: height || 'auto',
    display: 'block',
    ...(padding ? { padding } : {}),
    ...(margin ? { margin } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  // Use responsive image if sizes are available based on selected imageSize
  // Use useMemo to recalculate when imageSize or sizes change
  const imageSrc = useMemo(() => {
    if (!sizes || !imageSize) {
      return src;
    }
    
    if (imageSize === 'full') {
      return src; // Use original full size
    }
    
    // Check if the requested size exists
    if (sizes[imageSize] && sizes[imageSize].url) {
      return sizes[imageSize].url;
    }
    
    // Fallback to available sizes
    if (sizes.medium && sizes.medium.url) {
      return sizes.medium.url;
    }
    if (sizes.large && sizes.large.url) {
      return sizes.large.url;
    }
    if (sizes.thumbnail && sizes.thumbnail.url) {
      return sizes.thumbnail.url;
    }
    
    // Final fallback to original src
    return src;
  }, [src, sizes, imageSize]);

  if (!src) {
    return (
      <div
        id={id || undefined}
        className={`reactor-image-placeholder ${className || ''} ${selected ? 'selected' : ''}`}
        style={{
          ...style,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || '#f0f0f0',
          border: borderWidth ? `${borderWidth} ${borderStyle || 'solid'} ${borderColor || '#ccc'}` : '2px dashed #ccc',
          color: '#666',
        }}
      >
        <span>Click to add image</span>
      </div>
    );
  }

  return (
    <img
      id={id || undefined}
      key={`${id || 'img'}-${imageSize}-${imageSrc}`}
      src={imageSrc || src}
      alt={alt || 'Image'}
      className={`reactor-image ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
      loading="lazy"
    />
  );
}

export default Image;

