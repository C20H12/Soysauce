/**
 * search in database, alerts if error
 * @param {"word" | "quiz" | "questions"} type 
 * @param {"qid" | "text" | "answerId" | "wordId" | "word"} method 
 * @param {string} string 
 * @returns {object[] | undefined}
 */
async function search(type, method, string) {
  const url = `https://orca-app-fu96x.ondigitalocean.app/api/v1/get/${type}/?by=${method}&search=${string}`;
  try {
    const response = await fetch(url);
    const responseJson = await response.json();
    return responseJson;
  } catch (e) {
    alert(e);
  }
}

/**
 * stop all other listeners from running 
 * @param {Event} e - eventListener callback event
 */
function cancelListener(e) {
  e.stopImmediatePropagation();
}