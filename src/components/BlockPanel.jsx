import React from 'react';
import { useDrag } from 'react-dnd';
import './BlockPanel.css';

const BLOCK_TYPES = [
  { type: 'section', label: 'Section', icon: '📄' },
  { type: 'row', label: 'Row', icon: '↔️' },
  { type: 'container', label: 'Container', icon: '📦' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'divider', label: 'Divider', icon: '➖' },
];

function BlockItem({ type, label, icon }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`reactor-block-item ${isDragging ? 'dragging' : ''}`}
    >
      <span className="reactor-block-icon">{icon}</span>
      <span className="reactor-block-label">{label}</span>
    </div>
  );
}

function BlockPanel({ onAddBlock }) {
  return (
    <div className="reactor-block-panel">
      <div className="reactor-block-panel-header">
        <h3>Blocks</h3>
      </div>
      <div className="reactor-block-panel-content">
        <div className="reactor-block-group">
          <div className="reactor-block-group-title">Layout</div>
          <div className="reactor-block-grid">
            {BLOCK_TYPES.filter(b => ['section', 'row', 'container'].includes(b.type)).map(block => (
              <BlockItem key={block.type} {...block} />
            ))}
          </div>
        </div>
        <div className="reactor-block-group">
          <div className="reactor-block-group-title">Content</div>
          <div className="reactor-block-grid">
            {BLOCK_TYPES.filter(b => !['section', 'row', 'container'].includes(b.type)).map(block => (
              <BlockItem key={block.type} {...block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockPanel;

