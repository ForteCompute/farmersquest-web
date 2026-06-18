import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { applyTheme } from './design-system';
import './design-system/fonts.css';
import './design-system/global.css';
import './design-system/motion.css';

// Project the design tokens onto the document as CSS custom properties before first paint, then
// mount the app.
applyTheme();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root was not found in index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
