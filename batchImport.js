const { MongoClient } = require("mongodb");
require("dotenv").config();
const data = require("./data");

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const batchImport = async () => {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("apitesting");
  await db.collection("acronym").insertMany(data);
  client.close();
};

batchImport();
