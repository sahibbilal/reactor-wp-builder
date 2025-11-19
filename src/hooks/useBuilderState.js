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

      // If adding a row, automatically create 1 column with 100% width
      if (blockType === 'row') {
        const columnId = `block-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`;
        const column = {
          id: columnId,
          type: 'column',
          props: {
            ...getDefaultProps('column'),
            width: '100%',
          },
          children: [],
        };
        newBlock.children = [column];
        newBlock.props.numColumns = 1;
      }

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
  const updateBlock = useCallback((blockId, updates, generateColumns = false) => {
    setLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout));
      const block = findBlock(newLayout, blockId);
      if (block) {
        Object.assign(block.props, updates);
        
        // Handle column generation for rows
        if (generateColumns && block.type === 'row' && updates.numColumns !== undefined) {
          const numColumns = parseInt(updates.numColumns) || 1;
          const currentColumns = block.children || [];
          const defaultWidth = `${(100 / numColumns).toFixed(2)}%`;
          
          // Generate or remove columns
          if (numColumns > currentColumns.length) {
            // Add new columns
            for (let i = currentColumns.length; i < numColumns; i++) {
              const columnId = `block-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
              const column = {
                id: columnId,
                type: 'column',
                props: {
                  ...getDefaultProps('column'),
                  width: defaultWidth,
                },
                children: [],
              };
              block.children = block.children || [];
              block.children.push(column);
            }
          } else if (numColumns < currentColumns.length) {
            // Remove excess columns (keep existing content if possible)
            block.children = block.children.slice(0, numColumns);
          }
          
          // Update ALL column widths to equal distribution when numColumns changes
          // This ensures columns are evenly distributed (50% for 2, 33.33% for 3, etc.)
          if (block.children) {
            block.children.forEach((col) => {
              // Always update to the calculated default width based on new numColumns
              col.props.width = defaultWidth;
            });
          }
        }
        
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
    section: { padding: '20px', backgroundColor: '#ffffff', margin: '0' },
    row: { gap: '20px', alignItems: 'stretch', justifyContent: 'flex-start', padding: '0', margin: '0' },
    column: { width: '100%', padding: '10px', margin: '0' },
    text: { content: 'Text block', fontSize: '16px', color: '#000000', fontWeight: 'normal', textAlign: 'left', margin: '0', padding: '0' },
    heading: { content: 'Heading', level: 2, fontSize: '24px', color: '#000000', fontWeight: 'bold', textAlign: 'left', margin: '0 0 10px 0', padding: '0' },
    image: { src: '', alt: 'Image', width: '100%', attachmentId: null },
    button: { text: 'Button', link: '#', backgroundColor: '#0073aa', color: '#ffffff', fontSize: '16px', fontWeight: 'normal', textAlign: 'center', padding: '10px 20px', margin: '0', borderRadius: '4px' },
    divider: { height: '1px', color: '#cccccc' },
    container: { padding: '20px', backgroundColor: 'transparent', margin: '0' },
  };
  return defaults[blockType] || {};
}

