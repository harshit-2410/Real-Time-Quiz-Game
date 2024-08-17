# Real-Time Quiz Game

This project is a backend implementation for a real-time quiz game where two players compete against each other by answering a series of questions. The game handles user authentication, real-time question delivery, answer validation, scoring, and state management.

## Tech Stack

- **Backend**: Node.js
- **Database**: MongoDB
- **Real-Time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Token)

## Features

1. **User Authentication**:

   - Endpoints for user registration and login.
   - Securely hash passwords before storing them in MongoDB.
   - JWT-based authentication for securing API endpoints.

2. **Game Session Setup**:

   - Endpoint to start a new game session and match two players.
   - Randomly match players who are logged in and not currently in a game.
   - Notify both players when the game session starts using Socket.IO (`game:init`).

3. **Question Management**:

   - Pre-store a set of questions in MongoDB.
   - Each question includes the question text, multiple choices, and the correct answer.

4. **Real-Time Question Delivery**:

   - Deliver questions to each player in real-time as soon as they are ready.
   - Use Socket.IO to send questions (`question:send`).

5. **Answer Submission and Scoring**:

   - Players submit their answers through Socket.IO (`answer:submit`).
   - Validate answers and track scores in real-time.

6. **Result Calculation**:
   - Calculate final scores after all questions are answered.
   - Determine the winner and send the result to both players (`game:end`).
   - Store the game session results in MongoDB.

## API Endpoints

- **`POST /register`**: Registers a new user.
- **`POST /login`**: Authenticates a user and returns a JWT token.
- **`POST /game/start`**: Starts a new game session and matches two players.
- **`POST /question/create`**: Add new questions.

## WebSocket Events

- **`game:init`**: Notifies players when a game session starts.
- **`question:send`**: Sends a question to the player.
- **`answer:submit`**: Handles the submission of answers.
- **`game:end`**: Sends the final result of the game to both players.

## Socket.IO Events

### Overview

The game relies heavily on Socket.IO for real-time communication between the server and the clients (players). Below is a description of the key events used in the application.

### Connection

- **Event**: `connect`
- **Description**: Triggered when a client connects to the Socket.IO server. The server then authenticates the user using the JWT token provided in the headers.

### Game Initialization

- **Event**: `game:init`
- **Description**: Notifies both players when the game session starts. This event includes details about the game session and the players involved.
- **Data Sent**:
  ```json
  {
    "gameId": "123456"
  }
  ```

### Question Delivery

- **Event**: `question:send`
- **Description**: Sends a question to each player in real-time. Questions are delivered in sequence, one at a time.

- **Headers**:

  ```bash
  Authorization: Bearer your_jwt_token
  ```

- **Data Sent**:

```json
{
  "gameId": "123456",
  "questionIndex": "0"
}
```

- **Data Recieved**:

  ```json
  {
    "questionText": "What is the capital of France?",
    "options": [{ "optionText": "Berlin" }, { "optionText": "Madrid" }, { "optionText": "Paris" }, { "optionText": "Rome" }]
  }
  ```

### Answer Submission

- **Event**: `answer:submit`
- **Description**: Handles the submission of answers from the players. The server checks the correctness of the answer, updates the score, and stores the result.

- **Headers**:

  ```bash
  Authorization: Bearer your_jwt_token
  ```

- **Data Sent**:

```json
{
  "gameId": "123456",
  "questionIndex": 0,
  "playerAnswer": "Paris"
}
```

- **Data Recieved**:

```json
{
  "nextQuestionIndex": "1"
}
```

### Game End

- **Event**: `game:end`
- **Description**: Sends the final result of the game to both players after all questions have been answered. This includes the final scores and the winner.
- **Data Recieved**:

```json
{
  "result": "john_doe won",
  "yourscore": "3",
  "opponentscore": "2"
}
```

### Disconnection

- **Event**: `disconnect`
- **Description**: Triggered when a player disconnects from the Socket.IO server. The server handles the disconnection and updates the game state accordingly.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Junkie24/Real-Time-Quiz-Game
   cd real-time-quiz-game
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following variables:

   ```bash
   PORT = your_port
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongo_db_uri
   ```

4. **Run the server:**

   ```bash
   npm start
   ```

## Usage

1. **Register a new user:**

   ```bash
   POST /register
   ```

   - Body:
     ```json
     {
       "username": "john_smith",
       "password": "johnPass123",
       "email": "john.smith@example.com",
       "mobile": "1234567890",
       "firstname": "John",
       "lastname": "Smith",
       "avatarUrl": "http://example.com/avatar1.jpg"
     }
     ```

2. **Login a user:**

   ```bash
   POST /login
   ```

   - Body:

     ```json
     {
       "username": "johndoe",
       "password": "securepassword"
     }
     ```

   - Response:
     ```json
     {
       "token": "your_jwt_token"
     }
     ```

3. **Insert Questions**

   ```bash
   POST /question/create
   ```

   Can add multiple questions at once.

   - Body:
     ```json
     [
       {
         "questionText": "Which country won the FIFA World Cup in 2018?",
         "options": [
           { "optionText": "Brazil", "isCorrect": false },
           { "optionText": "France", "isCorrect": true },
           { "optionText": "Germany", "isCorrect": false },
           { "optionText": "Argentina", "isCorrect": false }
         ]
       }
     ]
     ```

4. **Start a game session:**

   ```bash
   POST /game/start
   ```

   - Headers:
     ```bash
     Authorization: Bearer your_jwt_token
     ```


***Dummy Questions and users are present in the assets folder. Use the APIs to add users and questions.***