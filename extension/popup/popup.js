// the checkbox behind the slider
const enabledCheckbox = document.querySelector("input[type=checkbox]");

// stall checkbox
const stallCheckbox= document.querySelector("[data-stall]");

// get the stored item and set the checkbox to the previously stored value
// NOTE: The local storage of the popup is not the same as the page's
const storedStatus = JSON.parse(localStorage.getItem("ss-status-storage"));
enabledCheckbox.checked = storedStatus?.sauceBtn ?? false;
stallCheckbox.checked = storedStatus?.stall ?? false;

const statusToStore = {
  sauceBtn: undefined,
  stall: undefined,
}

// whenever the checkboxes are changed
enabledCheckbox.addEventListener("change", async () => {
  statusToStore.sauceBtn = enabledCheckbox.checked;
  localStorage.setItem("ss-status-storage", JSON.stringify(statusToStore));

  sendStatus(enabledCheckbox.checked, "ctl")
})

stallCheckbox.addEventListener("change", async () => {
  statusToStore.stall = stallCheckbox.checked;
  localStorage.setItem("ss-status-storage", JSON.stringify(statusToStore));

  sendStatus(stallCheckbox.checked, "stall")
})


async function sendStatus(action, name) {
  // need to get the tab's id to send the message to
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

  if (!tab?.id) {
    return;
  }

  let response;
  if (action === true) {
    response = await chrome.tabs.sendMessage(tab.id, `enable-${name}`);
  }
  else {
    response = await chrome.tabs.sendMessage(tab.id, `disable-${name}`);
  }

  // should not happen but might happen
  if (!response) {
    console.error("failed");
  }
}