const { Notification } = require("electron");
const path = require("path");

let lastLowLevel = null;
const trigger = 5

function update(product, percent, charging, onClick) {

    if (charging) {
        lastLowLevel = null;
        return;
    }

    if (percent <= trigger && lastLowLevel !== trigger) {

        const notification = new Notification({
            title: "Glorious Battery",
            body: `${product} battery is at ${percent}%`,
            icon: path.join(__dirname, "icons", "icon.png"),
            silent: false
        });

        if (onClick) {
            notification.on("click", onClick);
        }

        notification.show();
        lastLowLevel = trigger;
    }

}

module.exports = {update};