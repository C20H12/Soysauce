document.querySelectorAll("[data-action]").forEach(action => {
  action.addEventListener("click", () => {
    const { action: name } = action.dataset;
    sendStatus(name);
  });
})

// check if a saved data object exists, if not define the defaults
chrome.storage.local.get(["soysauceSavedData"], async (data) => {
  if (!data.soysauceSavedData) {
    const defaultData = {
      word_min: 40,
      word_max: 80,
      question_min: 10,
      question_max: 15,
      color_question: "#f0fff1",
      color_quiz: "#f0fff1",
    }
    await chrome.storage.local.set({ soysauceSavedData: defaultData });
  }
});

document.querySelector("[data-settings=open]").addEventListener('click', async () => {
  // show settings area
  document.querySelector("div.settings").style.display = "block";
  document.body.style.width = '30rem';
  // prefill the fields with saved data
  const savedData = await chrome.storage.local.get(["soysauceSavedData"]);
  document.querySelectorAll("input[data-setting-property]").forEach(inp => {
    inp.value = savedData.soysauceSavedData[inp.dataset.settingProperty];
  });
})

document.querySelector("[data-settings=close]").addEventListener('click', async () => {
  // close settings area
  document.querySelector("div.settings").style.display = "none";
  document.body.style.width = 'fit-content';
})

document.querySelector("[data-settings=save]").addEventListener('click', async () => {
  // verify values
  for (const section of document.querySelectorAll("[data-setting-numbers]")) {
    const minInput = section.querySelector("input[data-setting-property*=_min]");
    const maxInput = section.querySelector("input[data-setting-property*=_max]");
    const minInputValue = parseInt(minInput.value);
    const maxInputValue = parseInt(maxInput.value);
    if (minInputValue > maxInputValue) {
      alert("Error: max is less than min at one or more sections");
      return;
    }
    if (minInputValue < parseInt(minInput.min) || minInputValue > parseInt(minInput.max) ) {
      alert(`Error: at ${minInput.dataset.settingProperty},  must be between ${minInput.min} and ${minInput.max}`);
      return;
    }
    if (maxInputValue < parseInt(maxInput.min) || maxInputValue > parseInt(maxInput.max) ) {
      alert(`Error: at ${maxInput.dataset.settingProperty},  must be between ${maxInput.min} and ${maxInput.max}`);
      return;
    }
  }

  // save data from the input fields
  const dataToSave = {};
  document.querySelectorAll("input[data-setting-property]").forEach(inp => {
    dataToSave[inp.dataset.settingProperty] = inp.value;
  });
  await chrome.storage.local.set({ soysauceSavedData: dataToSave });
  
  // close settings area
  document.querySelector("div.settings").style.display = "none";
  document.body.style.width = 'fit-content';
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