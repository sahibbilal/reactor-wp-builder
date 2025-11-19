import React, { useState } from 'react';
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
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ],
  container: [
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ],
};

function InlineAddButton({ parentType, onAddBlock, isEmpty = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const options = BLOCK_OPTIONS[parentType] || [];

  if (options.length === 0) {
    return null;
  }

  const handleAdd = (blockType) => {
    onAddBlock(blockType);
    setShowMenu(false);
  };

  return (
    <div className="reactor-inline-add-wrapper">
      <button
        className={`reactor-inline-add-btn ${isEmpty ? 'empty' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        title="Add Block"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <div className="reactor-inline-add-menu">
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

