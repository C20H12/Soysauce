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
    ```
    <input id="annotate_it" name="it" type="hidden" value="0">
    <input id="more_ts" name="more_ts" type="hidden" value="ostentatious">
    ```
  )
  a.submit()
}


/**
 * highlight the correct answer for the current question
 */
async function highlight() {
  // get the current question's Id
  const qid = document.querySelector("[data-qid]")?.dataset.qid;
  if (!qid) {
    alert("Current page not supported.");
    return;
  }

  // get question from DB
  const questionFound = await search("questions", "qid", qid);
  if (questionFound == undefined || questionFound.length === 0) {
    alert("Question not found in database.");
    return;
  }

  // options to choose from
  const choices = document.querySelectorAll("li.choice");
  
  // no choices, text input question, alert word
  if (choices.length === 0) {
    alert(questionFound[0]?.data.question?.answer);
  } 
  // constellation - get word by wordId
  else if (questionFound[0].data.question.answer == null) {
    const wd = await search("word", "wordId", questionFound[0].data.question.wordId);
    if (wd == undefined || wd.length === 0) {
      alert("Word not found in database.");
      return;
    }

    [...choices].forEach(choice => {
      if (choice.innerText.toLowerCase() === wd[0]?.data.word.wordform.toLowerCase()) {
        choice.style.backgroundColor = "#f0fff1";
      }
    })
  }
  // normal question - show answer
  else {
    [...choices].forEach(choice => {
      if (choice.innerText.toLowerCase() === questionFound[0].data.question.answer.toLowerCase()) {
        choice.style.backgroundColor = "#f0fff1";
      }
    })
  }
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