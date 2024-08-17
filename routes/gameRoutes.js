const express = require('express');

const {startGame} = require('../controllers/gameController');
const {verifyUser} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/start', verifyUser, startGame);

// // Route to end a game session
// router.post('/end', authenticate, endGame);

module.exports = router;
