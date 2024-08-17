const { validationResult } = require("express-validator");

const Question = require("../models/questionModel");
const {ApiResponseCodes} = require('../helpers/responseHelper')

exports.addQuestions = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(ApiResponseCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
  
    const { questions } = req.body;
  
    try {
      const createdQuestions = await Question.insertMany(questions);
      res.status(ApiResponseCodes.CREATED).json({
        message: "Questions created successfully",
        questions: createdQuestions,
      });
    } catch (error) {
      res.status(ApiResponseCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to create questions",
        error: error.message,
      });
    }
  };
  