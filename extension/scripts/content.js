
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
  
  else{
    respond(false);
  }

});


window.addEventListener("keydown", (e) => {
  if (e.key === "\\") {
    forceBypass();
  }
  e.stopImmediatePropagation();
})

function forceBypass() {
  const a=document.querySelector("form[name=Pass]")
  a.insertAdjacentHTML("beforeend",'<input id="annotate_it" name="it" type="hidden" value="0"><input id="more_ts" name="more_ts" type="hidden" value="ostentatious">')
  a.submit()
}

function highlight() {
  const qid = document.querySelector("[data-qid]")?.dataset.qid;
  if (!qid) {
    return;
  }
  fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/questions/?by=qid&search=${qid}`)
  .then(res => res.json())
  .then(q => {
    const choices = document.querySelectorAll("li.choice");
    // text input question
    if (choices.length === 0) {
      alert(q[0]?.data.question?.answer);
    } 
    // constellation 
    else if (q[0]?.data.question.answer == null) {
      fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/word/?by=wordId&search=${q[0]?.data.question.wordId}`)
      .then(res => res.json())
      .then(wd => {
        [...choices].forEach(choice => {
          if (choice.innerText.toLowerCase() === wd[0]?.data.word.wordform.toLowerCase()) {
            choice.style.backgroundColor = "#c6fbc8";
          }
        })
      })
    }
    // normal question
    else {
      [...choices].forEach(choice => {
        if (choice.innerText.toLowerCase() === q[0]?.data.question.answer.toLowerCase()) {
          choice.style.backgroundColor = "#c6fbc8";
        }
      })
    }
  })
}


function cancelListener(e) {
  e.stopImmediatePropagation();
}

// only applies to quiz document
const quizBody = document.querySelector("#assessment-iframe")?.contentDocument.querySelector("body");
if (quizBody) {
  quizBody.addEventListener("contextmenu", cancelListener)
  quizBody.addEventListener("focus", cancelListener)
  quizBody.addEventListener("blur", cancelListener)
  quizBody.addEventListener("copy", cancelListener)
  quizBody.addEventListener("mousedown", cancelListener)
  quizBody.addEventListener("mouseup", cancelListener)
  quizBody.addEventListener("mouseout", cancelListener)
  quizBody.addEventListener("mouseover", cancelListener)
}

// todo: document.querySelector("#assessment-iframe").contentDocument.querySelectorAll("ul > li:nth-child(1) input[value]")