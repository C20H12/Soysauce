const { MongoClient } = require('mongodb');
require("dotenv").config();

// mongodb url and credentials in .env file
const url = process.env.MONGODB_CONNECT_STRING;
const dbName = 'questions';

// connect to the db, using ipv4
const client = new MongoClient(url, { family: 4 });

async function setup() {
  try {
    await client.connect();
  } catch (err) {
    console.error(err);
  }
}

/**
 * 
 * @param {import('mongodb').Filter} queryObj - query in the format of a mongodb find arg
 * @param {string} collectionName  - name of the collection to search in
 * @returns {Promise<[boolean, string]} - return the success status and the resultant json string, or err msg
 */
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