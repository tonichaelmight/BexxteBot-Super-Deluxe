// Home of the BexxteBot object herself
// handles establishing client connections, moderating, sending messages, activating timers
// at the bottom of this page is what makes it all go

// REQUIRES
const ev = require('./ev.js'); // environment variables
const { logError } = require('./utils.js');
const fileName = require('path').basename(__filename);

//const discord = require('discord.js');
const { Bot } = require('./Bot.js');

// THE QUEEN AND LEGEND HERSELF
const bexxteBot = new Bot(ev.BOT_NAME, ev.BROADCASTING_CHANNELS, ev.BEXXTEBOT_TOKEN);

try {
  bexxteBot.run();
} catch(e){
  logError(e, fileName);
}