import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GlobalFilterProvider } from './context/GlobalFilterContext.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalFilterProvider>
      <App />
    </GlobalFilterProvider>,
  </React.StrictMode>,
)
