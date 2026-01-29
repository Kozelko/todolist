import './styles/main.css';
import { initApp } from './modules/AppController.js';
import { initDOM } from './modules/DOMController.js';

// Inicializácia aplikácie
document.addEventListener('DOMContentLoaded', () => {
    // Načítaj dáta z localStorage a inicializuj stav
    initApp();

    // Inicializuj DOM a event listeners
    initDOM();

    console.log('Todo App initialized!');
});
