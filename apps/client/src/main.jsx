import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@store'
import { registerStore } from '@store/storeRegistry'
import './index.css'
import App from '@/App.jsx'

// Register store for use in non-React services without circular dependencies
registerStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
