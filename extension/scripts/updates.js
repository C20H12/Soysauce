importScripts("./url.js");

chrome.runtime.onStartup.addListener(() => {
  fetch(BACKEND_URL + "/version")
    .then(r => r.json())
    .then(v => {
      const currentVersion = chrome.runtime.getManifest().version;
      if (v[0].extension === currentVersion) return;
      
      chrome.notifications.create("soysauce-update", {
        type: "basic",
        title: "Soy Sauce Update Alert",
        message: `Soy Sauce is outdated! Your version is ${currentVersion}, newest is ${v[0].extension}.`,
        contextMessage: "Go download the latest version at github.com/C20H12/Soysauce",
        iconUrl: chrome.runtime.getURL("assets/icon128.png"),
        requireInteraction: true
      });

      chrome.notifications.onClicked.addListener(() => {
        chrome.tabs.create({url: "https://github.com/C20H12/Soysauce"})
      })
    })
});