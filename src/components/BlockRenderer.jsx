import React from 'react';
import { useDrop } from 'react-dnd';
import BlockComponents from '../blocks';
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
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'block',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        // Check if block can accept this type
        if (canAcceptBlock(block.type, item.type)) {
          onAddBlock(item.type, block.id);
        } else if (block.type === 'column' && !canAcceptBlock(block.type, item.type)) {
          // If dropping content block on column but column is full, add to column anyway
          // This allows adding content blocks directly to columns
          if (['heading', 'text', 'image', 'button', 'divider', 'container'].includes(item.type)) {
            onAddBlock(item.type, block.id);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    canDrop: (item) => {
      // Allow dropping if block can accept this type, or if it's a column and item is a content block
      return canAcceptBlock(block.type, item.type) || 
             (block.type === 'column' && ['heading', 'text', 'image', 'button', 'divider', 'container'].includes(item.type));
    },
  });

  const isSelected = selectedBlock === block.id;
  const Component = BlockComponents[block.type] || BlockComponents.container;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectBlock(block.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDeleteBlock(block.id);
    }
  };

  return (
    <div
      ref={drop}
      className={`reactor-block-wrapper ${isSelected ? 'selected' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={handleClick}
      style={{ '--depth': depth }}
    >
      {isSelected && (
        <div className="reactor-block-toolbar">
          <span className="reactor-block-type">{block.type}</span>
          <button
            className="reactor-block-delete"
            onClick={handleDelete}
            title="Delete Block"
          >
            ×
          </button>
        </div>
      )}
      <div className="reactor-block-content">
        <Component
          {...block.props}
          children={block.children}
          selected={isSelected}
          onUpdate={(updates) => onUpdateBlock(block.id, updates)}
        >
          {block.children && block.children.map((child) => (
            <BlockRenderer
              key={child.id}
              block={child}
              selectedBlock={selectedBlock}
              onSelectBlock={onSelectBlock}
              onAddBlock={onAddBlock}
              onDeleteBlock={onDeleteBlock}
              onUpdateBlock={onUpdateBlock}
              depth={depth + 1}
            />
          ))}
        </Component>
      </div>
    </div>
  );
}

function canAcceptBlock(parentType, childType) {
  const rules = {
    section: ['row'],
    row: ['column'],
    column: ['container', 'heading', 'text', 'image', 'button', 'divider'],
    container: ['heading', 'text', 'image', 'button', 'divider'],
  };
  return rules[parentType]?.includes(childType) || false;
}

export default BlockRenderer;

