const notify = document.getElementById("notify");
const startup = document.getElementById("startup");
const tray = document.getElementById("tray");
const interval = document.getElementById("interval");

const batteryText = document.getElementById("batteryText");
const chargeText = document.getElementById("chargeText");
const productText = document.getElementById("productText");

//--------------------------------------------------
// load
//--------------------------------------------------

async function loadConfig() {
    const config = await window.api.getConfig();

    notify.checked = config.notify;
    startup.checked = config.startWithWindows;
    tray.checked = config.minimizeToTray;
    interval.value = config.interval;
}

//--------------------------------------------------
// save
//--------------------------------------------------

async function saveConfig() {

    await window.api.setConfig({
        notify: notify.checked,
        startWithWindows: startup.checked,
        minimizeToTray: tray.checked,
        interval: Number(interval.value)
    });

}

//--------------------------------------------------
// battery
//--------------------------------------------------

async function updateBattery() {

    const data = await window.api.getBattery();

    if (!data) {

        batteryText.textContent = "🔋 --%";

        chargeText.textContent = "Disconnected";
        chargeText.style.color = "#ff6666";

        productText.textContent = "-";

        return;

    }

    batteryText.textContent =
        `🔋 ${data.battery}%`;

    productText.textContent =
        data.product ?? "-";

    //------------------------------------
    // charge
    //------------------------------------

    if (data.charging) {

        chargeText.textContent = "⚡ Charging";
        chargeText.style.color = "#44d26a";

    } else {

        chargeText.textContent = "On Battery";

        if (data.battery <= 10)
            chargeText.style.color = "#ff4444";
        else if (data.battery <= 20)
            chargeText.style.color = "#ffb347";
        else
            chargeText.style.color = "#ffffff";

    }

}

//--------------------------------------------------

notify.onchange = saveConfig;
startup.onchange = saveConfig;
tray.onchange = saveConfig;
interval.onchange = saveConfig;

//--------------------------------------------------

(async () => {

    await loadConfig();

    await updateBattery();

    setInterval(updateBattery, 1000);

})();