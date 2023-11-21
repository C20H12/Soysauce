// force bypass button
const enabledCheckbox = document.querySelector("[data-ctl]");

// highlighting button
const hlBtn = document.querySelector("[data-hl]");


// whenever the btns are clicked
enabledCheckbox.addEventListener("click", async () => {
  sendStatus("ctl")
})

hlBtn.addEventListener("click", async () => {
  sendStatus("hl");
})


async function sendStatus(name) {
  // need to get the tab's id to send the message to
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

  if (!tab?.id) {
    return;
  }

  const response = await chrome.tabs.sendMessage(tab.id, `enable-${name}`);

  // should not happen but might happen
  if (!response) {
    console.error("failed");
  }
}