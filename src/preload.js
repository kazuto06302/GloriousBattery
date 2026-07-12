const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

    getConfig() {
        return ipcRenderer.invoke("config:get");
    },

    setConfig(config) {
        return ipcRenderer.invoke("config:set", config);
    },

    getBattery() {
        return ipcRenderer.invoke("battery:get");
    }

});