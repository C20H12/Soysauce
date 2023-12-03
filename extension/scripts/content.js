
// click events from the popup page and from update alert worker
chrome.runtime.onMessage.addListener((msg, _sender, respond) => {

  if (msg === "bypass") {
    try {
      forceBypass();
    } 
    catch {
      alert("Current page not supported.")
    }

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
window.addEventListener("keydown", (e) => {
  if (e.key === "\\") {
    forceBypass();
  }
  if (e.key === "]") {
    highlight();
  }
  if (e.key === "[") {
    highlightQuizQuestions();
  }
  if (["\\", "]", "["].includes(e.key)) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
})


// only applies to quiz document, 
// run periodically so that it gives the user time to get past the start quiz screen
// then removes the interval
// cancel all events that could potentially used to spy on you
if (document.querySelector("#assessment-iframe")) {
  let intervalTracker = 0;
  const intervalId = setInterval(() => {
    const quizBody = document.querySelector("#assessment-iframe")?.contentDocument.querySelector("body");
    if (quizBody?.querySelector("#assessment")) {
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
    if (intervalTracker > 30) {
      clearInterval(intervalId);
    }
    intervalTracker++;
  }, 3000);   
}
