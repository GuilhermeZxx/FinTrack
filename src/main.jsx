import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Componente from './Componente.jsx'
import TesteProps from './TesteProps.jsx'
import Inscricao from './inscricao.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  <Componente/>
    <App />
    <TesteProps texto="teste de clique" label="Clique" />
    <TesteProps texto="Olá"  label="Saiba mais"/>
    <Inscricao conteudo="olá" />
  </StrictMode>,
  
)
