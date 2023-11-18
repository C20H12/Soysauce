const { MongoClient } = require('mongodb');
require("dotenv").config();

const url = process.env.MONGODB_CONNECT_STRING;
const dbName = 'questions';

const client = new MongoClient(url, { family: 4 });

async function setup() {
  try {
    await client.connect();
  } catch (err) {
    console.error(err);
  }
}

async function query(queryObj, collectionName) {
  // console.log(queryObj, collectionName);
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const result = await collection.find(queryObj).toArray();
    
    return [true, result];
  } catch (err) {
    return [false, err.message]
  }
}

setup()

module.exports = query;