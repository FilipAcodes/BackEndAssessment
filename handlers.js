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
  client.close();
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

//Updates an acronym based on it's _id since it's unique
//If the ID is changed to the acronym itself, code needs to be changed to fit the query
//sends a response back based on the matchedCount
const updateAcronym = async (req, res) => {
  const { acronymID } = req.params;
  const { acronym } = req.body;
  //possibility to add definition update if requested
  const _id = acronymID;

  const filter = {
    $set: { acronym: acronym },
  };
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("apitesting");

  const newUpdateAcronym = await db
    .collection("acronym")
    .updateOne({ _id: _id }, filter);
  client.close();

  newUpdateAcronym.matchedCount === 0
    ? res.status(400).json({
        status: 400,
        message: "An Error has Occured,the document could not be updated",
      })
    : res.status(200).json({
        status: 200,
        data: [{ acronymID: acronymID }, { acronym: acronym }],
        message: "Acronym successfully updated",
      });
};

//Deletes an acronym based on it's ID, in the URL
//sends a response back depending on the deletedCount if it is successful
const deleteAcronym = async (req, res) => {
  const { acronymID } = req.params;
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("apitesting");

  const deleteAcronymFromDb = await db
    .collection("acronym")
    .deleteOne({ _id: acronymID });
  client.close();

  deleteAcronymFromDb.deletedCount === 0
    ? res.status(400).json({
        status: 400,
        message:
          "An Error has Occured,the document could not be deleted or has arleady been deleted",
      })
    : res.status(202).json({
        status: 202,
        message: "Acronym successfully deleted",
      });
};

const getAcronym = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const skip = (page - 1) * limit;
  const regex = new RegExp(search, "i");

  const count = await Acronym.countDocuments({ name: regex });
  const acronyms = await Acronym.find({ name: regex }).skip(skip).limit(limit);

  const hasMore = count > skip + limit;

  res.setHeader("X-Has-More", hasMore);
  res.json(acronyms);
};

module.exports = { createAcronym, updateAcronym, deleteAcronym, getAcronym };
