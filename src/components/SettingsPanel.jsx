import React, { useState } from 'react';
import MediaLibraryButton from './MediaLibrary';
import './SettingsPanel.css';

function SettingsPanel({ selectedBlock, onUpdateBlock, layout }) {
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
        {activeTab === 'content' && <ContentSettings block={selectedBlock} onUpdate={onUpdateBlock} layout={layout} />}
        {activeTab === 'style' && <StyleSettings block={selectedBlock} onUpdate={onUpdateBlock} layout={layout} />}
        {activeTab === 'advanced' && <AdvancedSettings block={selectedBlock} onUpdate={onUpdateBlock} layout={layout} />}
      </div>
    </div>
  );
}

function ContentSettings({ block, onUpdate, layout }) {
  const props = block.props || {};

  const handleChange = (key, value) => {
    onUpdate(block.id, { [key]: value });
  };
  
  // Helper to find block with children in layout
  const findBlockWithChildren = (layout, blockId) => {
    if (!layout || !layout.sections) return null;
    for (const section of layout.sections) {
      if (section.id === blockId) return section;
      if (section.children) {
        for (const child of section.children) {
          if (child.id === blockId) return child;
          if (child.children) {
            for (const grandchild of child.children) {
              if (grandchild.id === blockId) return grandchild;
            }
          }
        }
      }
    }
    return null;
  };
  
  const blockWithChildren = layout ? findBlockWithChildren(layout, block.id) : block;

  const renderFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Content</label>
              <textarea
                value={props.content || props.text || ''}
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
              <label>Image</label>
              {props.src && (
                <div className="reactor-image-preview" style={{ marginBottom: '10px' }}>
                  <img
                    src={props.src}
                    alt={props.alt || 'Preview'}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MediaLibraryButton
                  currentImageId={props.attachmentId}
                  onSelect={(image) => {
                    handleChange('attachmentId', image.id);
                    handleChange('src', image.url);
                    if (image.alt) {
                      handleChange('alt', image.alt);
                    }
                  }}
                />
                {props.src && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      handleChange('attachmentId', null);
                      handleChange('src', '');
                      handleChange('alt', '');
                    }}
                    style={{ marginLeft: 'auto' }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <div className="reactor-setting-field">
              <label>Image URL (or paste URL directly)</label>
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
                placeholder="Image description"
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
                value={props.link || props.url || ''}
                onChange={(e) => handleChange('link', e.target.value)}
              />
            </div>
          </>
        );
      case 'row':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Number of Columns</label>
              <input
                type="number"
                min="1"
                max="12"
                value={props.numColumns || (blockWithChildren?.children?.length || 1)}
                onChange={(e) => {
                  const numCols = parseInt(e.target.value) || 1;
                  handleChange('numColumns', numCols);
                  // Trigger column generation via onUpdate with special flag
                  onUpdate(block.id, { numColumns: numCols }, true);
                }}
              />
              <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Enter number of columns (1-12). Default is 1 column with 100% width.
              </small>
            </div>
            {blockWithChildren && blockWithChildren.children && blockWithChildren.children.length > 0 && (
              <div className="reactor-setting-field">
                <label>Column Widths</label>
                {blockWithChildren.children.map((col, index) => {
                  // Get the actual width from the column props
                  // If no width is set, calculate default based on number of columns
                  let currentWidth = col.props?.width;
                  if (!currentWidth || currentWidth === '') {
                    const numCols = blockWithChildren.children.length;
                    currentWidth = numCols > 0 ? `${(100 / numCols).toFixed(2)}%` : '100%';
                  }
                  
                  return (
                    <div key={col.id || index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#646970', minWidth: '70px', fontWeight: 500 }}>Column {index + 1}:</span>
                      <input
                        type="text"
                        value={currentWidth}
                        onChange={(e) => {
                          // Update column width
                          const newWidth = e.target.value.trim();
                          onUpdate(col.id, { width: newWidth || 'auto' });
                        }}
                        placeholder="auto or 50%"
                        style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  );
                })}
                <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Set width for each column (e.g., 50%, 33.33%, auto, 200px). Leave empty for auto.
                </small>
              </div>
            )}
          </>
        );
      default:
        return <p>No content settings available for this block type.</p>;
    }
  };

  return <div className="reactor-settings-fields">{renderFields()}</div>;
}

