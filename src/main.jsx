import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get root element from WordPress admin page.
const rootElement = document.getElementById('reactor-builder-root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

