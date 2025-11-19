import React, { useState } from 'react';
import './SettingsPanel.css';

function SettingsPanel({ selectedBlock, onUpdateBlock }) {
  const [activeTab, setActiveTab] = useState('content');

  if (!selectedBlock) {
    return (
      <div className="reactor-settings-panel">
        <div className="reactor-settings-empty">
          <p>Select a block to edit its settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reactor-settings-panel">
      <div className="reactor-settings-tabs">
        <button
          className={`reactor-settings-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`reactor-settings-tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`reactor-settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>
      
      <div className="reactor-settings-content">
        {activeTab === 'content' && <ContentSettings block={selectedBlock} onUpdate={onUpdateBlock} />}
        {activeTab === 'style' && <StyleSettings block={selectedBlock} onUpdate={onUpdateBlock} />}
        {activeTab === 'advanced' && <AdvancedSettings block={selectedBlock} onUpdate={onUpdateBlock} />}
      </div>
    </div>
  );
}

function ContentSettings({ block, onUpdate }) {
  const props = block.props || {};

  const handleChange = (key, value) => {
    onUpdate(block.id, { [key]: value });
  };

  const renderFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Content</label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={4}
              />
            </div>
          </>
        );
      case 'heading':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Content</label>
              <input
                type="text"
                value={props.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
              />
            </div>
            <div className="reactor-setting-field">
              <label>Level</label>
              <select
                value={props.level || 2}
                onChange={(e) => handleChange('level', parseInt(e.target.value))}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </>
        );
      case 'image':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Image URL</label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => handleChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="reactor-setting-field">
              <label>Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
              />
            </div>
          </>
        );
      case 'button':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Button Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
              />
            </div>
            <div className="reactor-setting-field">
              <label>Link</label>
              <input
                type="url"
                value={props.link || ''}
                onChange={(e) => handleChange('link', e.target.value)}
              />
            </div>
          </>
        );
      default:
        return <p>No content settings available for this block type.</p>;
    }
  };

  return <div className="reactor-settings-fields">{renderFields()}</div>;
}

function StyleSettings({ block, onUpdate }) {
  const props = block.props || {};

  const handleChange = (key, value) => {
    onUpdate(block.id, { [key]: value });
  };

  return (
    <div className="reactor-settings-fields">
      <div className="reactor-setting-field">
        <label>Background Color</label>
        <input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => handleChange('backgroundColor', e.target.value)}
        />
      </div>
      <div className="reactor-setting-field">
        <label>Padding</label>
        <input
          type="text"
          value={props.padding || ''}
          onChange={(e) => handleChange('padding', e.target.value)}
          placeholder="20px"
        />
      </div>
      <div className="reactor-setting-field">
        <label>Margin</label>
        <input
          type="text"
          value={props.margin || ''}
          onChange={(e) => handleChange('margin', e.target.value)}
          placeholder="0"
        />
      </div>
      {['text', 'heading'].includes(block.type) && (
        <>
          <div className="reactor-setting-field">
            <label>Font Size</label>
            <input
              type="text"
              value={props.fontSize || ''}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              placeholder="16px"
            />
          </div>
          <div className="reactor-setting-field">
            <label>Text Color</label>
            <input
              type="color"
              value={props.color || '#000000'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
        </>
      )}
      {block.type === 'button' && (
        <>
          <div className="reactor-setting-field">
            <label>Button Background</label>
            <input
              type="color"
              value={props.backgroundColor || '#0073aa'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
            />
          </div>
          <div className="reactor-setting-field">
            <label>Button Text Color</label>
            <input
              type="color"
              value={props.color || '#ffffff'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AdvancedSettings({ block, onUpdate }) {
  const props = block.props || {};

  const handleChange = (key, value) => {
    onUpdate(block.id, { [key]: value });
  };

  return (
    <div className="reactor-settings-fields">
      <div className="reactor-setting-field">
        <label>CSS Class</label>
        <input
          type="text"
          value={props.className || ''}
          onChange={(e) => handleChange('className', e.target.value)}
          placeholder="custom-class"
        />
      </div>
      <div className="reactor-setting-field">
        <label>Custom CSS</label>
        <textarea
          value={props.customCSS || ''}
          onChange={(e) => handleChange('customCSS', e.target.value)}
          rows={6}
          placeholder=".custom-class { }"
        />
      </div>
    </div>
  );
}

export default SettingsPanel;