function StyleSettings({ block, onUpdate, layout }) {
  const props = block.props || {};

  const handleChange = (key, value) => {
    onUpdate(block.id, { [key]: value });
  };
  
  // Helper to find block with children in layout
  const findBlockWithChildren = (layout, blockId) => {
    if (!layout || !layout.sections) return null;
    for (const section of layout.sections) {
      if (section.id === blockId) return section;
      if (section.children) {
        for (const child of section.children) {
          if (child.id === blockId) return child;
          if (child.children) {
            for (const grandchild of child.children) {
              if (grandchild.id === blockId) return grandchild;
            }
          }
        }
      }
    }
    return null;
  };
  
  const blockWithChildren = layout ? findBlockWithChildren(layout, block.id) : block;

  return (
    <div className="reactor-settings-fields">
      {/* Spacing */}
      <div className="reactor-setting-group">
        <h4>Spacing</h4>
        <div className="reactor-setting-field">
          <label>Padding</label>
          <input
            type="text"
            value={props.padding || ''}
            onChange={(e) => handleChange('padding', e.target.value)}
            placeholder="20px or 10px 20px"
          />
        </div>
        <div className="reactor-setting-field">
          <label>Margin</label>
          <input
            type="text"
            value={props.margin || ''}
            onChange={(e) => handleChange('margin', e.target.value)}
            placeholder="0 or 10px 20px"
          />
        </div>
      </div>

      {/* Border */}
      <div className="reactor-setting-group">
        <h4>Border</h4>
        <div className="reactor-setting-field">
          <label>Border Width</label>
          <input
            type="text"
            value={props.borderWidth || ''}
            onChange={(e) => handleChange('borderWidth', e.target.value)}
            placeholder="1px"
          />
        </div>
        <div className="reactor-setting-field">
          <label>Border Radius</label>
          <input
            type="text"
            value={props.borderRadius || ''}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            placeholder="4px"
          />
        </div>
        <div className="reactor-setting-field">
          <label>Border Color</label>
          <input
            type="color"
            value={props.borderColor || '#cccccc'}
            onChange={(e) => handleChange('borderColor', e.target.value)}
          />
        </div>
      </div>

      {/* Background */}
      <div className="reactor-setting-group">
        <h4>Background</h4>
        <div className="reactor-setting-field">
          <label>Background Color</label>
          <input
            type="color"
            value={props.backgroundColor || (block.type === 'button' ? '#0073aa' : '#ffffff')}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
        </div>
      </div>

      {/* Typography - for text, heading, button */}
      {['text', 'heading', 'button'].includes(block.type) && (
        <div className="reactor-setting-group">
          <h4>Typography</h4>
          <div className="reactor-setting-field">
            <label>Font Size</label>
            <input
              type="text"
              value={props.fontSize || ''}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              placeholder={block.type === 'heading' ? '24px' : '16px'}
            />
          </div>
          <div className="reactor-setting-field">
            <label>Font Weight</label>
            <select
              value={props.fontWeight || 'normal'}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
              <option value="900">900</option>
            </select>
          </div>
          <div className="reactor-setting-field">
            <label>Text Color</label>
            <input
              type="color"
              value={props.color || (block.type === 'button' ? '#ffffff' : '#000000')}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
          <div className="reactor-setting-field">
            <label>Text Align</label>
            <select
              value={props.textAlign || 'left'}
              onChange={(e) => handleChange('textAlign', e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {/* Column Management - for rows */}
      {block.type === 'row' && (
        <div className="reactor-setting-group">
          <h4>Columns</h4>
          <div className="reactor-setting-field">
            <label>Number of Columns</label>
            <input
              type="number"
              min="1"
              max="12"
              value={props.numColumns || (block.children?.length || 1)}
              onChange={(e) => {
                const numCols = parseInt(e.target.value) || 1;
                handleChange('numColumns', numCols);
                // Trigger column generation via onUpdate with special flag
                onUpdate(block.id, { numColumns: numCols }, true);
              }}
            />
            <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Enter number of columns (1-12)
            </small>
          </div>
          {blockWithChildren && blockWithChildren.children && blockWithChildren.children.length > 0 && (
            <div className="reactor-setting-field">
              <label>Column Widths</label>
              {blockWithChildren.children.map((col, index) => (
                <div key={col.id || index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#646970', minWidth: '60px' }}>Column {index + 1}:</span>
                  <input
                    type="text"
                    value={col.props?.width || ''}
                    onChange={(e) => {
                      // Update column width
                      onUpdate(col.id, { width: e.target.value });
                    }}
                    placeholder="auto or 50%"
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
              <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Set width for each column (e.g., 50%, 33.33%, auto)
              </small>
            </div>
          )}
        </div>
      )}

      {/* Flex Properties - for rows */}
      {block.type === 'row' && (
        <div className="reactor-setting-group">
          <h4>Flex Layout</h4>
          <div className="reactor-setting-field">
            <label>Justify Content</label>
            <select
              value={props.justifyContent || 'flex-start'}
              onChange={(e) => handleChange('justifyContent', e.target.value)}
            >
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>
          <div className="reactor-setting-field">
            <label>Align Items</label>
            <select
              value={props.alignItems || 'stretch'}
              onChange={(e) => handleChange('alignItems', e.target.value)}
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>
          <div className="reactor-setting-field">
            <label>Gap</label>
            <input
              type="text"
              value={props.gap || '20px'}
              onChange={(e) => handleChange('gap', e.target.value)}
              placeholder="20px"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedSettings({ block, onUpdate, layout }) {
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

