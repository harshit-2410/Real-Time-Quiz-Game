const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  player1Answers: [{ questionId: String, isCorrect: Boolean }],
  player2Answers: [{ questionId: String, isCorrect: Boolean }],
  completed: { type: Boolean, default: false },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

module.exports = mongoose.model('Game', gameSchema);
