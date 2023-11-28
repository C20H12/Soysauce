
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

function forceBypass() {
  const a = document.querySelector("form[name=Pass]");
  if (!a) {
    alert("Current page not supported.");
    return;
  }
  a.insertAdjacentHTML("beforeend",'<input id="annotate_it" name="it" type="hidden" value="0"><input id="more_ts" name="more_ts" type="hidden" value="ostentatious">')
  a.submit()
}

function highlight() {
  // get the current question's Id
  const qid = document.querySelector("[data-qid]")?.dataset.qid;
  if (!qid) {
    alert("Current page not supported.");
    return;
  }
  // get question from DB
  fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/questions/?by=qid&search=${qid}`)
  .then(res => res.json())
  .then(q => {
    const choices = document.querySelectorAll("li.choice");
    // text input question, alert word
    if (choices.length === 0) {
      alert(q[0]?.data.question?.answer);
    } 
    // constellation - get word by wordId
    else if (q[0]?.data.question.answer == null) {
      fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/word/?by=wordId&search=${q[0]?.data.question.wordId}`)
      .then(res => res.json())
      .then(wd => {
        [...choices].forEach(choice => {
          if (choice.innerText.toLowerCase() === wd[0]?.data.word.wordform.toLowerCase()) {
            choice.style.backgroundColor = "#f0fff1";
          }
        })
      })
    }
    // normal question - show answer
    else {
      [...choices].forEach(choice => {
        if (choice.innerText.toLowerCase() === q[0]?.data.question.answer.toLowerCase()) {
          choice.style.backgroundColor = "#f0fff1";
        }
      })
    }
  })
}

function highlightQuizQuestions() {
  const assessmentFrame = document.querySelector("#assessment-iframe");
  if (!assessmentFrame) {
    alert("Current page is not a quiz session or is not supported.");
    return;
  }
  
  [...assessmentFrame.contentDocument.querySelectorAll("#assessment > ol > li > div > ul")]
  .forEach(async (questionChoices, i) => {
    const questionChoiceTexts = questionChoices.querySelectorAll("li > label");

    // remove highlighting if already exists, then exit fn
    if ([...questionChoiceTexts].find(lbl => lbl.hasAttribute("style"))){
      questionChoiceTexts.forEach(choice => {
        choice.removeAttribute("style");
      })
      return;
    }

    // using the first choices' value attribute (contains the answer ID), find the corresponding question
    const firstInput = questionChoices.querySelector("li:nth-child(1) input[value]");
    const optionAnswerId = firstInput.value;
    const questionFetched = await fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/questions/?by=answerId&search=${optionAnswerId}`);
    const questionParsed = await questionFetched.json();

    // multiple possible answers, this will be an array
    let answer = null;

    // answerId lookup failed:  must be a fill the blank question - 
    // get the question text, search, use answer if exists, else get the wordId, then get the wordform
    if (questionParsed.length === 0) {
      const questionTextElem = firstInput.parentElement.parentElement.parentElement.previousElementSibling;
      const blankQuestionText = questionTextElem.innerHTML.slice(1, -2).replace(`<span class="blank"></span>`, "___");
      const blankQuestionFetched = await fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/questions/?by=text&search=${blankQuestionText}`);
      const blankQuestionParsed = await blankQuestionFetched.json();
      if (!blankQuestionParsed[0]) return;

      if (blankQuestionParsed[0].data.question.answer) {
        answer = [blankQuestionParsed[0].data.question.answer];
      } else { 
        const blankQuestionWordId = blankQuestionParsed[0].data.question.wordId;
        const word = await fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/word/?by=wordId&search=${blankQuestionWordId}`);
        const wordParsed = await word.json();
        const wordform = wordParsed[0]?.data.word.wordform;
        if (!wordform) return;
        
        answer = [wordform];
      }
    } 
    // question starts with Select...
    // must be a multi select question - get the corresonding ID in the quiz DB, then compare isCorrect hasings
    else if (questionParsed[0]?.data.question.text.startsWith("Select")) {
      const quizFetched = await fetch(`https://orca-app-fu96x.ondigitalocean.app/api/v1/get/quiz/?by=qid&search=${questionParsed[0].data.question.id}`);
      const quizParsed = await quizFetched.json();
      const correctAnswers = quizParsed[0]?.data.question.answers
        .filter((ans, i) => ans.isCorrect === questionParsed[0]?.data.question.answers[i].isCorrect)
        .map(ans => ans.text);
      if (correctAnswers.lengths === 0) return;

      answer = correctAnswers;
    }
    // simple multiple choice question - get the answer field
    else if (questionParsed[0]?.data.question.answer) {
      answer = [questionParsed[0]?.data.question.answer];
    }
    else {
      alert("Unknown question type: question: " + (i + 1));
    }

    // using the answer, find the correct one(s) in the options that matches the answers, and highlight
    questionChoiceTexts.forEach(choice => {
      const choiceText = choice.innerText.trim();
      if (answer?.includes(choiceText)) {
        choice.style.backgroundColor = "#f0fff1";
      }
    })
  })
}

// cancel all events that could potentially used to spy on you
function cancelListener(e) {
  e.stopImmediatePropagation();
}

// only applies to quiz document, run periodically so that it gives the user time to get past the start quiz screen
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
