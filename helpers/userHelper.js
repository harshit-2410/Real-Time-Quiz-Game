const moment = require('moment-timezone');

const User = require('../models/userModel'); 
const {constants} = require('../constants/appConstants')

exports.checkTokenExpirationJob =  async () => {
  console.log('Checking for expired tokens...');

    const prevTime = new Date(Date.now() - constants.jwtexpiry * 1000);
    const formattedDate = moment(prevTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');

    try {
      const users = await User.find({
        isLoggedIn: true,
        inGame : false,
        lastLogin: { $lte: formattedDate }  
      });
  
      users.forEach(async (user) => {
        
        user.isLoggedIn = false;
        await user.save();
        console.log(`Logged out user ${user.username} due to expired session.`);
      });
    } catch (error) {
      console.error('Error checking sessions in database:', error);
    }

}
