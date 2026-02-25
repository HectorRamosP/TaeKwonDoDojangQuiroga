/**
 * @module index
 * @description Punto de entrada de la aplicación React. Inicializa el árbol de componentes
 * y envuelve la aplicación con BrowserRouter para habilitar el enrutamiento del lado del cliente.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/Global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();