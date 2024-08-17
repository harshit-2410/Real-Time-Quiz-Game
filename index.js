const express = require("express")
const http = require("http")
const dotenv = require("dotenv")

const connectDB = require("./config/mongodb")
const {initSocketServer} = require("./config/socket")
const {startRoutes} = require("./routes/index")
const {checkTokenExpirationJob} = require('./helpers/userHelper')

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    const io = await initSocketServer(server);

    app.use((req, res, next) => {
        req.io = io;
        next();
      });

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      startRoutes(app);

    //   setInterval(async function()
    //   {
    //     checkTokenExpirationJob()
    //   },3000)
    });
  } catch (error) {
    console.error("Error during server startup:", error.message);
    process.exit(1);
  }
};

startServer();
