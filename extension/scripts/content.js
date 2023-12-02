
// click events from the popup page
chrome.runtime.onMessage.addListener((msg, _sender, respond) => {

  if (msg === "enable-ctl") {
    try {
      forceBypass();
    } 
    catch {
      alert("Current page not supported.")
    }

    respond(true);
  }

  else if (msg === "enable-hl") {
    highlight();

    respond(true);
  }
  
  else if (msg === "enable-hlq") {
    highlightQuizQuestions();

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
  e.stopImmediatePropagation();
})


// only applies to quiz document, 
// run periodically so that it gives the user time to get past the start quiz screen
// then removes the interval
// cancel all events that could potentially used to spy on you
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
  if (intervalTracker > 8) {
    clearInterval(intervalId);
  }
  intervalTracker++;
}, 3000);  
