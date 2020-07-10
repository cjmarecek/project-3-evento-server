// @router /api/events/
// @desc Fetch, post, upload and delete events, get and delete file
const express = require("express");
const events = express.Router();
const eventsController = require("./eventsController");

const fileUpload = eventsController.fileUpload.single("image");

events.get("/", eventsController.getAllEvents); // Returns all events
events.get("/uploads", eventsController.getAllFiles); // Display all files in JSON
events.get("/uploads/:filename", eventsController.displayImage); // Displays Image
events.post("/", fileUpload, eventsController.postOneEvent); // Saves event to DB
events.get("/:eventId", eventsController.getOneEvent); // Fetches one event
events.put("/:eventId", fileUpload, eventsController.updateEvent); // Updates event with or without image
events.delete("/uploads/:filename", eventsController.deleteFile); // Deletes file
events.delete("/:eventId", eventsController.deleteEvent); // Deletes event as well as it's image

module.exports = events;