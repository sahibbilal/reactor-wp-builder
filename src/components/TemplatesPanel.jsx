import React, { useState, useEffect } from 'react';
import './TemplatesPanel.css';

function TemplatesPanel({ onLoadTemplate, onSaveTemplate, currentLayout }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `${window.reactorBuilder.apiUrl}templates`,
        {
          headers: {
            'X-WP-Nonce': window.reactorBuilder.nonce,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      const response = await fetch(
        `${window.reactorBuilder.apiUrl}templates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.reactorBuilder.nonce,
          },
          body: JSON.stringify({
            name: templateName,
            layout: currentLayout,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates([...templates, data.template]);
        setShowSaveModal(false);
        setTemplateName('');
        alert('Template saved successfully!');
      } else {
        alert('Error saving template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const handleLoadTemplate = async (templateId) => {
    try {
      const response = await fetch(
        `${window.reactorBuilder.apiUrl}templates/${templateId}`,
        {
          headers: {
            'X-WP-Nonce': window.reactorBuilder.nonce,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (onLoadTemplate && data.layout) {
          onLoadTemplate(data.layout);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error loading template');
    }
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(
        `${window.reactorBuilder.apiUrl}templates/${templateId}`,
        {
          method: 'DELETE',
          headers: {
            'X-WP-Nonce': window.reactorBuilder.nonce,
          },
        }
      );

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
      } else {
        alert('Error deleting template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  if (loading) {
    return (
      <div className="reactor-templates-panel">
        <div className="reactor-templates-loading">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="reactor-templates-panel">
      <div className="reactor-templates-header">
        <h3>Templates</h3>
        <button
          className="reactor-templates-save-btn"
          onClick={() => setShowSaveModal(true)}
        >
          Save Template
        </button>
      </div>

      {showSaveModal && (
        <div className="reactor-templates-modal">
          <div className="reactor-templates-modal-content">
            <h3>Save Template</h3>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTemplate();
                }
              }}
            />
            <div className="reactor-templates-modal-actions">
              <button onClick={handleSaveTemplate}>Save</button>
              <button onClick={() => {
                setShowSaveModal(false);
                setTemplateName('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="reactor-templates-list">
        {templates.length === 0 ? (
          <div className="reactor-templates-empty">
            <p>No templates saved yet.</p>
            <p>Save your current layout as a template to reuse it later.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="reactor-template-item"
              onClick={() => handleLoadTemplate(template.id)}
            >
              <div className="reactor-template-name">{template.name}</div>
              <div className="reactor-template-actions">
                <button
                  className="reactor-template-delete"
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                  title="Delete template"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TemplatesPanel;

