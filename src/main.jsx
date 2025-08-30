import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

document.body.addEventListener("touchmove", function (e) {
      e.preventDefault();
});
document.body.addEventListener("scroll", function (e) {
      e.preventDefault();
});
document.body.addEventListener("wheel",function (e) {
      e.preventDefault();
}, false);
