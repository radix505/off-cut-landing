import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS Safari rotation-cache fix: re-applies the viewport meta after orientation
// change so the layout viewport recalculates to the new screen dimensions.
const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
window.addEventListener('orientationchange', () => {
  const m = document.querySelector('meta[name=viewport]')
  if (!m) return
  m.setAttribute('content', VIEWPORT_CONTENT + ' ')
  setTimeout(() => m.setAttribute('content', VIEWPORT_CONTENT), 100)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
