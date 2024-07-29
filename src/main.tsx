import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App2.tsx'
import App from './App.tsx'
import { GlobalFilterProvider } from './context/GlobalFilterContext.tsx';
import { Provider } from 'react-redux';
import store from './redux/store.ts';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalFilterProvider>
        <App />
      </GlobalFilterProvider>,
    </Provider>
  </React.StrictMode>,
)
