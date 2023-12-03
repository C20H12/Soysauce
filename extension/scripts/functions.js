/**
 * uses the hidden form submit tag to send a correct message to the server.
 * automatically skips the question and have it counted as correct
 */
function forceBypass() {
  const a = document.querySelector("form[name=Pass]");
  if (!a) {
    alert("Current page not supported.");
    return;
  }
  a.insertAdjacentHTML(
    "beforeend",
    `
    <input id="annotate_it" name="it" type="hidden" value="0">
    <input id="more_ts" name="more_ts" type="hidden" value="ostentatious">
    `
  )
  a.submit()
}


/**
 * highlight the correct answer for the current question
 * @param {boolean} useReturn - if true, for word questions return the word instead of alerting it
 * @returns {undefined | null | HTMLElement | string}
 */
async function highlight(useReturn = false) {
  // get the current question's Id
  const qid = document.querySelector("[data-qid]")?.dataset.qid;
  if (!qid) {
    alert("Current page not supported.");
    return;
  }

  // get question from DB
  const questionFound = await search("questions", "qid", qid);
  if (questionFound == undefined || questionFound.length === 0) {
    if (!useReturn) {
      alert("Question not found in database.");
    }
    return;
  }

  // options to choose from
  const choices = document.querySelectorAll("li.choice");
  let correctChoice = null;
  
  // no choices, text input question, alert word
  if (choices.length === 0) {
    if (!useReturn){
      alert(questionFound[0]?.data.question?.answer);
    } else {
      correctChoice = questionFound[0]?.data.question?.answer;
    }
  } 
  // constellation or some fill the blank,- get word by wordId
  else if (questionFound[0].data.question.answer == null) {
    const wd = await search("word", "wordId", questionFound[0].data.question.wordId);
    if (wd == undefined || wd.length === 0) {
      if (!useReturn) {
        alert("Word not found in database.");
      }
      return;
    }

    [...choices].forEach(choice => {
      const choiceText = choice.innerText.toLowerCase();
      // some words have s or ed added to the end
      if ([choiceText, choiceText.slice(0, -1), choiceText.slice(0, -2)]
          .includes(wd[0].data.word.wordform.toLowerCase())) {
        choice.style.backgroundColor = "#f0fff1";
        correctChoice = choice;
      }
    })
  }
  // normal question - show answer
  else {
    [...choices].forEach(choice => {
      // remove non standard single quotes that some questions have
      const choiceText = choice.innerText.toLowerCase().replace("’", "'");
      // some words have s or ed added to the end
      if ([choiceText, choiceText.slice(0, -1), choiceText.slice(0, -2)]
          .includes(questionFound[0].data.question.answer.toLowerCase().trim())) {
        choice.style.backgroundColor = "#f0fff1";
        correctChoice = choice;
      }
    })
  }
  return correctChoice;
}

