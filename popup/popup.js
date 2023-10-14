// the checkbox behind the slider
const enabledCheckbox = document.querySelector("input[type=checkbox]");

// get the stored item and set the checkbox to the previously stored value
// NOTE: The local storage of the popup is not the same as the page's
const storedStatus = localStorage.getItem("ss-ctl-enabled");
enabledCheckbox.checked =  storedStatus === "true";

// whenever the slider is changed
enabledCheckbox.addEventListener("change", async () => {
  
  localStorage.setItem("ss-ctl-enabled", enabledCheckbox.checked.toString());

  sendStatus(enabledCheckbox.checked)
})

async function sendStatus(action) {
  // need to get the tab's id to send the message to
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

  if (!tab?.id) {
    return;
  }

  let response;
  if (action === true) {
    response = await chrome.tabs.sendMessage(tab.id, "enable-ctl");
  }
  else {
    response = await chrome.tabs.sendMessage(tab.id, "disable-ctl");
  }

  // should not happen but might happen
  if (!response) {
    console.error("failed");
  }
}