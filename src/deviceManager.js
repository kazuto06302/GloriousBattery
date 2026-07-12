const HID = require("node-hid");

let device = null;

function findDevice() {

    const devices = HID.devices();

    const glorious = devices.find(d =>

        d.vendorId === 0x093A &&
        d.manufacturer &&
        d.manufacturer.toLowerCase().includes("glorious") &&
        d.usagePage === 0xFF00 &&
        d.usage === 1

    );

    if (!glorious)
        return null;

    return glorious;

}

function connect() {

    if (device)
        return device;

    const info = findDevice();

    if (!info)
        return null;

    device = new HID.HID(info.path);

    console.log("Connected:", info.product);

    return device;

}

function disconnect() {

    if (!device)
        return;

    try {
        device.close();
    } catch {}

    device = null;

}

function getDevice() {

    try {

        if (!device)
            connect();

        return device;

    } catch {

        disconnect();

        return null;

    }

}

module.exports = {
    getDevice,
    disconnect,
    connect
};