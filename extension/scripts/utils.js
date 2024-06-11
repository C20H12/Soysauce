/**
 * search in database, alerts if error
 * @param {"word" | "quiz" | "questions"} type 
 * @param {"qid" | "text" | "answerId" | "wordId" | "word"} method 
 * @param {string} string 
 * @returns {object[] | undefined}
 */
async function search(type, method, string) {
  const url = `${BACKEND_URL}/api/v1/get/${type}/?by=${method}&search=${string}`;
  try {
    const response = await fetch(url);
    const responseJson = await response.json();
    return responseJson;
  } catch (e) {
    alert(e);
  }
}

/**
 * stop all other listeners on this event from running 
 * @param {Event} e - eventListener callback event
 */
function cancelListener(e) {
  e.stopImmediatePropagation();
}

/**
 * get a random integer between a range
 * @param {number} min - min
 * @param {number} max - max
 * @returns {number} - random integer
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}