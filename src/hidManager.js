const HID = require("node-hid");

const GLORIOUS_VENDOR = 0x093A;

function findModelI2() {
    const devices = HID.devices();

    return devices.find(d =>
        d.vendorId === GLORIOUS_VENDOR &&
        d.usagePage === 0xFF00 &&
        d.usage === 0x01
    );
}

function waitUntilFound(callback) {

    let lastPath = null;

    setInterval(() => {

        const dev = findModelI2();

        if (dev) {

            if (dev.path !== lastPath) {
                lastPath = dev.path;
                callback(dev);
            }

        } else {

            lastPath = null;

        }

    },2000);

}

module.exports = {
    findModelI2,
    waitUntilFound
};