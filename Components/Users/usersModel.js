const mongoose = require("mongoose");

const requiredString = { type: String, required: true }

const userSchema = mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  password: requiredString,
  username: { type: String, required: true, unique: true},
  isAdmin: { type: Boolean, required: true },
  image: { type: String, required: false},
  bio: {type: String},
  website: {type: String},
  location: {type: String}
});

module.exports = mongoose.model("User", userSchema);
