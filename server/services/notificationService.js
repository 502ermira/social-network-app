const { getSocket } = require('../socket');

const sendNotification = (username, notification) => {
    const io = getSocket();
    io.to(username).emit('newNotification', notification);
  };  

module.exports = { sendNotification };