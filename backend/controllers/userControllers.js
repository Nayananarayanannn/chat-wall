const bcrypt = require("bcryptjs/dist/bcrypt");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../Models/userModel");

// register new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  //   validation
  if (!name || !email || !password) {
    res.status(404);
    throw new error("Please enter all the Fields");
  }

  // find particular user from db
  const userExists = await User.findOne({ email: email });

  //   validating if user already registered
  if (userExists) {
    res.status(404);
    throw new error("User already exists");
  }

  // encrypt password
  const newPassword = await bcrypt.hash(req.body.password, 10);

  //   Create new user
  const user = await User.create({
    name,
    email,
    password: newPassword,
    pic,
  });

  // on succesful creation of new user document send data
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), //generate token for new user
    });
  }
  // failed to create document send error message
  else {
    res.status(404);
    throw new error("Failed to Create the User");
  }
});

// login authentication
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;//get data from form

  // find user from DB by email
  const user = await User.findOne({ email });

  // compare encrypted passwords
  const isPasswordvalid = await bcrypt.compare(password, user.password);

  // on successful login send data
  if (user && isPasswordvalid) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), //generate token for existing user
    });
  } 
  
  // failed to login, send error message
  else {
    res.status(404);
    throw new error("Invalid Email or Password");
  }
});

const allUsers = asyncHandler(async(req,res)=>{
  const keyword = req.query.search ? {
    $or:[
      { name: { $regex: req.query.search, $options:"i" }},
      { email: { $regex:req.query.search, $options:"i" }}
    ],
  } : {};

  const users = await User.find(keyword).find({_id: { $ne: req.user._id }});
  res.send(users);

})
module.exports = { registerUser, authUser, allUsers };
