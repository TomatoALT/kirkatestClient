const { ipcRenderer } = require('electron');
const Store = require("electron-store");
const config = new Store();
const tips = [
    'Click F4 to copy game URL to your clipboard!',
    'Use F5 to refresh the page',
    'HACKED',
    'F6 is used to join a game with a copied link',
    '404 Alert',
    'Turn on Discord Rich Presences to impress your friends',
    'Alt-F4 For FPS boost hehe',  
    'Error 404'
];

window.addEventListener('DOMContentLoaded', () => {
    const tiptext = document.getElementById('tips');
    ipcRenderer.on('tip', (event) => {
        let tip = tips[Math.floor(Math.random()*tips.length)];
        tiptext.innerText = tip;
    })

    const message = document.getElementById('status');
    ipcRenderer.on('message', (event, messageText = '') => {
        message.innerText = messageText;
    });

    const ver = document.getElementById('version');
    ipcRenderer.on('version', (event, messageText = '') => {
        ver.innerText = messageText;
    });
});
