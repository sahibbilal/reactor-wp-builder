import React from 'react';

/**
 * Component for Media Library button
 * Uses WordPress's default wp.media functionality
 * Implementation based on reactor-builder-starter
 */
export function MediaLibraryButton({ onSelect, currentImageId, children, multiple = false }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple implementation like reactor-builder-starter
    const frame = wp.media({
      title: multiple ? 'Select or Upload Images' : 'Select or Upload Image',
      button: {
        text: multiple ? 'Use selected images' : 'Use this image',
      },
      library: {
        type: 'image',
      },
      multiple: multiple,
    });

    // Handle image selection
    frame.on('select', () => {
      const selection = frame.state().get('selection');
      if (selection && selection.length > 0) {
        if (multiple) {
          // Handle multiple images
          const selectedImages = selection.map(attachment => {
            const att = attachment.toJSON();
            return {
              id: att.id,
              url: att.url,
              alt: att.alt || att.title || '',
              title: att.title || '',
              width: att.width,
              height: att.height,
              sizes: att.sizes,
            };
          });
          if (onSelect && typeof onSelect === 'function') {
            onSelect(selectedImages);
          }
        } else {
          // Handle single image
          const attachment = selection.first().toJSON();
          if (onSelect && typeof onSelect === 'function') {
            onSelect({
              id: attachment.id,
              url: attachment.url,
              alt: attachment.alt || attachment.title || '',
              title: attachment.title || '',
              width: attachment.width,
              height: attachment.height,
              sizes: attachment.sizes,
            });
          }
        }
      }
    });

    frame.open();
  };

  return (
    <button
      type="button"
      className="button reactor-media-library-button"
      onClick={handleClick}
    >
      {children || (currentImageId ? 'Change Image' : 'Select Image')}
    </button>
  );
}

export default MediaLibraryButton;
