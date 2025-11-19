import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Wait for DOM to be ready and ensure editor element is clean
function initBuilder() {
  // Get root element from WordPress admin page.
  // When editing with react_builder, use 'editor' ID, otherwise use 'reactor-builder-root'
  const rootElement = document.getElementById('editor') || document.getElementById('reactor-builder-root');

  if (rootElement) {
    rootElement.innerHTML = '';
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBuilder);
} else {
  initBuilder();
}