/**
 * highlight the correct answer for all the questions in the quiz
 */
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
    const questionParsed = await search("questions", "answerId", optionAnswerId);

    // multiple possible answers, this will be an array
    let answer = null;

    // answerId lookup failed:  must be a fill the blank question - 
    // get the question text, search, use answer if exists, else get the wordId, then get the wordform
    if (questionParsed.length === 0) {
      const questionTextElem = firstInput.parentElement.parentElement.parentElement.previousElementSibling;
      const blankQuestionText = questionTextElem.innerHTML.slice(1, -2).replace(`<span class="blank"></span>`, "___");
      const blankQuestionParsed = await search("questions", "text", blankQuestionText);
      if (!blankQuestionParsed[0]) return;

      if (blankQuestionParsed[0].data.question.answer) {
        answer = [blankQuestionParsed[0].data.question.answer];
      } else { 
        const blankQuestionWordId = blankQuestionParsed[0].data.question.wordId;
        const wordParsed = await search("word", "wordId", blankQuestionWordId);
        const wordform = wordParsed[0]?.data.word.wordform;
        if (!wordform) return;
        
        answer = [wordform];
      }
    } 
    // question starts with Select...
    // must be a multi select question - get the corresonding ID in the quiz DB, then compare isCorrect hasings
    else if (questionParsed[0].data.question.text.startsWith("Select")) {
      const quizParsed = await search("quiz", "qid", questionParsed[0].data.question.id);
      const correctAnswers = quizParsed[0]?.data.question.answers
        .filter((ans, i) => ans.isCorrect === questionParsed[0].data.question.answers[i].isCorrect)
        .map(ans => ans.text);
      if (correctAnswers.lengths === 0) return;

      answer = correctAnswers;
    }
    // simple multiple choice question - get the answer field
    else if (questionParsed[0].data.question.answer) {
      answer = [questionParsed[0].data.question.answer];
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

/**
 * capture the current page's HTML and download it as a file
 */
function capturePageHTML() {
  const documentString = document.documentElement.outerHTML;
  const allIframes = document.querySelectorAll("iframe");
  const iframeStrings = [...allIframes].map(iframe => iframe.contentDocument.documentElement.outerHTML);
  
  // append the iframe contents after the main file
  const html = new Blob([documentString, ...iframeStrings], {type: "text/html"});
  const timeStamp = new Date().toISOString();

  const a = document.createElement("a");
  a.download = `soysauce_debug_${timeStamp}.html`;
  a.href = URL.createObjectURL(html);
  a.click();
  a.remove();
  URL.revokeObjectURL(html);
}

/**
 * auto progresses in the training
 */
function autoRun() {
  const observed = document.querySelector("#content-wrapper");
  if (!observed) {
    alert("Current page not supported.");
    return;
  }

  // if already observing, stop
  if (window.observer) {
    alert("Auto run disabled");
    window.observer.disconnect();
    window.observer = null;
    return;
  }

  const callback = (mutationList, _observer) => {
    for (const mutation of mutationList) {
      // the loading modal is just removd, page loaded
      if (mutation.removedNodes.length === 1) {
        const importantTags = {
          // question with a qid, most training questions
          question: mutation.target.querySelector("[data-qid]"),
          // word learning page
          word: mutation.target.querySelector("#next-btn"),
          // word input page, spell it or after learning a new word
          input: mutation.target.querySelector("input#choice")
        }
        // pause on each page, can be customized
        const timeouts = {
          question: 3000,
          word: 5000
        }

        // not new word input, just spelling questions, -- Need more testing
        if (importantTags.question && importantTags.input) {
          setTimeout(() => {
            highlight(true).then(result => {
              if (result && typeof result === "string") {
                // fill in the answer if found
                importantTags.input.value = result;
                importantTags.input.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
              }
            })
          }, timeouts.question);
        }
        if (importantTags.question) {
          setTimeout(() => {
            highlight(true).then(result => {
              if (!result) {
                // randomly select if answer is not found
                mutation.target.querySelectorAll("li.choice")[Math.floor(Math.random() * 3)].click();
              }
              // click the correct choice
              if (result && typeof result === "object") {
                result.click();
              }
            })
          }, timeouts.question);
        }
        if (importantTags.word) {
          setTimeout(() => {
            // choose the quizlet anser, then press next
            const questionChoice = document.querySelector("#choice-section > li.choice.answer");
            questionChoice.click();
            importantTags.word.click();
          }, timeouts.word);
        }
        if (importantTags.input) {
          setTimeout(() => {
            // get the word from the audio link, then fill it in
            const answer = document.querySelector("#pronounce-sound")?.getAttribute("path").split("-")[1];
            importantTags.input.value = answer;
            importantTags.input.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
          }, timeouts.word);
        }
      }
    }
  };

  window.observer = new MutationObserver(callback);

  alert("Engaging... Please do not leave this page or press any inputs");  

  // Start observing the target node for configured mutations
  window.observer.observe(observed, {childList: true});

  // initial trigger to get the callback running
  const dummy = document.createElement("div");
  observed.appendChild(dummy);
  observed.removeChild(dummy);
}