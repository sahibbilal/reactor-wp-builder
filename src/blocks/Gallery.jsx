import React from 'react';
import { MediaLibraryButton } from '../components/MediaLibrary';

function Gallery({ 
  images = [],
  columns = 3,
  gap = '10px',
  imageSize = 'medium',
  padding,
  margin,
  backgroundColor,
  borderWidth,
  borderRadius,
  borderColor,
  borderStyle,
  className,
  customCSS,
  id,
  selected,
  onUpdate
}) {
  const handleAddImage = (imageData) => {
    // Handle both single image and array of images
    const imagesToAdd = Array.isArray(imageData) ? imageData : [imageData];
    const newImages = [...(images || []), ...imagesToAdd];
    if (onUpdate) {
      onUpdate({ images: newImages });
    }
  };

  const handleRemoveImage = (index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Create a new array without the item at the specified index
    const newImages = images.filter((_, i) => i !== index);
    if (onUpdate) {
      onUpdate({ images: newImages });
    }
  };

  const handleUpdateImage = (index, updates) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], ...updates };
    if (onUpdate) {
      onUpdate({ images: newImages });
    }
  };

  const style = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap || '10px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...(padding ? { padding } : {}),
    ...(margin ? { margin } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  if (!images || images.length === 0) {
    return (
      <div
        id={id || undefined}
        className={`reactor-gallery-placeholder ${className || ''} ${selected ? 'selected' : ''}`}
        style={{
          ...style,
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || '#f0f0f0',
          border: borderWidth ? `${borderWidth} ${borderStyle || 'solid'} ${borderColor || '#ccc'}` : '2px dashed #ccc',
          color: '#666',
        }}
      >
        <p>No images in gallery</p>
        <MediaLibraryButton
          onSelect={handleAddImage}
          multiple={true}
        >
          Add Images
        </MediaLibraryButton>
      </div>
    );
  }

  return (
    <div
      id={id || undefined}
      className={`reactor-gallery ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {images.map((image, index) => {
        let imageSrc = image.url || image.src;
        
        // Use responsive image sizes if available
        if (image.sizes) {
          if (imageSize === 'thumbnail' && image.sizes.thumbnail) {
            imageSrc = image.sizes.thumbnail.url;
          } else if (imageSize === 'medium' && image.sizes.medium) {
            imageSrc = image.sizes.medium.url;
          } else if (imageSize === 'large' && image.sizes.large) {
            imageSrc = image.sizes.large.url;
          } else if (imageSize === 'full' && image.url) {
            imageSrc = image.url;
          }
        }

        // Create a stable unique key for each image
        const imageKey = image.id ? `image-${image.id}-${index}` : `image-${index}-${image.url || image.src || ''}`;

        return (
          <div
            key={imageKey}
            className="reactor-gallery-item"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              overflow: 'hidden',
              borderRadius: '4px',
            }}
          >
            <img
              src={imageSrc}
              alt={image.alt || image.title || `Gallery image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
            {selected && (
              <button
                type="button"
                className="reactor-gallery-remove"
                onClick={(e) => handleRemoveImage(index, e)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  lineHeight: '1',
                  zIndex: 10,
                }}
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      {selected && (
        <div
          className="reactor-gallery-add"
          style={{
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
          }}
        >
          <MediaLibraryButton
            onSelect={handleAddImage}
            multiple={true}
          >
            <span style={{ fontSize: '24px' }}>+</span>
          </MediaLibraryButton>
        </div>
      )}
    </div>
  );
}

export default Gallery;

