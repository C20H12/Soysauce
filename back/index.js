const express = require('express');
const query = require("./db");

const app = express();

// middleware to parse json body
app.use(express.json());

// middleware to catch json parse errors
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ status: 400, message: err.message }); // Bad request, json error
  }
  next();
});


async function handleRequest(searchBy, searchString, type, res) {
  if (searchBy.length === 0 || searchString.length === 0) {
    res.status(400).send({status: 400, message: "One or more empty request parameters"});
    return;
  }

  let queryObj;
  if (searchBy === "qid") {
    queryObj = {"data.question.id": searchString};
  } else if (searchBy === "text") {
    queryObj = {"data.question.text": {"$regex": searchString, "$options": "i"}};
  } else if (searchBy === "answerId") {
    queryObj = {"data.question.answers.id": {$in: [searchString]}}
  } else if (searchBy === "wordId") {
    queryObj = {"data.question.wordId": searchString};
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

/**
 * POST with the following structure
 * 
 * headers: {
 *  "Content-Type": "application/json"
 * },
 * body: {
 *  type: "word" | "quiz" | "questions",
 *  query: {
 *    "by": "qid" | "text" | "wordId" | "word",
 *    "search": ""
 *  }
 * }
 */
app.post('/api/v1/query', async (req, res) => {
  const body = req.body;
  await handleRequest(body.query.by, body.query.search, body.type, res);
});

/**
 * GET with the following structure
 * 
 * /api/v1/:type/?by=wordId&search=string
 */
app.get('/api/v1/get/:type/', async (req, res) => {
  try {
    await handleRequest(req.query.by, decodeURIComponent(req.query.search), req.params.type, res);
  } catch (err) {
    return res.status(400).send({ status: 400, message: "Bad request format" + err }); 
  }
});


app.listen(process.env.PORT, () => {
  console.log('Server is running on port 3000');
});