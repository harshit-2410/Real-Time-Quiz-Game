const io = require("socket.io");
const jwt = require("jsonwebtoken");

const { constants } = require("../constants/appConstants");
const Game = require("../models/gameModel");
const User = require("../models/userModel");

let socket_initialized = false;
let socket_server;
let socketIdMap = new Map();

const initSocketServer = async (server) => {
  try {
    if (socket_initialized) {
      throw new Error("Socket Server Already Initialized");
    }

    socket_server = io(server, {
      cors: {
        credentials: true,
        methods: ["GET", "POST"],
        origin: "*",
      },
      allowEIO3: true,
      transports: ["polling", "websocket"],
    });

    socket_initialized = true;

    socket_server.on("connection", (socket) => {
      console.log(`Client connected with socket id: ${socket.id}`);

      onConnectAuthHandler(socket);

      socket.on(Socket_Events.Question_Send, async ({ gameId, questionIndex }) => {
        try {
          const game = await Game.findById(gameId).populate({
            path: "questions",
            select: "questionText options.optionText",
          });

          if (!game) {
            emitData("Game not found", Socket_Events.Question_Send, [socketIdMap.get(socket.userId.toString())]);
          }
          if (game.completed) {
            emitData("Game ended", Socket_Events.Question_Send, [socketIdMap.get(socket.userId.toString())]);
          }
          const question = game.questions[questionIndex];
          if (!question) {
            emitData("Question not found", Socket_Events.Question_Send, [socketIdMap.get(socket.userId.toString())]);
          }

          emitData(question, Socket_Events.Question_Send, [socketIdMap.get(socket.userId.toString())]);
        } catch (err) {
          emitData({ message: "Error fetching question", error: err }, Socket_Events.Question_Send, [socketIdMap.get(socket.userId.toString())]);
        }
      });

      socket.on(Socket_Events.Answer_Submit, async ({ gameId, questionIndex, playerAnswer }) => {
        try {
          const game = await Game.findById(gameId).populate("questions").populate({
            path: "player1",
            select: "_id username",
          }).populate({
            path: "player2",
            select: "_id username",
          });

          if (!game) {
            emitData("Game not found", Socket_Events.Answer_Submit, [socket.userId.toString()]);
          }

          if (game.completed) {
            emitData("Game already ended.", Socket_Events.Answer_Submit, [socket.userId.toString()]);
          }

          const question = game.questions[questionIndex];
          if (!question) {
            emitData("Question not found", Socket_Events.Answer_Submit, [socket.userId.toString()]);
          }

          const isPlayer1 = game.player1._id.toString() === socket.userId.toString();
          const playerAnswersKey = isPlayer1 ? "player1Answers" : "player2Answers";

          const isCorrect = question.options.some((option) => option.optionText === playerAnswer && option.isCorrect);

          game[playerAnswersKey].push({ questionId: question._id, isCorrect });

          if (game.player1Answers.length === constants.totalQuestionsInGame && game.player2Answers.length === constants.totalQuestionsInGame) {
            game.completed = true;
            const player1Score = game.player1Answers.filter((ans) => ans.isCorrect).length;
            const player2Score = game.player2Answers.filter((ans) => ans.isCorrect).length;

            game.winner = null;
            let result = "Draw";

            if (player1Score > player2Score) {
              game.winner = game.player1._id;
              result = `${game.player1.username} won`;
            } else if (player1Score < player2Score) {
              game.winner = game.player2._id;
              result = `${game.player2.username} won`;
            }

            await game.save();
            await User.updateMany({ _id: { $in: [game.player1._id, game.player2._id] } }, { $set: { inGame: false } });

            emitData({ result: result, yourscore: player1Score, opponentscore: player2Score }, Socket_Events.Game_End, [
              socketIdMap.get(game.player1._id.toString()),
            ]);
            emitData({ result: result, yourscore: player2Score, opponentscore: player1Score }, Socket_Events.Game_End, [
              socketIdMap.get(game.player2._id.toString()),
            ]);
          } else {
            await game.save();

            let message = "Answer submitted";
            let nextQuestionIndex = questionIndex + 1;

            if (isPlayer1 && game.player1Answers.length === constants.totalQuestionsInGame) {
              message = "Waiting for opponent to finish the game.";
              nextQuestionIndex = null;
            } else if (!isPlayer1 && game.player2Answers.length === constants.totalQuestionsInGame) {
              message = "Waiting for opponent to finish the game.";
              nextQuestionIndex = null;
            }

            emitData({ message: message, nextQuestionIndex }, Socket_Events.Answer_Submit, [socketIdMap.get(socket.userId.toString())]);
          }
        } catch (err) {
          emitData({ message: "Error processing answer", error: err }, Socket_Events.Answer_Submit, [socket.userId.toString()]);
        }
      });

      // Event handler for disconnection
      socket.on("disconnect", () => {
        console.log(`Client disconnected with socket id: ${socket.id}`);
        onDisconnectHandler(socket.id);
      });
    });

    return socket_server;
  } catch (error) {
    console.error("Error initializing Socket.IO server:", error.message);
  }
};

const onConnectAuthHandler = (socket) => {
  try {
    const token = socket.handshake.headers["authorization"]?.split(" ")[1];
    if (!token) {
      throw new Error("Authentication error: No token provided");
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error("Authentication error: Invalid token");
      }
      socket.userId = decoded.id;
      socketIdMap.set(decoded.id.toString(), socket.id);
    });
  } catch (err) {
    console.error("Error", err.message);
    socket.emit("error", err.message);
    socket.disconnect();
  }
};

// Disconnection handler
const onDisconnectHandler = (socketId) => {
  console.log(`Handling disconnection for socket id: ${socketId}`);
};

function emitData(data, eventName, socketIds) {
  try {
    if (!socket_initialized || !socket_server) {
      throw new Error("Socket server is not initialized");
    }

    if (socketIds && socketIds.length > 0) {
      for (const id of socketIds) {
        socket_server.to(id).emit(eventName, data);
      }
    } else {
      console.log(`sending data for ${eventName}:`);

      socket_server.emit(eventName, data);
    }
    return;
  } catch (error) {
    throw new Error(error);
  }
}

const Socket_Events = {
  Game_Initalize: "game:init",
  Question_Send: "question:send",
  Answer_Submit: "answer:submit",
  Game_End: "game:end",
};

module.exports = { initSocketServer, socketIdMap, emitData, Socket_Events };
