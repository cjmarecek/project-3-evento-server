// @router /api/user/
// @desc signup ,login, delete, update, upload profile image, get
//  details of user
const express = require("express");
const users = express.Router();

const usersController = require("./usersController");
const fileUpload = usersController.fileUpload.single("image");
const { checkAuth } = require("../../middlewares");

users.post("/signup", usersController.signup); // creates user
users.post("/login", usersController.login); // login user
users.delete("/:userId", checkAuth, usersController.deleteUser); // delete user
users.put("/image", checkAuth, fileUpload, usersController.imageUpdate ); // changes profile picture
users.post("/:userId", checkAuth, usersController.addUserDetails); // add user details
users.get("/:username", usersController.getUserDetails) // get public user details

module.exports = users;