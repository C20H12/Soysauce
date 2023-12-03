document.querySelectorAll("[data-action]").forEach(action => {
  action.addEventListener("click", () => {
    const { action: name } = action.dataset;
    sendStatus(name);
  });
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