import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get root element from WordPress admin page.
// When editing with react_builder, use 'editor' ID, otherwise use 'reactor-builder-root'
const rootElement = document.getElementById('editor') || document.getElementById('reactor-builder-root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

