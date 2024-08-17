const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/userModel");
const { ApiResponseCodes } = require("../helpers/responseHelper");
const {constants} = require("../constants/appConstants")

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(ApiResponseCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  const { username, password, email, firstname, lastname, avatarUrl, mobile } = req.body;

  try {
    const newUser = new User({
      firstName: firstname,
      lastName: lastname,
      avatarUrl: avatarUrl,
      username: username,
      password: password,
      email: email,
      mobile: mobile,
      isLoggedIn : true,
      lastLogin : new Date()
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: constants.jwtexpiry });

    res.status(ApiResponseCodes.CREATED).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(ApiResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "User registration failed", error });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(ApiResponseCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(ApiResponseCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: constants.jwtexpiry });

     user.lastLogin = new Date(); 
     user.isLoggedIn = true;
     await user.save();
    res.status(ApiResponseCodes.OK).json({ message: "Login successful", token });
  } catch (error) {
    res.status(ApiResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Login failed", error });
  }
};

exports.logout = async (req, res) => {
  try {
    // After calling this API, the client should remove the JWT from wherever it's stored (local storage, cookies, etc.) to effectively "log out" the user.

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(ApiResponseCodes.NOT_FOUND).json({ message: "User not found" });
    }

    // Set user as logged out
    user.isLoggedIn = false;
    await user.save();

    res.status(ApiResponseCodes.OK).json({ message: "Logout successful" });
  } catch (error) {
    res.status(ApiResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Logout failed", error });
  }
};
