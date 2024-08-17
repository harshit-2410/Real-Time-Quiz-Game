const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ optionText: String, isCorrect: Boolean }],
});

module.exports = mongoose.model('Question', questionSchema);
