import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'
import { EmbajadorProvider } from './context/EmbajadorContext'
import { NotificationsProvider } from './components/Notifications'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmbajadorProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </EmbajadorProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
