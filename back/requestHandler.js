const query = require("./db");

/**
 * function to handle the request and send a query result json back
 * @param {string} searchBy 
 * @param {string} searchString 
 * @param {string} type 
 * @param {import("express").Response} res 
 * @returns {Promise<undefined>}
 */
async function handleRequest(searchBy, searchString, type, res) {
  if (searchBy.length === 0 || searchString.length === 0) {
    res.status(400).send({status: 400, message: "One or more empty request parameters"});
    return;
  }

  let queryObj;
  if (searchBy === "qid") {
    queryObj = {"data.question.id": searchString};
  } else if (searchBy === "text") {
    queryObj = {"$text": {"$search": searchString}};
  } else if (searchBy === "answerId") {
    queryObj = {"data.question.answers.id": {$in: [searchString]}}
  } else if (searchBy === "wordId") {
    queryObj = {"data.word.id": searchString};
  } else if (searchBy === "word") {
    queryObj = {"data.word.wordform": {"$regex": searchString, "$options": "i"}};
  } else {
    res.status(400).send({status: 400, message: "Invalid search parameter"});
    return;
  }

  let collection;
  if (type === "questions") {
    collection = "normal_questions";
  } else if (type === "quiz") {
    collection = "quiz_questions";
  } else if (type === "word") {
    collection = "words";
  } else {
    res.status(400).send({status: 400, message: "Invalid type name."});
    return;
  }

  const [queryStatus, queryResult] = await query(queryObj, collection);
  
  if (!queryStatus) {
    res.status(500).send({status: 400, message: 'Error executing query, ' + queryResult});
  }
  else {
    res.set("Access-Control-Allow-Origin", "*");
    res.json(queryResult);
  }
}

module.exports = handleRequest;