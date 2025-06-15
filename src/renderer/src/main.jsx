import './assets/main.css'

import { StrictMode } from 'react'
import { Routes, Route, HashRouter } from 'react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import UpdatePartner from './UpdatePartner'
import CreatePartner from './CreatePartner'
import SalesHistory from './SalesHistory'
// Создаем корневой элемент React приложения и рендерим его в DOM-узел с id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  // Оборачиваем приложение в HashRouter для управления маршрутизацией через хэш в URL
  <HashRouter>
    <StrictMode>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/update' element={<UpdatePartner/>}/>
        <Route path='/create' element={<CreatePartner/>}/>
        <Route path='/sales-history' element={<SalesHistory/>}/>
      </Routes>
    </StrictMode>
  </HashRouter>
)
