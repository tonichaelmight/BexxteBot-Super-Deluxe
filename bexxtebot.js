// Home of the BexxteBot object herself
// handles establishing client connections, moderating, sending messages, activating timers
// at the bottom of this page is what makes it all go

// REQUIRES
const ev = require('./ev.js'); // environment variables

//const discord = require('discord.js');
const { Bot } = require('./Bot.js');

// THE QUEEN AND LEGEND HERSELF
const bexxteBot = new Bot(ev.BOT_NAME, ev.BROADCASTING_CHANNELS, ev.TWITCH_OAUTH_TOKEN);

bexxteBot.establishTwitchClient();
//bexxteBot.establishDiscordClient();
bexxteBot.activateTwitchTimer();
bexxteBot.activateDwarvenVowTimer();