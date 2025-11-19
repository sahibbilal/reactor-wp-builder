import React from 'react';
import './Toolbar.css';

function Toolbar({
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  previewMode,
  deviceMode,
  onDeviceModeChange,
  saving,
}) {
  return (
    <div className="reactor-toolbar">
      <div className="reactor-toolbar-left">
        <h2 className="reactor-toolbar-title">Reactor Builder</h2>
      </div>
      
      <div className="reactor-toolbar-center">
        <div className="reactor-device-mode">
          <button
            className={`reactor-device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
            onClick={() => onDeviceModeChange('desktop')}
            title="Desktop"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </button>
          <button
            className={`reactor-device-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
            onClick={() => onDeviceModeChange('tablet')}
            title="Tablet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </button>
          <button
            className={`reactor-device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
            onClick={() => onDeviceModeChange('mobile')}
            title="Mobile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="reactor-toolbar-right">
        <button
          className="reactor-toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"></path>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
          </svg>
          Undo
        </button>
        <button
          className="reactor-toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"></path>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
          </svg>
          Redo
        </button>
        <button
          className="reactor-toolbar-btn"
          onClick={onPreview}
          title="Preview in New Tab"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Preview
        </button>
        <button
          className="reactor-toolbar-btn reactor-toolbar-btn-primary"
          onClick={onSave}
          disabled={saving}
          title="Save Layout"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default Toolbar;

