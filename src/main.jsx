import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Componente from './Componente.jsx'
import TesteProps from './TesteProps.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  <Componente/>
    <App />
    <TesteProps texto="fjgodifgjoi" label="Clique" />
    <TesteProps texto="Olá"  label="Saiba mais"/>
  </StrictMode>,
  
)
