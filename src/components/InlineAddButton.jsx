import React, { useState, useRef, useEffect } from 'react';
import './InlineAddButton.css';

const BLOCK_OPTIONS = {
  section: [
    { type: 'row', label: 'Row', icon: '↔️' },
  ],
  row: [
    { type: 'column', label: 'Column', icon: '↕️' },
  ],
  column: [
    { type: 'container', label: 'Container', icon: '📦' },
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️🖼️' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ],
  container: [
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️🖼️' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ],
};

function InlineAddButton({ parentType, onAddBlock, isEmpty = false, compact = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const options = BLOCK_OPTIONS[parentType] || [];

  useEffect(() => {
    if (showMenu && menuRef.current && wrapperRef.current) {
      // Position menu relative to button
      const buttonRect = wrapperRef.current.getBoundingClientRect();
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      
      // Check if menu would overflow viewport
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // If not enough space below, show above
      if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = 'calc(100% + 8px)';
      } else {
        menu.style.top = 'calc(100% + 8px)';
        menu.style.bottom = 'auto';
      }
    }
  }, [showMenu]);

  if (options.length === 0) {
    return null;
  }

  const handleAdd = (blockType) => {
    onAddBlock(blockType);
    setShowMenu(false);
  };

  return (
    <div className="reactor-inline-add-wrapper" ref={wrapperRef}>
      <button
        className={`reactor-inline-add-btn ${isEmpty ? 'empty' : ''} ${compact ? 'compact' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        title="Add Block"
        style={compact ? { 
          width: '20px', 
          height: '20px', 
          padding: '2px',
          opacity: 0.5,
          transition: 'opacity 0.2s'
        } : {}}
        onMouseEnter={(e) => {
          if (compact) e.target.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          if (compact) e.target.style.opacity = '0.5';
        }}
      >
        <svg width={compact ? "12" : "16"} height={compact ? "12" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      {showMenu && (
        <>
          <div
            className="reactor-inline-add-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="reactor-inline-add-menu" ref={menuRef}>
            {options.map((option) => (
              <button
                key={option.type}
                className="reactor-inline-add-option"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(option.type);
                }}
              >
                <span className="reactor-inline-add-icon">{option.icon}</span>
                <span className="reactor-inline-add-label">{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default InlineAddButton;

