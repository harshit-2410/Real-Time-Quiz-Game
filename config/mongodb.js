const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
};

// Event listeners for monitoring MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open to ' + process.env.MONGO_URI)
})

mongoose.connection.on('error', err => {
  console.error('Mongoose default connection error:', err)
  process.exit(1)
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected')
});

process.on('SIGINT', async () => {
    try {
      await mongoose.disconnect()
      console.log('Mongoose default connection disconnected through app termination')
      process.exit(0)
    } catch (error) {
      console.error('Error during Mongoose disconnection:', error.message)
      process.exit(1)
    }
  });

module.exports = connectDB
