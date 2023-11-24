// force bypass button
const skipBtn = document.querySelector("[data-ctl]");

// highlighting button
const hlBtn = document.querySelector("[data-hl]");

// highlighting quiz button
const hlqBtn = document.querySelector("[data-hlq]");


// whenever the btns are clicked
skipBtn.addEventListener("click", async () => {
  sendStatus("ctl")
})

hlBtn.addEventListener("click", async () => {
  sendStatus("hl");
})

hlqBtn.addEventListener("click", async () => {
  sendStatus("hlq");
})


async function sendStatus(name) {
  try {

    
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
  } catch (e) {
    alert("This page is not supported.")
  }
}