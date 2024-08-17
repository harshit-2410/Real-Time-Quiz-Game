const express = require('express');
const { body } = require('express-validator');

const {addQuestions} = require('../controllers/questionController')
const router = express.Router();

router.post(
  "/create",
  [
    body("questions").isArray({ min: 1 }).withMessage("Questions array is required"),
    body("questions.*.questionText").isString().notEmpty().withMessage("Question text is required"),
    body("questions.*.options")
      .isArray({ min: 2 })
      .withMessage("Options must be an array with at least 2 items"),
    body("questions.*.options.*.optionText")
      .isString()
      .notEmpty()
      .withMessage("Option text is required"),
    body("questions.*.options.*.isCorrect")
      .isBoolean()
      .withMessage("isCorrect must be a boolean value"),
  ],
  addQuestions
);

module.exports = router;
