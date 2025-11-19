import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import { MediaLibraryButton } from './MediaLibrary';

// Reusable Number Input with Unit Selector
function NumberInputWithUnit({ label, value, onChange, placeholder = '0', min = 0, units = ['px', 'rem', 'cm'] }) {
  const parseValue = (val) => {
    if (!val || val === '') return { number: '', unit: units[0] || 'px' };
    const valStr = val.toString().trim();
    
    // Check if it's a unitless number
    if (/^[\d.]+$/.test(valStr)) {
      return { number: valStr, unit: units[0] || 'px' };
    }
    
    // Try to match number + unit
    const match = valStr.match(/^([\d.]+)(px|rem|cm|em|%|auto|none)?$/);
    if (match) {
      const matchedUnit = match[2] || units[0] || 'px';
      // If unit is not in available units, use first available
      const unit = units.includes(matchedUnit) ? matchedUnit : (units[0] || 'px');
      return { number: match[1], unit };
    }
    
    // If it's a special value like 'auto', 'none', etc.
    if (units.includes(valStr)) {
      return { number: '', unit: valStr };
    }
    
    return { number: valStr, unit: units[0] || 'px' };
  };

  const { number, unit } = parseValue(value || '');

  const handleNumberChange = (e) => {
    const num = e.target.value;
    if (num === '' || (!isNaN(num) && parseFloat(num) >= min)) {
      if (num === '') {
        onChange('');
      } else if (unit === '' || units.includes('')) {
        onChange(num);
      } else {
        onChange(`${num}${unit}`);
      }
    }
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    if (number !== '') {
      if (newUnit === '' || newUnit === 'auto' || newUnit === 'none') {
        onChange(newUnit);
      } else {
        onChange(`${number}${newUnit}`);
      }
    } else {
      onChange(newUnit === '' ? '' : newUnit);
    }
  };

  return (
    <div className="reactor-number-input-group">
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          type="number"
          value={number}
          onChange={handleNumberChange}
          onBlur={(e) => {
            if (e.target.value === '') {
              onChange('');
            }
          }}
          placeholder={placeholder}
          min={min}
          step="0.1"
          style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <select
          value={unit}
          onChange={handleUnitChange}
          style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '60px' }}
        >
          {units.map(u => (
            <option key={u} value={u}>{u || '(unitless)'}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Four-direction input component (top, right, bottom, left)
function FourDirectionInput({ label, values, onChange, placeholder = '0', min = 0, units = ['px', 'rem', 'cm'] }) {
  const directions = [
    { key: 'top', title: 'Top' },
    { key: 'right', title: 'Right' },
    { key: 'bottom', title: 'Bottom' },
    { key: 'left', title: 'Left' },
  ];

  const parseValue = (val) => {
    if (!val || val === '') return { number: '', unit: units[0] || 'px' };
    const valStr = val.toString().trim();
    const match = valStr.match(/^([\d.]+)(px|rem|cm|em|%)?$/);
    if (match) {
      const matchedUnit = match[2] || units[0] || 'px';
      const unit = units.includes(matchedUnit) ? matchedUnit : (units[0] || 'px');
      return { number: match[1], unit };
    }
    return { number: valStr, unit: units[0] || 'px' };
  };

  const handleChange = (direction, value) => {
    const newValues = { ...values, [direction]: value };
    onChange(newValues);
  };

  // Get the common unit from all values, or default to first unit
  const getCommonUnit = () => {
    const allUnits = directions.map(dir => parseValue(values?.[dir.key] || '').unit);
    const uniqueUnits = [...new Set(allUnits.filter(u => u))];
    if (uniqueUnits.length === 1) return uniqueUnits[0];
    if (uniqueUnits.length === 0) return units[0] || 'px';
    // If mixed units, return the most common or first
    return uniqueUnits[0];
  };

  const [commonUnit, setCommonUnit] = useState(getCommonUnit());

  useEffect(() => {
    setCommonUnit(getCommonUnit());
  }, [values]);

  const handleNumberChange = (direction, num) => {
    if (num === '' || (!isNaN(num) && parseFloat(num) >= min)) {
      const value = num === '' ? '' : `${num}${commonUnit}`;
      handleChange(direction, value);
    }
  };

  const handleUnitChange = (newUnit) => {
    setCommonUnit(newUnit);
    // Update all non-empty values to use the new unit in a single batch
    const updatedValues = { ...values };
    let hasChanges = false;
    
    directions.forEach(dir => {
      const { number } = parseValue(values?.[dir.key] || '');
      if (number !== '') {
        updatedValues[dir.key] = `${number}${newUnit}`;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      onChange(updatedValues);
    }
  };

  return (
    <div className="reactor-four-direction-input">
      <label style={{ marginBottom: '8px', display: 'block', fontWeight: 500 }}>{label}</label>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
        {directions.map(dir => {
          const { number } = parseValue(values?.[dir.key] || '');
          return (
            <div key={dir.key} style={{ width: '50px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="number"
                value={number}
                onChange={(e) => handleNumberChange(dir.key, e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange(dir.key, '');
                  }
                }}
                placeholder={placeholder}
                min={min}
                step="1"
                title={dir.title}
                style={{ padding: '6px 4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', textAlign: 'center', width: '100%' }}
              />
            </div>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '60px' }}>
          <select
            value={commonUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
            style={{ padding: '6px 4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', marginTop: '0' }}
          >
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

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
            <div className="reactor-setting-field reactor-textarea-field">
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
                  {(() => {
                    // Get the correct image source based on selected size
                    let previewSrc = props.src;
                    const currentImageSize = props.imageSize || 'medium';
                    
                    if (props.sizes && typeof props.sizes === 'object') {
                      if (currentImageSize === 'full') {
                        previewSrc = props.src; // Use original full size
                      } else if (props.sizes[currentImageSize] && props.sizes[currentImageSize].url) {
                        previewSrc = props.sizes[currentImageSize].url;
                      } else if (props.sizes.medium && props.sizes.medium.url) {
                        previewSrc = props.sizes.medium.url; // Fallback to medium
                      } else if (props.sizes.thumbnail && props.sizes.thumbnail.url) {
                        previewSrc = props.sizes.thumbnail.url; // Fallback to thumbnail
                      }
                    }
                    
                    return (
                      <img
                        key={`preview-${currentImageSize}-${previewSrc}`}
                        src={previewSrc}
                        alt={props.alt || 'Preview'}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: 'block',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                        }}
                      />
                    );
                  })()}
                </div>
              )}
              <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MediaLibraryButton
                  onSelect={(image) => {
                    handleChange('src', image.url);
                    handleChange('attachmentId', image.id);
                    handleChange('sizes', image.sizes);
                    if (image.alt) {
                      handleChange('alt', image.alt);
                    }
                  }}
                  currentImageId={props.attachmentId}
                >
                  {props.src ? 'Change Image' : 'Select Image'}
                </MediaLibraryButton>
                {props.src && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      handleChange('attachmentId', null);
                      handleChange('src', '');
                      handleChange('alt', '');
                    }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px', color: '#646970', marginBottom: '4px', display: 'block' }}>Or enter URL manually:</label>
                <input
                  type="url"
                  value={props.src || ''}
                  onChange={(e) => handleChange('src', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
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
            <div className="reactor-setting-field">
              <label>Image Size</label>
              <select
                value={props.imageSize || 'medium'}
                onChange={(e) => handleChange('imageSize', e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="thumbnail">Thumbnail</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full</option>
              </select>
            </div>
          </>
        );
      case 'gallery':
        return (
          <>
            <div className="reactor-setting-field">
              <label>Images</label>
              {props.images && props.images.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  {props.images.map((image, index) => {
                    // Create a stable unique key for each image
                    const imageKey = image.id ? `settings-image-${image.id}-${index}` : `settings-image-${index}-${image.url || image.src || ''}`;
                    
                    return (
                      <div key={imageKey} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '8px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}>
                        <img 
                          src={image.url || image.src} 
                          alt={image.alt || `Image ${index + 1}`}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <span style={{ flex: 1, fontSize: '12px' }}>
                          {image.alt || image.title || `Image ${index + 1}`}
                        </span>
                        <button
                          type="button"
                          className="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newImages = props.images.filter((_, i) => i !== index);
                            handleChange('images', newImages);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <MediaLibraryButton
                onSelect={(images) => {
                  // Handle both single image and array of images
                  const imagesToAdd = Array.isArray(images) ? images : [images];
                  const newImages = [...(props.images || []), ...imagesToAdd];
                  handleChange('images', newImages);
                }}
                multiple={true}
              >
                Add Images
              </MediaLibraryButton>
            </div>
            <div className="reactor-setting-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ margin: 0, minWidth: '100px', fontSize: '13px', fontWeight: 600 }}>Columns</label>
              <input
                type="number"
                min="1"
                max="12"
                value={props.columns || 3}
                onChange={(e) => handleChange('columns', parseInt(e.target.value) || 3)}
                style={{ flex: 1, minWidth: '100px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <label style={{ margin: 0, minWidth: '100px', fontSize: '13px', fontWeight: 600 }}>Gap</label>
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={parseFloat(props.gap) || ''}
                  onChange={(e) => {
                    const num = e.target.value;
                    const unit = (props.gap || '10px').toString().replace(/[\d.]/g, '') || 'px';
                    handleChange('gap', num ? `${num}${unit}` : '');
                  }}
                  placeholder="10"
                  style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <select
                  value={(props.gap || '10px').toString().replace(/[\d.]/g, '') || 'px'}
                  onChange={(e) => {
                    const num = parseFloat(props.gap) || 10;
                    handleChange('gap', `${num}${e.target.value}`);
                  }}
                  style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '60px' }}
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="em">em</option>
                  <option value="%">%</option>
                </select>
              </div>
              <label style={{ margin: 0, minWidth: '100px', fontSize: '13px', fontWeight: 600 }}>Image Size</label>
              <select
                value={props.imageSize || 'medium'}
                onChange={(e) => handleChange('imageSize', e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="thumbnail">Thumbnail</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full</option>
              </select>
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

  // Parse padding/margin values
  const parseFourDirection = (value) => {
    if (!value) return { top: '', right: '', bottom: '', left: '' };
    const parts = value.toString().split(/\s+/);
    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    } else if (parts.length === 2) {
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    } else if (parts.length === 4) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    return { top: '', right: '', bottom: '', left: '' };
  };

  const formatFourDirection = (values) => {
    if (!values || Object.values(values).every(v => !v || v === '')) return '';
    const { top, right, bottom, left } = values;
    if (top === right && right === bottom && bottom === left) return top || '';
    if (top === bottom && right === left) return `${top} ${right}`;
    return `${top} ${right} ${bottom} ${left}`;
  };

  return (
    <div className="reactor-settings-fields">
      {/* Spacing */}
      <div className="reactor-setting-group">
        <h4>Spacing</h4>
        <FourDirectionInput
          label="Padding"
          values={parseFourDirection(props.padding)}
          onChange={(values) => handleChange('padding', formatFourDirection(values))}
          placeholder="0"
          min={0}
        />
        <FourDirectionInput
          label="Margin"
          values={parseFourDirection(props.margin)}
          onChange={(values) => handleChange('margin', formatFourDirection(values))}
          placeholder="0"
          min={0}
        />
      </div>

      {/* Border */}
      <div className="reactor-setting-group">
        <h4>Border</h4>
        <FourDirectionInput
          label="Border Width"
          values={parseFourDirection(props.borderWidth)}
          onChange={(values) => handleChange('borderWidth', formatFourDirection(values))}
          placeholder="0"
          min={0}
        />
        <FourDirectionInput
          label="Border Radius"
          values={parseFourDirection(props.borderRadius)}
          onChange={(values) => handleChange('borderRadius', formatFourDirection(values))}
          placeholder="0"
          min={0}
        />
        <div className="reactor-setting-field">
          <label>Border Color</label>
          <input
            type="color"
            value={props.borderColor || '#cccccc'}
            onChange={(e) => handleChange('borderColor', e.target.value)}
            style={{ flex: '1 1 0%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          />
          <label>Border Style</label>
          <select
            value={props.borderStyle || 'solid'}
            onChange={(e) => handleChange('borderStyle', e.target.value)}
            style={{ flex: '1 1 0%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="groove">Groove</option>
            <option value="ridge">Ridge</option>
            <option value="inset">Inset</option>
            <option value="outset">Outset</option>
          </select>
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
            style={{ height: '36px', width: '80px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          />
          <label>Image URL</label>
          <input
            type="url"
            value={props.backgroundImage || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ flex: '1 1 0%', minWidth: '150px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <MediaLibraryButton
            onSelect={(image) => {
              if (image && image.url) {
                handleChange('backgroundImage', image.url);
              }
            }}
            multiple={false}
          >
            Select Image
          </MediaLibraryButton>
        </div>
        <div className="reactor-setting-field">
          <label>Size</label>
          <select
            value={props.backgroundSize || 'cover'}
            onChange={(e) => handleChange('backgroundSize', e.target.value)}
            style={{ flex: '1 1 0%', minWidth: '120px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
            <option value="100% 100%">100% 100%</option>
          </select>
          <label>Position</label>
          <select
            value={props.backgroundPosition || 'center'}
            onChange={(e) => handleChange('backgroundPosition', e.target.value)}
            style={{ flex: '1 1 0%', minWidth: '120px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top left">Top Left</option>
            <option value="top right">Top Right</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom right">Bottom Right</option>
          </select>
          <label>Repeat</label>
          <select
            value={props.backgroundRepeat || 'no-repeat'}
            onChange={(e) => handleChange('backgroundRepeat', e.target.value)}
            style={{ flex: '1 1 0%', minWidth: '120px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>
      </div>

      {/* Size & Position */}
      <div className="reactor-setting-group">
        <h4>Size & Position</h4>
        <div className="reactor-setting-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, minWidth: '100px', fontSize: '13px', fontWeight: 600 }}>Width</label>
          <div style={{ flex: 1, minWidth: '150px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="number"
              value={parseFloat(props.width) || ''}
              onChange={(e) => {
                const num = e.target.value;
                const unit = (props.width || '').toString().replace(/[\d.]/g, '') || 'px';
                handleChange('width', num ? `${num}${unit}` : '');
              }}
              placeholder="auto"
              style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <select
              value={(props.width || '').toString().replace(/[\d.]/g, '') || 'px'}
              onChange={(e) => {
                const num = parseFloat(props.width) || '';
                handleChange('width', num ? `${num}${e.target.value}` : e.target.value);
              }}
              style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '60px' }}
            >
              <option value="px">px</option>
              <option value="%">%</option>
              <option value="rem">rem</option>
              <option value="em">em</option>
              <option value="auto">auto</option>
            </select>
          </div>
          <label style={{ margin: 0, minWidth: '100px', fontSize: '13px', fontWeight: 600 }}>Position</label>
          <select
            value={props.position || 'static'}
            onChange={(e) => handleChange('position', e.target.value)}
            style={{ flex: 1, minWidth: '120px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>
        <NumberInputWithUnit
          label="Height"
          value={props.height || ''}
          onChange={(val) => handleChange('height', val)}
          placeholder="auto"
          units={['px', '%', 'rem', 'em', 'auto']}
        />
        <NumberInputWithUnit
          label="Min Width"
          value={props.minWidth || ''}
          onChange={(val) => handleChange('minWidth', val)}
          placeholder="0"
          units={['px', '%', 'rem', 'em']}
        />
        <NumberInputWithUnit
          label="Max Width"
          value={props.maxWidth || ''}
          onChange={(val) => handleChange('maxWidth', val)}
          placeholder="none"
          units={['px', '%', 'rem', 'em', 'none']}
        />
      </div>

      {/* Effects */}
      <div className="reactor-setting-group">
        <h4>Effects</h4>
        <div className="reactor-setting-field">
          <label>Shadow</label>
          <input
            type="text"
            value={props.boxShadow || ''}
            onChange={(e) => handleChange('boxShadow', e.target.value)}
            placeholder="0px 2px 4px rgba(0,0,0,0.1)"
            style={{ flex: '1 1 0%', minWidth: '200px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <label>Opacity</label>
          <div style={{ flex: '1 1 0%', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={props.opacity !== undefined ? props.opacity : 1}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '12px', color: '#646970', minWidth: '40px' }}>
              {props.opacity !== undefined ? props.opacity : 1}
            </span>
          </div>
        </div>
        <div className="reactor-setting-field">
          <label>Transform</label>
          <input
            type="text"
            value={props.transform || ''}
            onChange={(e) => handleChange('transform', e.target.value)}
            placeholder="rotate(0deg) scale(1)"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div className="reactor-setting-field">
          <label>Transition</label>
          <input
            type="text"
            value={props.transition || ''}
            onChange={(e) => handleChange('transition', e.target.value)}
            placeholder="all 0.3s ease"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Typography - for text, heading, button */}
      {['text', 'heading', 'button'].includes(block.type) && (
        <div className="reactor-setting-group">
          <h4>Typography</h4>
          <NumberInputWithUnit
            label="Font Size"
            value={props.fontSize || ''}
            onChange={(val) => handleChange('fontSize', val)}
            placeholder={block.type === 'heading' ? '24' : '16'}
            units={['px', 'rem', 'em']}
          />
          <div className="reactor-setting-field">
            <label>Font Weight</label>
            <select
              value={props.fontWeight || 'normal'}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="100">100 - Thin</option>
              <option value="200">200 - Extra Light</option>
              <option value="300">300 - Light</option>
              <option value="400">400 - Regular</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - Semi Bold</option>
              <option value="700">700 - Bold</option>
              <option value="800">800 - Extra Bold</option>
              <option value="900">900 - Black</option>
            </select>
          </div>
          <div className="reactor-setting-field">
            <label>Text Color</label>
            <input
              type="color"
              value={props.color || (block.type === 'button' ? '#ffffff' : '#000000')}
              onChange={(e) => handleChange('color', e.target.value)}
              style={{ flex: '1 1 0%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>
          <div className="reactor-setting-field">
            <label style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 600 }}>Text Align</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => handleChange('textAlign', 'left')}
                className={`reactor-icon-button ${props.textAlign === 'left' || !props.textAlign ? 'active' : ''}`}
                title="Align Left"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: (props.textAlign === 'left' || !props.textAlign) ? '#2271b1' : '#fff',
                  color: (props.textAlign === 'left' || !props.textAlign) ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⬅
              </button>
              <button
                type="button"
                onClick={() => handleChange('textAlign', 'center')}
                className={`reactor-icon-button ${props.textAlign === 'center' ? 'active' : ''}`}
                title="Align Center"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.textAlign === 'center' ? '#2271b1' : '#fff',
                  color: props.textAlign === 'center' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⬌
              </button>
              <button
                type="button"
                onClick={() => handleChange('textAlign', 'right')}
                className={`reactor-icon-button ${props.textAlign === 'right' ? 'active' : ''}`}
                title="Align Right"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.textAlign === 'right' ? '#2271b1' : '#fff',
                  color: props.textAlign === 'right' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ➡
              </button>
              <button
                type="button"
                onClick={() => handleChange('textAlign', 'justify')}
                className={`reactor-icon-button ${props.textAlign === 'justify' ? 'active' : ''}`}
                title="Justify"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.textAlign === 'justify' ? '#2271b1' : '#fff',
                  color: props.textAlign === 'justify' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⬌⬌
              </button>
            </div>
          </div>
          <NumberInputWithUnit
            label="Line Height"
            value={props.lineHeight || ''}
            onChange={(val) => handleChange('lineHeight', val)}
            placeholder="1.5"
            units={['', 'px', 'rem', 'em']}
          />
          <NumberInputWithUnit
            label="Letter Spacing"
            value={props.letterSpacing || ''}
            onChange={(val) => handleChange('letterSpacing', val)}
            placeholder="0"
            units={['px', 'rem', 'em']}
          />
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
            <label style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 600 }}>Justify Content</label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'flex-start')}
                className={`reactor-icon-button ${props.justifyContent === 'flex-start' || !props.justifyContent ? 'active' : ''}`}
                title="Flex Start"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: (props.justifyContent === 'flex-start' || !props.justifyContent) ? '#2271b1' : '#fff',
                  color: (props.justifyContent === 'flex-start' || !props.justifyContent) ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬅ Start
              </button>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'center')}
                className={`reactor-icon-button ${props.justifyContent === 'center' ? 'active' : ''}`}
                title="Center"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.justifyContent === 'center' ? '#2271b1' : '#fff',
                  color: props.justifyContent === 'center' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬌ Center
              </button>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'flex-end')}
                className={`reactor-icon-button ${props.justifyContent === 'flex-end' ? 'active' : ''}`}
                title="Flex End"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.justifyContent === 'flex-end' ? '#2271b1' : '#fff',
                  color: props.justifyContent === 'flex-end' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ➡ End
              </button>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'space-between')}
                className={`reactor-icon-button ${props.justifyContent === 'space-between' ? 'active' : ''}`}
                title="Space Between"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.justifyContent === 'space-between' ? '#2271b1' : '#fff',
                  color: props.justifyContent === 'space-between' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬌⬌ Between
              </button>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'space-around')}
                className={`reactor-icon-button ${props.justifyContent === 'space-around' ? 'active' : ''}`}
                title="Space Around"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.justifyContent === 'space-around' ? '#2271b1' : '#fff',
                  color: props.justifyContent === 'space-around' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬌⬌ Around
              </button>
              <button
                type="button"
                onClick={() => handleChange('justifyContent', 'space-evenly')}
                className={`reactor-icon-button ${props.justifyContent === 'space-evenly' ? 'active' : ''}`}
                title="Space Evenly"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.justifyContent === 'space-evenly' ? '#2271b1' : '#fff',
                  color: props.justifyContent === 'space-evenly' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬌⬌ Evenly
              </button>
            </div>
          </div>
          <div className="reactor-setting-field">
            <label style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 600 }}>Align Items</label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleChange('alignItems', 'stretch')}
                className={`reactor-icon-button ${props.alignItems === 'stretch' || !props.alignItems ? 'active' : ''}`}
                title="Stretch"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: (props.alignItems === 'stretch' || !props.alignItems) ? '#2271b1' : '#fff',
                  color: (props.alignItems === 'stretch' || !props.alignItems) ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ↕ Stretch
              </button>
              <button
                type="button"
                onClick={() => handleChange('alignItems', 'flex-start')}
                className={`reactor-icon-button ${props.alignItems === 'flex-start' ? 'active' : ''}`}
                title="Flex Start"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.alignItems === 'flex-start' ? '#2271b1' : '#fff',
                  color: props.alignItems === 'flex-start' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬆ Start
              </button>
              <button
                type="button"
                onClick={() => handleChange('alignItems', 'center')}
                className={`reactor-icon-button ${props.alignItems === 'center' ? 'active' : ''}`}
                title="Center"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.alignItems === 'center' ? '#2271b1' : '#fff',
                  color: props.alignItems === 'center' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬌ Center
              </button>
              <button
                type="button"
                onClick={() => handleChange('alignItems', 'flex-end')}
                className={`reactor-icon-button ${props.alignItems === 'flex-end' ? 'active' : ''}`}
                title="Flex End"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.alignItems === 'flex-end' ? '#2271b1' : '#fff',
                  color: props.alignItems === 'flex-end' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ⬇ End
              </button>
              <button
                type="button"
                onClick={() => handleChange('alignItems', 'baseline')}
                className={`reactor-icon-button ${props.alignItems === 'baseline' ? 'active' : ''}`}
                title="Baseline"
                style={{
                  flex: '1 1 calc(33.333% - 4px)',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: props.alignItems === 'baseline' ? '#2271b1' : '#fff',
                  color: props.alignItems === 'baseline' ? '#fff' : '#1d2327',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                ─ Baseline
              </button>
            </div>
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
      <div className="reactor-setting-group">
        <h4>Element Identification</h4>
        <div className="reactor-setting-field">
          <label>ID</label>
          <input
            type="text"
            value={props.id || ''}
            onChange={(e) => handleChange('id', e.target.value)}
            placeholder="my-block-id"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Unique identifier for this block (no spaces, use hyphens)
          </small>
        </div>
        <div className="reactor-setting-field">
          <label>CSS Class</label>
          <input
            type="text"
            value={props.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
            placeholder="custom-class"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div className="reactor-setting-group">
        <h4>Responsive Styles</h4>
        <div className="reactor-setting-field reactor-textarea-field">
          <label>Mobile Styles (max-width: 768px)</label>
          <textarea
            value={props.mobileCSS || ''}
            onChange={(e) => handleChange('mobileCSS', e.target.value)}
            rows={4}
            placeholder="@media (max-width: 768px) { }"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            CSS for mobile devices (max-width: 768px)
          </small>
        </div>
        <div className="reactor-setting-field reactor-textarea-field">
          <label>Tablet Styles (max-width: 1024px)</label>
          <textarea
            value={props.tabletCSS || ''}
            onChange={(e) => handleChange('tabletCSS', e.target.value)}
            rows={4}
            placeholder="@media (max-width: 1024px) { }"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            CSS for tablet devices (max-width: 1024px)
          </small>
        </div>
        <div className="reactor-setting-field reactor-textarea-field">
          <label>Desktop Styles (min-width: 1025px)</label>
          <textarea
            value={props.desktopCSS || ''}
            onChange={(e) => handleChange('desktopCSS', e.target.value)}
            rows={4}
            placeholder="@media (min-width: 1025px) { }"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            CSS for desktop devices (min-width: 1025px)
          </small>
        </div>
      </div>

      <div className="reactor-setting-group">
        <h4>Custom CSS</h4>
        <div className="reactor-setting-field reactor-textarea-field">
          <label>Additional CSS</label>
          <textarea
            value={props.customCSS || ''}
            onChange={(e) => handleChange('customCSS', e.target.value)}
            rows={8}
            placeholder="/* Add custom CSS here */"
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <small style={{ color: '#646970', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Add any additional custom CSS for this block
          </small>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;

