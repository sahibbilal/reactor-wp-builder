import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Toolbar from './components/Toolbar';
import BlockPanel from './components/BlockPanel';
import Canvas from './components/Canvas';
import SettingsPanel from './components/SettingsPanel';
import { useBuilderState } from './hooks/useBuilderState';
import { saveLayout, loadLayout } from './utils/api';
import './styles/App.css';

function App() {
  const {
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
  } = useBuilderState();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle preview - open post in new tab
  const handlePreview = useCallback(async () => {
    if (!window.reactorBuilder) return;
    
    const postId = window.reactorBuilder.postId || new URLSearchParams(window.location.search).get('post_id');
    
    if (!postId) {
      alert('No post ID found. Please save the post first.');
      return;
    }
    
    // Get the post permalink from WordPress REST API
    const restUrl = window.reactorBuilder.root || window.location.origin + '/wp-json/';
    
    try {
      // First, try to get post type and then the permalink
      // We'll try common post types: posts, pages, and custom post types
      const postTypes = ['posts', 'pages'];
      
      let postUrl = null;
      
      // Try to get permalink from REST API
      for (const postType of postTypes) {
        try {
          const response = await fetch(`${restUrl}wp/v2/${postType}/${postId}?_fields=link,type`, {
            headers: {
              'X-WP-Nonce': window.reactorBuilder.nonce,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.link) {
              postUrl = data.link;
              break;
            }
          }
        } catch (e) {
          // Continue to next post type
          continue;
        }
      }
      
      // If we found a permalink, use it
      if (postUrl) {
        window.open(postUrl, '_blank');
      } else {
        // Fallback: construct URL manually using post ID
        const fallbackUrl = `${window.location.origin}/?p=${postId}`;
        window.open(fallbackUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting post permalink:', error);
      // Fallback: construct URL manually
      const fallbackUrl = `${window.location.origin}/?p=${postId}`;
      window.open(fallbackUrl, '_blank');
    }
  }, []);

  // Load layout on mount
  useEffect(() => {
    const loadInitialLayout = async () => {
      if (window.reactorBuilder) {
        try {
          // Try to load existing layout from post_id
          const postId = window.reactorBuilder.postId || new URLSearchParams(window.location.search).get('post_id');
          
          if (postId) {
            const savedLayout = await loadLayout(postId);
            if (savedLayout) {
              updateLayout(savedLayout);
            }
          }
        } catch (error) {
          console.error('Error loading layout:', error);
        }
      }
      setLoading(false);
    };

    loadInitialLayout();
  }, []);

  // Handle keyboard shortcuts (Delete/Backspace to delete selected block)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle Delete/Backspace if a block is selected
      if (!selectedBlock) {
        return;
      }

      // Don't delete if user is typing in an input, textarea, or contenteditable
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable ||
                      target.closest('input, textarea, [contenteditable="true"]');
      
      if (isInput) {
        return;
      }

      // Handle Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.confirm('Are you sure you want to delete this block?')) {
          deleteBlock(selectedBlock);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBlock, deleteBlock]);

  // Save layout handler
  const handleSave = useCallback(async () => {
    if (!window.reactorBuilder) return;

    setSaving(true);
    try {
      const postId = window.reactorBuilder.postId || new URLSearchParams(window.location.search).get('post_id');
      
      if (!postId) {
        alert('No post ID found. Please edit a post to save its layout.');
        setSaving(false);
        return;
      }
      
      await saveLayout(postId, layout);
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Error saving layout. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [layout]);

  if (loading) {
    return (
      <div className="reactor-builder-loading">
        <div>Loading Reactor Builder...</div>
      </div>
    );
  }

  // Helper to find block by ID
  const findBlockById = (layout, blockId) => {
    for (const section of layout.sections) {
      const found = findBlockRecursive(section, blockId);
      if (found) return found;
    }
    return null;
  };

  const findBlockRecursive = (block, blockId) => {
    if (block.id === blockId) return block;
    if (block.children) {
      for (const child of block.children) {
        const found = findBlockRecursive(child, blockId);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="reactor-builder">
        <Toolbar
          onSave={handleSave}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onPreview={handlePreview}
          previewMode={previewMode}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
          saving={saving}
        />
        
        <div className="reactor-builder-content">
          <div className="reactor-builder-sidebar-left">
            <BlockPanel onAddBlock={addBlock} />
          </div>
          
          <Canvas
            layout={layout}
            selectedBlock={selectedBlock}
            onSelectBlock={selectBlock}
            onUpdateLayout={updateLayout}
            onAddBlock={addBlock}
            onAddBlockWithStructure={(blockType) => {
              // Create section → row → column → content block structure in one update
              const newLayout = JSON.parse(JSON.stringify(layout));
              
              const timestamp = Date.now();
              const sectionId = `block-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
              const rowId = `block-${timestamp + 1}-${Math.random().toString(36).substr(2, 9)}`;
              const columnId = `block-${timestamp + 2}-${Math.random().toString(36).substr(2, 9)}`;
              const contentId = `block-${timestamp + 3}-${Math.random().toString(36).substr(2, 9)}`;
              
              const getDefaultProps = (type) => {
                const defaults = {
                  section: { padding: '20px', backgroundColor: '#ffffff', margin: '0' },
                  row: { gap: '20px', alignItems: 'stretch', justifyContent: 'flex-start' },
                  column: { width: '100%', padding: '10px' },
                  text: { content: 'Text block', fontSize: '16px', color: '#000000' },
                  heading: { content: 'Heading', level: 2, fontSize: '24px', color: '#000000' },
                  image: { src: '', alt: 'Image', width: '100%' },
                  button: { text: 'Button', link: '#', backgroundColor: '#0073aa', color: '#ffffff' },
                  divider: { height: '1px', color: '#cccccc' },
                  container: { padding: '20px', backgroundColor: 'transparent' },
                };
                return defaults[type] || {};
              };
              
              const section = {
                id: sectionId,
                type: 'section',
                props: getDefaultProps('section'),
                children: [],
              };
              
              const row = {
                id: rowId,
                type: 'row',
                props: getDefaultProps('row'),
                children: [],
              };
              
              const column = {
                id: columnId,
                type: 'column',
                props: getDefaultProps('column'),
                children: [],
              };
              
              const contentBlock = {
                id: contentId,
                type: blockType,
                props: getDefaultProps(blockType),
                children: null,
              };
              
              column.children.push(contentBlock);
              row.children.push(column);
              section.children.push(row);
              newLayout.sections.push(section);
              
              updateLayout(newLayout);
            }}
            onDeleteBlock={deleteBlock}
            deviceMode={deviceMode}
            previewMode={previewMode}
          />
          
          <SettingsPanel
            selectedBlock={selectedBlock ? findBlockById(layout, selectedBlock) : null}
            onUpdateBlock={updateBlock}
            layout={layout}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
