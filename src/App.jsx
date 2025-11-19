import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Toolbar from './components/Toolbar';
import BlockPanel from './components/BlockPanel';
import Canvas from './components/Canvas';
import SettingsPanel from './components/SettingsPanel';
import TemplatesPanel from './components/TemplatesPanel';
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
          onPreview={setPreviewMode}
          previewMode={previewMode}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
          saving={saving}
        />
        
        <div className="reactor-builder-content">
          <div className="reactor-builder-sidebar-left">
            <TemplatesPanel
              onLoadTemplate={(templateLayout) => {
                updateLayout(templateLayout);
              }}
              onSaveTemplate={handleSave}
              currentLayout={layout}
            />
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
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
