const { Tray, Menu, nativeImage, app } = require("electron");
const { createCanvas, Image } = require("@napi-rs/canvas");
const fs = require("fs");
const path = require("path");

let tray;

let openSettings = null;
let refreshBattery = null;

const iconPath = path.join(__dirname, "icons", "icon.png");

//--------------------------------------------------
// icon
//--------------------------------------------------

const baseIcon = new Image();
baseIcon.src = fs.readFileSync(iconPath);

//--------------------------------------------------

async function create(settingsCallback, refreshCallback) {

    openSettings = settingsCallback;
    refreshBattery = refreshCallback;

    tray = new Tray(nativeImage.createEmpty());
    tray.setToolTip("Glorious Battery");
    tray.on("click", () => {
        if (openSettings) openSettings();
    });

    rebuildMenu(
        "--", false, "No Device"
    );

    tray.setImage(
        await generateIcon("--", false)
    );
}

//--------------------------------------------------

function rebuildMenu(percent, charging, product) {

    if (!tray) return;

    const status = charging ? "(Charging)" : "";

    tray.setContextMenu(

        Menu.buildFromTemplate([

            {
                label: `${product} ${status}`,
                enabled: false
            },

            {
                label: `Battery: ${percent}%`,
                enabled: false
            },

            {
                type: "separator"
            },

            {
                label: "Settings",
                click() {
                    openSettings?.();
                }
            },

            {
                label: "Refresh",
                click() {
                    refreshBattery?.();
                }
            },

            {
                type: "separator"
            },

            {
                label: "Exit",
                click() {
                    app.quit();
                }
            }

        ])

    );
}

//--------------------------------------------------

async function generateIcon(text, charging) {

    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseIcon, 0, 0, 32, 32);

    //---------------------------------------

    ctx.fillStyle = charging
        ? "#31ff1a80"
        : "#11111180";

    ctx.fillRect(10, 16, 22, 16);

    //---------------------------------------

    ctx.fillStyle = "white";

    if (text.length >= 3)
        ctx.font = "bold 12px Segoe UI";
    else
        ctx.font = "bold 14px Segoe UI";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        21,
        24
    );

    return nativeImage.createFromBuffer(
        canvas.toBuffer("image/png")
    );

}

//--------------------------------------------------

async function update(percent, charging, product) {

    if (!tray)
        return;

    tray.setImage(
        await generateIcon(
            String(percent),
            charging
        )
    );

    tray.setToolTip(
        `Glorious Battery\n\n${product}\n${percent}%${charging ? " (Charging)" : ""}`
    );

    rebuildMenu(
        percent,
        charging,
        product
    );

}

//--------------------------------------------------

async function setDisconnected() {

    if (!tray)
        return;

    tray.setImage(
        await generateIcon("--", false)
    );

    tray.setToolTip(
        "Glorious Battery\n\nMouse Not Connected"
    );

    rebuildMenu("--", false, "Mouse Not Connected"
    );

}

//--------------------------------------------------

module.exports = {create, update, setDisconnected
};