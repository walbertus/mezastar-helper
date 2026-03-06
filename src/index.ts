/**
 * Mezastar Helper - Main Entry Point
 * Pokemon battle recommendation service for Mezastar
 */

import './styles.css'
import { App } from './ui/App'

const appContainer = document.getElementById('app')

if (!appContainer) {
  throw new Error('App container element not found')
}

// Initialize the application
const app = new App(appContainer)
app.render()
