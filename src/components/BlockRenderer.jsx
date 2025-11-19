import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import BlockComponents from '../blocks';
import InlineAddButton from './InlineAddButton';
import './BlockRenderer.css';

function BlockRenderer({
  block,
  selectedBlock,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onUpdateBlock,
  depth = 0,
}) {
  // Only set up drop zone for blocks that can have children
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'block',
    drop: (item, monitor) => {
      // Only handle drop if this block can have children
      if (!canHaveChildren) {
        return;
      }
      
      // Only handle drop if we're directly over this element (not a child)
      // and if the drop wasn't already handled by a child
      const isOverCurrent = monitor.isOver({ shallow: true });
      const didDrop = monitor.didDrop();
      
      if (isOverCurrent && !didDrop) {
        // Check if block can accept this type - STRICT validation
        if (canAcceptBlock(block.type, item.type)) {
          onAddBlock(item.type, block.id);
          return; // Explicitly return to indicate we handled the drop
        }
        // Do NOT allow any other drops - this prevents invalid block combinations
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    canDrop: (item) => {
      // Content blocks (text, heading, image, button, divider) cannot accept drops
      if (!canHaveChildren) {
        return false;
      }
      // STRICT validation: Only allow drops if the block can accept this type
      return canAcceptBlock(block.type, item.type);
    },
  });

  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedBlock === block.id;
  const Component = BlockComponents[block.type] || BlockComponents.container;
  const isEmpty = !block.children || block.children.length === 0;
  // Only section, row, column, and container can have children (not text, heading, image)
  const canHaveChildren = ['section', 'row', 'column', 'container'].includes(block.type);

  const handleClick = (e) => {
    // Don't handle click if it's on the row selection area (handled separately)
    if (e.target.classList.contains('reactor-row-selection-area')) {
      return;
    }
    
    // For columns, if clicking on empty wrapper space, allow click to bubble to parent row
    if (block.type === 'column') {
      const target = e.target;
      const wrapper = e.currentTarget;
      
      // If clicking directly on the wrapper (not content), allow it to bubble to select parent row
      if (target === wrapper) {
        // Don't stop propagation - let it bubble to parent row
        return;
      }
    }
    
    e.stopPropagation();
    onSelectBlock(block.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDeleteBlock(block.id);
    }
  };

  const getBlockLabel = (type) => {
    const labels = {
      section: 'Section',
      row: 'Row',
      column: 'Column',
      container: 'Container',
      heading: 'Heading',
      text: 'Text',
      image: 'Image',
      gallery: 'Gallery',
      button: 'Button',
      divider: 'Divider',
    };
    return labels[type] || type;
  };

  // Get width for column blocks to apply to wrapper
  const getWrapperStyle = () => {
    const baseStyle = { '--depth': depth };
    
    // If this is a column block, apply its width to the wrapper
    if (block.type === 'column' && block.props?.width) {
      baseStyle.width = block.props.width;
    }
    
    return baseStyle;
  };

  return (
    <div
      ref={canHaveChildren ? drop : null}
      className={`reactor-block-wrapper reactor-block-${block.type} ${isSelected ? 'selected' : ''} ${isOver && canDrop && canHaveChildren ? 'drag-over' : ''} ${canHaveChildren ? 'has-children' : ''} ${block.type === 'column' ? 'reactor-column-wrapper' : ''}`}
      data-block-id={block.id}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getWrapperStyle()}
    >
      {/* Block name label - always visible */}
      <div className="reactor-block-label">
        {getBlockLabel(block.type)}
      </div>
      
      {/* Row selection area - clickable area to select row even when columns are present */}
      {block.type === 'row' && (
        <div 
          className="reactor-row-selection-area"
          onClick={(e) => {
            e.stopPropagation();
            onSelectBlock(block.id);
          }}
        />
      )}

      {isSelected && (
        <div className="reactor-block-toolbar">
          <span className="reactor-block-type">{getBlockLabel(block.type)}</span>
          <button
            className="reactor-block-delete"
            onClick={handleDelete}
            title="Delete Block"
          >
            ×
          </button>
        </div>
      )}

      {/* Inject custom CSS and responsive styles */}
      {(block.props?.customCSS || block.props?.mobileCSS || block.props?.tabletCSS || block.props?.desktopCSS) && (
        <style dangerouslySetInnerHTML={{
          __html: [
            block.props?.customCSS ? `.reactor-block-wrapper[data-block-id="${block.id}"] { ${block.props.customCSS} }` : '',
            block.props?.mobileCSS ? `@media (max-width: 768px) { .reactor-block-wrapper[data-block-id="${block.id}"] { ${block.props.mobileCSS} } }` : '',
            block.props?.tabletCSS ? `@media (max-width: 1024px) { .reactor-block-wrapper[data-block-id="${block.id}"] { ${block.props.tabletCSS} } }` : '',
            block.props?.desktopCSS ? `@media (min-width: 1025px) { .reactor-block-wrapper[data-block-id="${block.id}"] { ${block.props.desktopCSS} } }` : ''
          ].filter(Boolean).join('\n')
        }} />
      )}
      
      <div className="reactor-block-content">
        <Component
          key={block.id}
          {...block.props}
          children={block.children}
          selected={isSelected}
          onUpdate={(updates) => onUpdateBlock(block.id, updates)}
        >
          {/* Show drop indicator when dragging over empty parent */}
          {canHaveChildren && isEmpty && isOver && canDrop && (
            <div className="reactor-block-drop-indicator">
              <span>Drop here to add {getBlockLabel(block.type === 'section' ? 'row' : block.type === 'row' ? 'column' : 'block')}</span>
            </div>
          )}
          {block.children && block.children.map((child, index) => (
            <React.Fragment key={child.id}>
              {/* Insert indicator before each child */}
              {canHaveChildren && (
                <div className="reactor-block-insert-indicator">
                  <InlineAddButton
                    parentType={block.type}
                    onAddBlock={(blockType) => onAddBlock(blockType, block.id, index)}
                    isEmpty={false}
                    compact={true}
                  />
                </div>
              )}
              <BlockRenderer
                block={child}
                selectedBlock={selectedBlock}
                onSelectBlock={onSelectBlock}
                onAddBlock={onAddBlock}
                onDeleteBlock={onDeleteBlock}
                onUpdateBlock={onUpdateBlock}
                depth={depth + 1}
              />
            </React.Fragment>
          ))}
          {/* Inline add button - shows at bottom after children for parent blocks ONLY */}
          {/* Content blocks (text, heading, image, button, divider) should NOT show this */}
          {canHaveChildren && (
            <div className="reactor-block-add-button">
              <InlineAddButton
                parentType={block.type}
                onAddBlock={(blockType) => {
                  const position = block.children ? block.children.length : 0;
                  onAddBlock(blockType, block.id, position);
                }}
                isEmpty={isEmpty}
              />
            </div>
          )}
        </Component>
      </div>
    </div>
  );
}

function canAcceptBlock(parentType, childType) {
  const rules = {
    section: ['row'],
    row: ['column'],
    column: ['container', 'heading', 'text', 'image', 'gallery', 'button', 'divider'],
    container: ['heading', 'text', 'image', 'gallery', 'button', 'divider'],
  };
  return rules[parentType]?.includes(childType) || false;
}

export default BlockRenderer;

