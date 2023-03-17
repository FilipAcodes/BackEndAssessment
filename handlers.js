const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//POST /acronym creates an acronym, checks if either the acronym or definition is missing
// and adds it to the database
const createAcronym = async (req, res) => {
  const { acronym, definition } = req.body;
  if (!acronym || !definition) {
    res.status(400).json({
      status: 400,
      data: [{ acronym: acronym }, { definition: definition }],
      message: "Invalid information provided",
    });
  }
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("apitesting");
  const addAcronym = await db
    .collection("acronym")
    .insertOne({ _id: uuidv4(), acronym: acronym, definition: definition });

  addAcronym.acknowledged
    ? res.status(201).json({
        status: 201,
        data: [{ acronym: acronym }, { definition: definition }],
        message: "Acronym successfully created",
      })
    : res.status(400).json({
        status: 400,
        message: "An Error has Occured",
      });
};

module.exports = { createAcronym };
