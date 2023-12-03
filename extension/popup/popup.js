// force bypass button
document.querySelector("[data-ctl]").addEventListener("click", async () => {
  sendStatus("bypass")
})

// highlighting button
document.querySelector("[data-hl]").addEventListener("click", async () => {
  sendStatus("hl");
})

// highlighting quiz button
document.querySelector("[data-hlq]").addEventListener("click", async () => {
  sendStatus("hlq");
})

// debug capture button
document.querySelector("[data-capture]").addEventListener("click", () => {
  sendStatus("capture");
})

// auto run button
document.querySelector("[data-auto]").addEventListener("click", () => {
  sendStatus("auto");
})

async function sendStatus(name) {
  try {

    
    // need to get the tab's id to send the message to
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

    if (!tab?.id) {
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, `${name}`);

    // should not happen but might happen
    if (!response) {
      console.error("failed");
    }
  } catch (e) {
    alert("This page is not supported.")
  }
}