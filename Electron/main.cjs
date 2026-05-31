const { app, BrowserWindow } = require("electron");
const path = require("path");

// ================================
// HOT RELOAD
// ================================

const electronBin = process.platform === "win32" ? "electron.cmd" : "electron";

require("electron-reload")(path.join(__dirname, ".."), {
    electron: path.join(__dirname, "..", "node_modules", ".bin", electronBin),
    hardResetMethod: "exit"
});

// ================================
// INICIA EXPRESS
// ================================

require("../Server/server");

// ================================
// CREAR VENTANA
// ================================

function createWindow() {

    const win = new BrowserWindow({

        width: 1680,
        height: 945,

        minWidth: 1200,
        minHeight: 675,

        backgroundColor: "#0f172a",

        autoHideMenuBar: true,

        webPreferences: {

            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // ================================
    // CARGA TU APP
    // ================================

    win.loadURL("http://localhost:3000/game");

    // ================================
    // DEVTOOLS
    // ================================

    win.webContents.openDevTools();

    // ================================
    // MAXIMIZAR
    // ================================

    win.maximize();
}

// ================================
// APP READY
// ================================

app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {

            createWindow();
        }
    });
});

// ================================
// CERRAR APP
// ================================

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {

        app.quit();
    }
});