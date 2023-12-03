const express = require('express');
const cors = require("cors");
const handleRequest = require("./requestHandler");
const path = require("path");

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

// middleware to allow cross origin requests
app.use(cors());

// front page
app.get('/', async (_req, res) => {
  res.sendFile(path.join(__dirname, "./frontPage/index.html"));
})
app.get('/frontPage/script.js', async (_req, res) => {
  res.sendFile(path.join(__dirname, "./frontPage/script.js"));
})

/**
 * POST with the following structure
 * 
 * headers: {
 *  "Content-Type": "application/json"
 * },
 * body: {
 *  type: "word" | "quiz" | "questions",
 *  query: {
 *    "by": "qid" | "text" | "answerId" | "wordId" | "word",
 *    "search": ""
 *  }
 * }
 */
app.post('/api/v1/query', async (req, res) => {
  console.log(1)
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
    return res.status(400).send({ status: 400, message: "Bad request format: " + err }); 
  }
});

app.get('/version', async (_req, res) => {
  await handleRequest("version", " s", "version", res);
})

// on vps, it requires port 8080, so just making that a variable
app.listen(process.env.PORT, () => {
  console.log('Server is running on port 3000');
});