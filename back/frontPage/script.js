const searchType = document.querySelector("#searchType");
const searchMethod = document.querySelector("#searchMethod");
const searchString = document.querySelector("#searchString");
const goBtn = document.querySelector("#goBtn");
const disp = document.querySelector(".outputArea>div");

async function search(type, method, string) {
  const url = `${window.location.href}api/v1/get/${type}/?by=${method}&search=${string}`;
  try {
    const response = await fetch(url);
    const responseJson = await response.json();
    return responseJson;
  } catch (e) {
    alert(e);
  }
}

goBtn.addEventListener("click",async () => {
  const searchResult = await search(searchType.value, searchMethod.value, searchString.value);

  disp.innerHTML = "";

  if (searchResult[0]?.data.word) {
    disp.innerHTML = `
    <div class="word">
      <h2>${searchResult[0].data.word.wordform}</h2>
      <p class="word-id">${searchResult[0].data.word.id}</p>
      <p class="word-definition">${searchResult[0].data.word.definition}</p>
    </div>
    `
    return;
  }

  if (searchResult.length > 500) {
    alert("response too large");
    return;
  }

  searchResult.map(async q => {
    const questionText = q.data.question.text;
    let questionAnswers = '';
    let quizSearchResult = null;

    if (questionText.startsWith("Select")) {
      const compareCollection = searchType.value === "quiz" ? "questions" : "quiz"
      quizSearchResult = await search(compareCollection, "qid", q.data.question.id);
    }

    questionAnswers = q.data.question.answers.map((ans, i) => {
      let isCorrectBool;
      if (quizSearchResult != null) {
        isCorrectBool = ans.isCorrect === quizSearchResult[0]?.data.question.answers[i].isCorrect;
      } else {
        isCorrectBool = ans.text === q.data.question.answer;
      }
      return `
      <li><ul class="answer">
        <li class="answer-text">${ans.text}</li>
        <li class="answer-${isCorrectBool}">${isCorrectBool ? "correct" : "incorrect"}</li>
        <li class="answer-id">${ans.id}</li>
      </ul></li>
      `
    }).join("");


    disp.innerHTML+=(`
      <div class="question">
        <h2>${questionText}</h2>
        <p class="question-id">${q.data.question.id}</p>
        <p class="question-answer">${q.data.question.answer}</p>
        <ul>${questionAnswers}</ul>
      </div>
    `)

  });
});
