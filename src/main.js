//modules
require("v8-compile-cache"); //For better startup
const path = require("path");
const { app, BrowserWindow, screen, clipboard, dialog, shell, globalShortcut, session, ipcMain, ipcRenderer } = require('electron');
const electronLocalshortcut = require("electron-localshortcut");
const Store = require("electron-store");
const config = new Store();
const { DiscordClient, InitRPC } = require('./features/discordRPC')
const { autoUpdate } = require('./features/autoUpdate');

if (require("electron-squirrel-startup")) {
    app.quit();
}
if (config.get('disableFrameRateLimit', false)) {
    app.commandLine.appendSwitch('disable-frame-rate-limit')
}

ipcMain.on('close-me', (evt, arg) => {
    app.quit();
})

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('high-dpi-support', 1);
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('disable-web-security');

let gamePreload = path.resolve(__dirname + '/preload/global.js')
let splashPreload = path.resolve(__dirname + '/preload/splash.js')
let settingsPreload = path.resolve(__dirname + '/preload/settings.js')

let win;
let splash;
let canDestroy;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: "#000000",
        titleBarStyle: 'hidden',
		frame: false,
        show: false,
        acceptFirstMouse: true,
        icon: icon,
        webPreferences: {
            nodeIntergation: true,
            preload: gamePreload,
            enableRemoteModule: true
        },
    });
    createShortcutKeys();
    create_set();

    win.loadURL('https://kirka.io/');
    


    win.on('close', function() {
        app.exit();
    });

    win.webContents.on('new-window', function(event, url) {
        event.preventDefault()
        win.loadURL(url);
    });

    if (config.get("enablePointerLockOptions", false)) {
        app.commandLine.appendSwitch("enable-pointer-lock-options");
    }

    let contents = win.webContents;

    win.once("ready-to-show", () => {
        showWin();
        if (config.get("discordRPC", true)) {
            InitRPC();
            DiscordClient(win.webContents);
        }
        if (config.get("chatType", "Show") !== "Show") {
            win.webContents.send('chat', false, true);
        }
    });

    function showWin() {
        if (!canDestroy) {
            setTimeout(showWin, 500);
            return;
        }
        splash.destroy();
        if (config.get("fullScreenStart", true)) {
            win.setFullScreen(true);
        }
        win.show();
    }
    
}

function createShortcutKeys() {
    const contents = win.webContents;

    electronLocalshortcut.register(win, 'Escape', () => contents.executeJavaScript('document.exitPointerLock()', true));
    electronLocalshortcut.register(win, 'F4', () => clipboard.writeText(contents.getURL()));
    electronLocalshortcut.register(win, 'F5', () => contents.reload());
    electronLocalshortcut.register(win, 'Shift+F5', () => contents.reloadIgnoringCache());
    electronLocalshortcut.register(win, 'F6', () => checkkirka());
    electronLocalshortcut.register(win, 'F11', () => win.setSimpleFullScreen(!win.isSimpleFullScreen()));
    electronLocalshortcut.register(win, 'Enter', () => chatShowHide());
}

let chatState = false;
function chatShowHide() {
    let chatType = config.get("chatType", "Show")
    return;
    switch (chatType) {
        case 'Show':
            break;
        case 'Hide':
            win.webContents.send('chat', false, false)
            break;
        case 'On-Focus':
            break;
            win.webContents.send('chat', chatState, false)
            if (chatState) {
                chatState = false;
            } else {
                chatState = true;
            }
    }
}

function checkkirka() {
    const urld = clipboard.readText();
    if (urld.includes("https://kirka.io/games/")) {
        win.loadURL(urld);
    }
}

app.allowRendererProcessReuse = true;

let icon;
if (process.platform === "linux") {
    icon = __dirname + "/media/icon.png"
} else {
    icon = __dirname + "/media/icon.ico"
}

app.whenReady().then(() => createSplashWindow());

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

function createSplashWindow() {
    splash = new BrowserWindow({
        width: 600,
        height: 350,
        center: true,
        resizable: false,
        frame: false,
        show: true,
	    icon: icon,
        transparent: true,
        alwaysOnTop: false,
        webPreferences: {
            preload: splashPreload,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    splash.loadFile(`${__dirname}/splash/splash.html`);

    autoUpdate(splash.webContents).then((didUpdate) => {
        if (didUpdate) {
            let options  = {
                buttons: ["Ok"],
                message: "Update Complete! Please relaunch the client."
            }
            dialog.showMessageBox(options)
            .then(() => {
                app.quit();
            })
        } else {
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            createWindow();
            wait(10000).then(() => { 
                canDestroy = true;
            });
        }
    });
}

function create_set() {
    setwin = new BrowserWindow({
        width: 1000,
        height: 600,
        show: false,
        frame: true,
        icon: __dirname + "/media/icon.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: settingsPreload
          }
    });
    setwin.removeMenu();
    setwin.loadFile(path.join(__dirname, "/settings/settings.html"));
    //setwin.setResizable(false)

    setwin.on('close', (event) => {
        event.preventDefault();
        setwin.hide();
    });

    ipcMain.on('show-settings', () => {
        setwin.show()
    })

    setwin.once('ready-to-show', () => {
        //setwin.show()
        //setwin.webContents.openDevTools();
    })

};
