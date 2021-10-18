// REQUIRES
const ev = require('./ev.js'); // environment variables
const twitch = require('tmi.js'); // twitch tingz
const discord = require('discord.js');

const { parseMessage } = require('./parse.js')
// const cooldowns = require('./cooldowns.js'); // connects to cooldowns db
// const { configure } = require('./setup.js'); // connects to setup file
// const config = require('./config.js'); // links to configuration file
// const hangman = require('./hangman/hangman.js');
// const fs = require('fs');
// const https = require('https');

// const allLetters = new RegExp('[a-zA-Z]');
// const caps = new RegExp('[A-Z]');
// const lowers = new RegExp('[a-z]');

const speak = (response) => {
  // console.log(response);
  switch (response.modifier) {
    case 't':
      twitchClient.say(response.channel, response.output);
      break;
    case 'd':
      break;
    default:
      break;
  }
};


// ESTABLISH TWITCH CLIENT CONNECTION
const twitchClient = new twitch.Client({
  options: {
    debug: true
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: ev.BOT_NAME,
    password: ev.TWITCH_OAUTH_TOKEN
  },
  channels: [ev.CHANNEL_NAME]
});

twitchClient.connect();

twitchClient.on('message', (channel, tags, message, self) => {

  if (self || tags.username.match(/bexxtebot/i)) {
    return;
  }

  const messageResponse = parseMessage('t', {
      channel: channel, 
      tags: tags, 
      content: message, 
      self: self
    });

  if (messageResponse) {
    speak(messageResponse);
  }

  return;
  
});


// ESTABLISH DISCORD CLIENT CONNECTION
const discordClient = new discord.Client();

discordClient.once('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on('message', message => {
  // console.log(message);
  if (message.content === '!ping') {
    message.channel.send('pong!');
  }
});

discordClient.login(ev.DISCORD_TOKEN);
