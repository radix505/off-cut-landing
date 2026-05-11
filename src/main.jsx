import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Always land at the top on page refresh — disable the browser's automatic
// scroll restoration and force position 0 before React mounts.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

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
