import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import DownfieldOS from './DownfieldOS.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DownfieldOS />
    </BrowserRouter>
  </React.StrictMode>,
)
