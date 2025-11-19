import { useState, useCallback, useRef } from 'react';
import { createDefaultLayout } from '../utils/layoutUtils';

export function useBuilderState() {
  const [layout, setLayout] = useState(createDefaultLayout());
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [history, setHistory] = useState([createDefaultLayout()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [previewMode, setPreviewMode] = useState(false);

  // Add to history
  const addToHistory = useCallback((newLayout) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newLayout)));
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Update layout
  const updateLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    addToHistory(newLayout);
  }, [addToHistory]);

  // Select block
  const selectBlock = useCallback((blockId) => {
    setSelectedBlock(blockId);
  }, []);

  // Add block
  const addBlock = useCallback((blockType, parentId = null, position = null) => {
    setLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout));
      const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newBlock = {
        id: newBlockId,
        type: blockType,
        props: getDefaultProps(blockType),
        children: blockType === 'section' || blockType === 'row' || blockType === 'column' ? [] : null,
      };

      if (parentId) {
        const parent = findBlock(newLayout, parentId);
        if (parent) {
          if (position !== null && Array.isArray(parent.children)) {
            parent.children.splice(position, 0, newBlock);
          } else {
            parent.children = parent.children || [];
            parent.children.push(newBlock);
          }
        }
      } else {
        newLayout.sections.push(newBlock);
      }

      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);
  
  // Add block with structure (for content blocks on empty canvas)
  const addBlockWithStructure = useCallback((blockType) => {
    setLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout));
      
      // Create section
      const sectionId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const section = {
        id: sectionId,
        type: 'section',
        props: getDefaultProps('section'),
        children: [],
      };
      
      // Create row
      const rowId = `block-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`;
      const row = {
        id: rowId,
        type: 'row',
        props: getDefaultProps('row'),
        children: [],
      };
      
      // Create column
      const columnId = `block-${Date.now() + 2}-${Math.random().toString(36).substr(2, 9)}`;
      const column = {
        id: columnId,
        type: 'column',
        props: getDefaultProps('column'),
        children: [],
      };
      
      // Create content block
      const contentBlockId = `block-${Date.now() + 3}-${Math.random().toString(36).substr(2, 9)}`;
      const contentBlock = {
        id: contentBlockId,
        type: blockType,
        props: getDefaultProps(blockType),
        children: null,
      };
      
      // Assemble structure
      column.children.push(contentBlock);
      row.children.push(column);
      section.children.push(row);
      newLayout.sections.push(section);
      
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);

  // Delete block
  const deleteBlock = useCallback((blockId) => {
    setLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout));
      removeBlock(newLayout, blockId);
      if (selectedBlock === blockId) {
        setSelectedBlock(null);
      }
      addToHistory(newLayout);
      return newLayout;
    });
  }, [selectedBlock, addToHistory]);

  // Update block
  const updateBlock = useCallback((blockId, updates) => {
    setLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout));
      const block = findBlock(newLayout, blockId);
      if (block) {
        Object.assign(block.props, updates);
        addToHistory(newLayout);
      }
      return newLayout;
    });
  }, [addToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayout(JSON.parse(JSON.stringify(history[newIndex])));
      setSelectedBlock(null);
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayout(JSON.parse(JSON.stringify(history[newIndex])));
      setSelectedBlock(null);
    }
  }, [historyIndex, history]);

  return {
    layout,
    selectedBlock,
    history,
    historyIndex,
    deviceMode,
    previewMode,
    updateLayout,
    selectBlock,
    addBlock,
    deleteBlock,
    updateBlock,
    undo,
    redo,
    setDeviceMode,
    setPreviewMode,
  };
}

// Helper functions
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

function removeBlock(layout, blockId) {
  for (let i = 0; i < layout.sections.length; i++) {
    if (layout.sections[i].id === blockId) {
      layout.sections.splice(i, 1);
      return;
    }
    if (removeBlockRecursive(layout.sections[i], blockId)) {
      return;
    }
  }
}

function removeBlockRecursive(block, blockId) {
  if (block.children) {
    for (let i = 0; i < block.children.length; i++) {
      if (block.children[i].id === blockId) {
        block.children.splice(i, 1);
        return true;
      }
      if (removeBlockRecursive(block.children[i], blockId)) {
        return true;
      }
    }
  }
  return false;
}

function getDefaultProps(blockType) {
  const defaults = {
    section: { padding: '20px', backgroundColor: '#ffffff' },
    row: { gap: '20px', alignItems: 'stretch' },
    column: { width: '100%', padding: '10px' },
    text: { content: 'Text block', fontSize: '16px', color: '#000000' },
    heading: { content: 'Heading', level: 2, fontSize: '24px', color: '#000000' },
    image: { src: '', alt: 'Image', width: '100%' },
    button: { text: 'Button', link: '#', backgroundColor: '#0073aa', color: '#ffffff' },
    divider: { height: '1px', color: '#cccccc' },
    container: { padding: '20px', backgroundColor: 'transparent' },
  };
  return defaults[blockType] || {};
}

