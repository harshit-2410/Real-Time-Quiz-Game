const express = require("express");
const { body } = require("express-validator");

const {register , login , logout} = require("../controllers/userController")
const {verifyUser} = require("../middleware/authMiddleware")

const router = express.Router();

router.post(
  "/register",
  body("username").isString().withMessage("Username not found."),
  body("password").isString().withMessage("Password not found."),
  body("firstname").isString().withMessage("firstname not found."),
  body("lastname").isString().withMessage("lastname not found."),
  body("email").isEmail().withMessage("email not correct"),
  body('mobile').optional().isMobilePhone().withMessage('Invalid mobile number'),
  body('avatarUrl').optional(),
  register
);

router.post(
  "/login",
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("password").isString().notEmpty().withMessage("Password is required"),
  login
);

router.post('/logout',verifyUser,logout)

module.exports = router;
