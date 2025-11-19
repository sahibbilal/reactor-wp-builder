import { useEffect, useRef } from 'react';

/**
 * Hook to open WordPress Media Library
 */
export function useMediaLibrary({ onSelect }) {
  const mediaFrameRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaFrameRef.current) {
        mediaFrameRef.current.detach();
      }
    };
  }, []);

  const openMediaLibrary = () => {
    // Check if wp.media is available - wait for it to load
    const checkMediaLibrary = () => {
      // Check if wp object exists
      if (typeof window.wp === 'undefined') {
        return false;
      }
      
      // Check if wp.media exists and is a function
      if (typeof window.wp.media !== 'function') {
        return false;
      }
      
      // Check if media views are loaded
      if (typeof window.wp.media.view === 'undefined' || typeof window.wp.media.view.MediaFrame === 'undefined') {
        return false;
      }
      
      return true;
    };
    
    if (!checkMediaLibrary()) {
      // Try to wait for scripts to load
      let retries = 0;
      const maxRetries = 10; // Increased retries
      
      const checkAndOpen = () => {
        if (checkMediaLibrary()) {
          // Media library is now available, proceed
          createAndOpenMediaFrame();
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(checkAndOpen, 300); // Reduced delay for faster response
        } else {
          console.error('Media Library not available. wp object:', typeof window.wp, 'wp.media:', typeof window.wp?.media);
          alert('WordPress Media Library is not available. Please refresh the page and try again.\n\nIf the problem persists, check the browser console for errors.');
        }
      };
      
      checkAndOpen();
      return;
    }

    createAndOpenMediaFrame();
  };

  const createAndOpenMediaFrame = () => {
    // Create or reuse media frame
    if (!mediaFrameRef.current) {
      try {
        mediaFrameRef.current = window.wp.media({
          title: 'Select or Upload Image',
          button: {
            text: 'Use this image',
          },
          multiple: false,
          library: {
            type: 'image',
          },
        });

        // Handle image selection
        mediaFrameRef.current.on('select', () => {
          const attachment = mediaFrameRef.current.state().get('selection').first().toJSON();
          
          if (onSelect) {
            onSelect({
              id: attachment.id,
              url: attachment.url,
              alt: attachment.alt || attachment.title || '',
              width: attachment.width,
              height: attachment.height,
              sizes: attachment.sizes,
            });
          }
        });
      } catch (error) {
        console.error('Error creating media frame:', error);
        alert('Error opening Media Library. Please refresh the page and try again.');
        return;
      }
    }

    // Open the media library
    try {
      mediaFrameRef.current.open();
    } catch (error) {
      console.error('Error opening media frame:', error);
      alert('Error opening Media Library. Please refresh the page and try again.');
    }
  };

  return { openMediaLibrary };
}

/**
 * Component for Media Library button
 */
export function MediaLibraryButton({ onSelect, currentImageId, children }) {
  const { openMediaLibrary } = useMediaLibrary({ onSelect });

  const handleClick = (e) => {
    e.preventDefault();
    openMediaLibrary();
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

