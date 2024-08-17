const { ApiResponseCodes } = require("../helpers/responseHelper");
const {constants} = require("../constants/appConstants")
const User = require("../models/userModel");
const Game = require("../models/gameModel");
const Question = require("../models/questionModel");
const {socketIdMap , emitData , Socket_Events} =  require("../config/socket")

const findAvailablePlayer = async (currentPlayerId) => {
  try {
    const availablePlayers = await User.aggregate([{ $match: { inGame: false, isLoggedIn: true , _id: { $nin: currentPlayerId } } }, { $sample: { size: 1 } }]);

    return availablePlayers.length > 0 ? availablePlayers[0] : null;
  } catch (error) {
    console.error("Error finding available player:", error);
    return null;
  }
};

exports.startGame = async (req, res) => {
  const player1Id = req.user._id;

  try {
    const player2 = await findAvailablePlayer([player1Id]);
    if (!player2) {
      return res.status(ApiResponseCodes.ACCEPTED).json({ message: "No available players. Please try again later." });
    }

    const questions = await Question.aggregate([{ $sample: { size: constants.totalQuestionsInGame } }]);

    await User.updateMany({ _id: { $in: [player1Id, player2._id] } }, { $set: { inGame: true } });

    const game = await Game.create({
      player1: player1Id,
      player2: player2._id,
      questions: questions.map((q) => q._id),
    });

    // Notify both players about the game initiation via Socket.IO
    emitData({ gameId: game._id }, Socket_Events.Game_Initalize, [socketIdMap.get(player1Id.toString()),socketIdMap.get(player2._id.toString())]);

    res.status(ApiResponseCodes.CREATED).json({ message: "Game creation successful", gameId: game._id });
  } catch (error) {
    console.log(error)
    res.status(ApiResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Game creation failed", error });
  }
};
