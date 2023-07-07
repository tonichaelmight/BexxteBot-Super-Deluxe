// Home of the BexxteBot object herself
// handles establishing client connections, moderating, sending messages, activating timers
// at the bottom of this page is what makes it all go

// REQUIRES
import { BOT_NAME, BROADCASTING_CHANNELS, BEXXTEBOT_TOKEN } from './ev.js'; // environment variables
import { logError } from './utils.js';
import path from 'path';

//const discord = require('discord.js');
import Bot from './Bot.js';

// THE QUEEN AND LEGEND HERSELF
const bexxteBot = new Bot(BOT_NAME, BROADCASTING_CHANNELS, BEXXTEBOT_TOKEN);

try {
  bexxteBot.run();
} catch (e) {
  logError(e);
}