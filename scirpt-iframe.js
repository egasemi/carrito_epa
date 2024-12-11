
const urlParams = new URLSearchParams(window.location.search);
const nodo = urlParams.get('nodo');
const cont = document.getElementById('cont');
const iframe = document.createElement('iframe');
const spinner = document.getElementById('spinner')
iframe.src = `https://script.google.com/macros/s/AKfycbzdb5gT_gyGmvH9WtC1-9bKfi61b6XvlMbj-PMWci7Ad8DSTkgRq7EAYrOHS_4ljJ14kQ/exec?nodo=${nodo}`;

// Ajustar el iframe cuando termine de cargarse
iframe.onload = function () {
    spinner.classList.add('d-none')
    spinner.classList.remove('d-flex')
    iframe.style.height = '100%';
};

cont.appendChild(iframe);