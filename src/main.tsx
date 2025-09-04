import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'
import { EmbajadorProvider } from './context/EmbajadorContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmbajadorProvider>
        <App />
      </EmbajadorProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
