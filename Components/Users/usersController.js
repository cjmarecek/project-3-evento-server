const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./usersModel");
const { validateSignupData, validateLoginData } = require("./usersValidators");

// @desc File upload imports
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const Grid = require("gridfs-stream");
const GridFsStorage = require("multer-gridfs-storage");

const conn = mongoose.createConnection(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
});
mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);

//init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("profilePictures");
});

// Storage Engine
const storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "profilePictures",
        };
        resolve(fileInfo);
      });
    });
  },
});

exports.fileUpload = multer({ storage: storage });

exports.signup = async (req, res, next) => {
  const newUser = {
    email: req.body.email ? req.body.email.trim() : "",
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username ? req.body.username.trim() : "",
    isAdmin: false,
  };
  //check if all fields are filled and email is correct
  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);
  const noImg = "no-img.png";

  try {
    // check if email exists
    const doc = await User.find({ email: newUser.email });
    if (doc[0])
      return res
        .status(409)
        .json({ email: "This mail already belogs to somebody." });

    // check if username exists
    const doc1 = await User.find({ username: newUser.username });
    if (doc1[0])
      return res
        .status(409)
        .json({ username: "This username already belongs to somebody." });
    // creates hash from password
    const hash = bcrypt.hashSync(newUser.password, 10);
    const user = new User({
      email: newUser.email,
      password: hash,
      username: newUser.username,
      isAdmin: false,
      image: null,
    });
    // saves to the database, if successfull returns token
    const savedUser = await user.save();
    if (savedUser) {
      const token = jwt.sign(
        {
          email: savedUser.email,
          userId: savedUser._id,
          username: savedUser.username,
          isAdmin: false,
          image: savedUser.image,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "2h",
        }
      );
      res.status(201).json({
        message: "User created",
        token: token,
      });
    }
  } catch (error) {
    return res.status(500).json({
      general: "Something went wrong, please try again",
      error: error,
    });
  }
};

exports.login = async (req, res, next) => {
  const user = {
    email: req.body.email ? req.body.email.trim() : "",
    password: req.body.password,
  };
  // checks if the form is filled
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  try {
    // looks for user
    const userDoc = await User.find({ email: user.email });
    if (!userDoc[0])
      return res.status(401).json({
        general: "Wrong credentials, please try again",
      });
    // checks the password
    const match = await bcrypt.compare(user.password, userDoc[0].password);
    if (!match)
      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    else {
      // signs the token
      const token = jwt.sign(
        {
          email: userDoc[0].email,
          userId: userDoc[0]._id,
          username: userDoc[0].username,
          isAdmin: userDoc[0].isAdmin,
          image: userDoc[0].image,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "2h",
        }
      );
      return res.status(200).json({
        message: "Auth successful",
        token: token,
      });
    }
  } catch (error) {
    return res.status(500).json({
      general: "Something went wrong, please try again",
      error: error,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.userId });
    if (deletedUser.deletedCount === 1)
      res.status(201).json({ message: "User deleted." });
    if (deletedUser.deletedCount === 0)
      res.status(201).json({ message: "User already doesn't exist." });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

exports.imageUpdate = async (req, res, next) => {
  try {
    // delete image
    const user = await User.findById({ _id: req.user.userId });
    gfs.remove(
      { filename: user.image, root: "profilePictures" },
      (error, gridStore) => {
        if (error) {
          next(error);
        }
      }
    );

    await User.findByIdAndUpdate(
      { _id: req.user.userId },
      { image: req.file.filename }
    );
    res.json({ message: "Image upladed", image: req.file.filename });
  } catch (error) {
    next(error);
  }
};

exports.addUserDetails = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.params.userId },
      {
        bio: req.body.bio ? req.body.bio : "",
        website: req.body.website ? req.body.website : "",
        location: req.body.location ? req.body.location : "",
      }
    );
    res.json({ message: "User details uploaded successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select({
      _id: 0,
      password: 0,
      __v: 0,
      updatedAt: 0,
      createdAt: 0,
    });
    if (user) res.json({ user });
    else res.status(404).json({ message: "User not found." });
  } catch (error) {
    next(error);
  }
};
