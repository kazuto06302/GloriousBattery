const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const configPath = path.join(
    app.getPath("userData"),
    "config.json"
);

const defaults = {
    interval: 10,
    notify: true,
    startWithWindows: true,
    minimizeToTray: true
};

let config = { ...defaults };

function load() {
    try {
        if (!fs.existsSync(configPath)) {
            save();
            return;
        }

        config = {
            ...defaults,
            ...JSON.parse(
                fs.readFileSync(configPath, "utf8")
            )
        };

    } catch {
        config = { ...defaults };
    }
}

function save() {
    fs.writeFileSync(
        configPath,
        JSON.stringify(config, null, 4),
        "utf8"
    );
}

function get() {
    return config;
}

function set(newConfig) {

    config = {
        ...config,
        ...newConfig
    };
    save();
}

module.exports = {
    load,
    save,
    get,
    set
};