"use strict";
const express = require("express");
const morgan = require("morgan");
const {
  createAcronym,
  updateAcronym,
  deleteAcronym,
  getAcronym,
} = require("./handlers");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use(express.static("public"))

  .get("/", (req, res) => {
    res
      .status(200)
      .json({ status: 200, message: "Hello there your server works" });
  })
  .get("/acronym", getAcronym)
  .post("/acronym", createAcronym)
  .patch("/acronym/:acronymID", updateAcronym)
  .delete("/acronym/:acronymID", deleteAcronym)
  .get("*", (req, res) => {
    res.status(404).json({ status: 404, message: "404 Not found!" });
  })
  .listen(8000, () => console.log("Listening on Port 8000"));
