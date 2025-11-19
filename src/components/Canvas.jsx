import React from 'react';
import { useDrop } from 'react-dnd';
import BlockRenderer from './BlockRenderer';
import './Canvas.css';

function Canvas({
  layout,
  selectedBlock,
  onSelectBlock,
  onUpdateLayout,
  onAddBlock,
  onAddBlockWithStructure,
  onDeleteBlock,
  deviceMode,
  previewMode,
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    drop: (item, monitor) => {
      // Only handle drop if it wasn't already handled by a child element
      // This prevents canvas from handling drops that should go to blocks
      if (!monitor.didDrop()) {
        const isOverCurrent = monitor.isOver({ shallow: true });
        
        // Only handle if we're directly over the canvas (not a block)
        if (isOverCurrent) {
          // If it's a layout block (section, row, column, container), add directly to root
          if (['section', 'row', 'column', 'container'].includes(item.type)) {
            onAddBlock(item.type);
          } else {
            // For content blocks on empty canvas, use the structure helper
            if (onAddBlockWithStructure) {
              onAddBlockWithStructure(item.type);
            } else {
              // Fallback: create structure manually
              onAddBlock('section');
            }
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const getCanvasStyle = () => {
    const styles = {
      desktop: { maxWidth: '100%' },
      tablet: { maxWidth: '768px' },
      mobile: { maxWidth: '375px' },
    };
    return styles[deviceMode] || styles.desktop;
  };

  return (
    <div className="reactor-canvas-wrapper">
      <div
        ref={drop}
        className={`reactor-canvas ${isOver ? 'drag-over' : ''} ${previewMode ? 'preview-mode' : ''} device-${deviceMode}`}
        style={getCanvasStyle()}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectBlock(null);
          }
        }}
      >
        {layout.sections.length === 0 ? (
          <div className="reactor-canvas-empty">
            <p>Drag blocks here to start building</p>
          </div>
        ) : (
          layout.sections.map((section) => (
            <BlockRenderer
              key={section.id}
              block={section}
              selectedBlock={selectedBlock}
              onSelectBlock={onSelectBlock}
              onAddBlock={onAddBlock}
              onDeleteBlock={onDeleteBlock}
              onUpdateBlock={(blockId, updates) => {
                const newLayout = JSON.parse(JSON.stringify(layout));
                const block = findBlock(newLayout, blockId);
                if (block) {
                  Object.assign(block.props, updates);
                  onUpdateLayout(newLayout);
                }
              }}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function findBlock(layout, blockId) {
  for (const section of layout.sections) {
    const found = findBlockRecursive(section, blockId);
    if (found) return found;
  }
  return null;
}

function findBlockRecursive(block, blockId) {
  if (block.id === blockId) return block;
  if (block.children) {
    for (const child of block.children) {
      const found = findBlockRecursive(child, blockId);
      if (found) return found;
    }
  }
  return null;
}

export default Canvas;

