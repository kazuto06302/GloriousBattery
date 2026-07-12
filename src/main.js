const { app, BrowserWindow, ipcMain, Menu } = require("electron");

const path = require("path");

const tray = require("./tray");
const battery = require("./battery");
const hidManager = require("./hidManager");
const notifier = require("./notifier");
const config = require("./config");

let mainWindow = null;
let timer = null;
let lastBattery = null;
let isQuitting = false;

//--------------------------------------------------
// Settings Window
//--------------------------------------------------

function createWindow() {

    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();

        return;
    }

    mainWindow = new BrowserWindow({
        width: 520,
        height: 520,
        resizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        show: false,
        title: "Glorious Battery",

        icon: path.join(__dirname, "icons", "icon.ico"),

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(
        path.join(
            __dirname, "renderer", "settings.html"
        )

    );

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

mainWindow.on("close", e => {
    if (!isQuitting && config.get().minimizeToTray) {
        e.preventDefault();
        mainWindow.hide();
    }
});

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

}

//--------------------------------------------------
// Battery Loop
//--------------------------------------------------

async function updateBattery() {

    const b = battery.getBattery();

    if (!b) {
        await tray.setDisconnected();
        lastBattery = null;
        return;
    }

    lastBattery = b;

    await tray.update(
        b.battery,
        b.charging,
        b.product
    );

    if (config.get().notify) {
        notifier.update(
            b.product,
            b.battery,
            b.charging,
            () => {
                createWindow();
            }
        );

    }

}

function startBatteryLoop() {
    if (timer) clearInterval(timer);
    updateBattery();

    timer = setInterval(
        updateBattery, config.get().interval * 1000
    );
}

//--------------------------------------------------
// IPC
//--------------------------------------------------

ipcMain.handle("config:get", () => config.get());

ipcMain.handle(
    "config:set",

    (event, newConfig) => {
        config.set(newConfig);
        app.setLoginItemSettings({
            openAtLogin: config.get().startWithWindows,
        });
        startBatteryLoop();
        return true;
    },
);

ipcMain.handle(
    "battery:get",
    () => lastBattery
);

//--------------------------------------------------
// Startup
//--------------------------------------------------

app.whenReady().then(async () => {
    app.setAppUserModelId("com.kzt.gloriousbattery");
    Menu.setApplicationMenu(null);

    config.load();

    app.setLoginItemSettings({
        openAtLogin: config.get().startWithWindows
    });

    await tray.create(createWindow, updateBattery);
    hidManager.waitUntilFound(device => {
        battery.connect(device);
        startBatteryLoop();

    });

});


app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on("before-quit", () => {
    isQuitting = true;
});