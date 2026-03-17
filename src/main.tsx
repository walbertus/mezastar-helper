/**
 * Mezastar Helper - Main Entry Point
 * Bootstrap React application into the DOM.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';

const appContainer = document.getElementById('app');

if (!appContainer) {
  throw new Error('App container element not found');
}

createRoot(appContainer).render(
  <StrictMode>
    <App />
  </StrictMode>
);
