// click events from the popup page and from update alert worker
chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg === "bypass") {
    forceBypass();

    respond(true);
  }
  else if (msg === "hl") {
    highlight();

    respond(true);
  }
  else if (msg === "hlq") {
    highlightQuizQuestions();

    respond(true);
  }
  else if (msg === "auto") {
    autoRun();

    respond(true);
  }
  else if (msg === "capture") {
    capturePageHTML();

    respond(true);
  }

  else{
    respond(false);
  }
});

// keyboard shortcuts
(async () => {
  // get keys from storage
  const savedData = await chrome.storage.local.get(["soysauceSavedData"]);
  const keyBypass = savedData.soysauceSavedData?.keys_bypass ?? "\\";
  const keyHl = savedData.soysauceSavedData?.keys_hl ?? "]";
  const keyHlq = savedData.soysauceSavedData?.keys_hlq ?? "[";
  const keyAuto = savedData.soysauceSavedData?.keys_auto ?? "=";
  window.addEventListener("keydown", (e) => {
    if (e.key === keyBypass) {
      forceBypass();
    }
    if (e.key === keyHl) {
      highlight();
    }
    if (e.key === keyHlq) {
      highlightQuizQuestions();
    }
    if (e.key === keyAuto) {
      autoRun();
    }
    if ([keyBypass, keyHl, keyHlq, keyAuto].includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  })
})()


// only applies to quiz document, 
// run periodically so that it gives the user time to get past the start quiz screen
// then removes the interval
// cancel all events that could potentially used to spy on you
// this removes the shortcur keys as well, so you can only use the popup to highlight the quiz
if (document.querySelector("#assessment-iframe")) {
  let intervalTracker = 0;
  const intervalId = setInterval(() => {
    if (intervalTracker > 30) {
      clearInterval(intervalId);
    }
    
    const quizBody = document.querySelector("#assessment-iframe")?.contentDocument.querySelector("body");
    if (quizBody?.querySelector("#assessment")) {
      if (document.fullscreenElement != null) {
        document.exitFullscreen().catch(_e => alert("Failed to exit fullscreen."));
      }
      quizBody.addEventListener("contextmenu", cancelListener);
      quizBody.addEventListener("focus", cancelListener);
      quizBody.addEventListener("blur", cancelListener);
      quizBody.addEventListener("copy", cancelListener);
      quizBody.addEventListener("mousedown", cancelListener);
      quizBody.addEventListener("mouseup", cancelListener);
      quizBody.addEventListener("mouseout", cancelListener);
      quizBody.addEventListener("mouseover", cancelListener);
      quizBody.querySelector("#anti-cheat").value = '0';
      clearInterval(intervalId);
    }

    intervalTracker++;
  }, 3000);   
}
