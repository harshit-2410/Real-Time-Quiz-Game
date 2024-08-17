const express = require('express')

const apiRoutes = express.Router()

apiRoutes.use('/user',require("../routes/userRoutes"))
apiRoutes.use('/question',require("../routes/questionRoutes"))
apiRoutes.use('/game',require("../routes/gameRoutes"))

function startRoutes(app) 
{
    app.use('/api',apiRoutes);

}

module.exports = { startRoutes }