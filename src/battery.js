const HID = require("node-hid");

let device = null;
let deviceInfo = null;

let lastBattery = 0;
let lastCharging = false;

function connect(info) {

    if (device) {
        try {
            device.close();
        } catch {}
    }

    device = new HID.HID(info.path);
    deviceInfo = info;
}

function disconnect() {

    if (device) {
        try {
            device.close();
        } catch {}
    }

    device = null;
}

function getBattery() {

    if (!device)
        return null;

    try {

        device.sendFeatureReport([
            0x03,
            0x08,
            0xfb,
            0x14
        ]);

        const data = device.getFeatureReport(0x03, 64);

        if (
            data.length >= 5 &&
            data[0] === 0x03 &&
            data[1] === 0x08 &&
            data[2] === 0x14
        ) {

            lastBattery = data[3];
            lastCharging = data[4] === 1;

        }

        return {
            battery: lastBattery,
            charging: lastCharging,
            product: deviceInfo ? deviceInfo.product : "Glorious Mouse"
        };

    } catch (e) {

        console.log("Battery Read Error:", e.message);

        return {
            battery: lastBattery,
            charging: lastCharging,
            product: deviceInfo ? deviceInfo.product : "Glorious Mouse"
        };

    }

}

module.exports = {
    connect,
    disconnect,
    getBattery
};