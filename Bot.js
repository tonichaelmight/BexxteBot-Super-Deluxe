const twitch = require('tmi.js'); // twitch tingz
const { logError } = require('./utils.js');
const fileName = require('path').basename(__filename);

const { TwitchMessage } = require('./TwitchMessage.js');
const { twitchCommands } = require('./TwitchCommand.js');
const { twitchTimer, dwarvenVowTimer } = require('./Timer.js');
const { Streamer } = require('./Streamer.js');

class Bot {
  constructor(name, channels, token) {
    this.name = name;
    this.channels = channels;
    this.token = token;

    this.streamers = {};

    this.channels.forEach(channel => {
      const { commands } = require(`./streamers/${channel}/commands.js`);
      const { timers } = require(`./streamers/${channel}/timers.js`);
      const { config } = require(`./streamers/${channel}/configuration.js`);
      this.streamers[channel] = new Streamer(channel, commands, timers, config, this);
    });
  }

  // estabishes a client that can send and receive messages from Twitch
  establishTwitchClient() {
    this.twitchClient = new twitch.Client({
      options: {
        debug: true
      },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: this.name,
        password: this.token
      },
      channels: this.channels
    });

    this.twitchClient.connect();

    // listens for messages, determined by the "channels" property defined in the connection above
    this.twitchClient.on('message', async (channel, tags, message, self) => {
      const twitchMessage = new TwitchMessage(channel, tags, message, self);

      //console.log(twitchMessage); 
      
      try {

        await this.processTwitchMessage(twitchMessage);

      // there are no errors expected here, so if something does happen it gets logged in error.txt and we keep the program running (otherwise bexxteBot stops :/ )
      } catch(error) {
        
        logError(error, fileName);
        
      }
      
    })
  }

  // moderates twitch messages
  moderateTwitchMessage(twitchMessage) {
    if (twitchMessage.needsModeration()) {
      this.streamers[twitchMessage.channel.slice(1)].config.forbidden.forEach(word => { 
        if (twitchMessage.content.includes(word)) {
          twitchMessage.addResponse(
            `Naughty naughty, @${twitchMessage.tags.username}! We don't use that word here!`,
            true
          )
        }
      });
    }
  }

  async searchForTwitchCommand(twitchMessage) {

    // lurk is built different; can be used anywhere in a message, not just the beginning
    const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

    if (lurkCheck.test(twitchMessage.content)) {
      return 'lurk';
    }

    // console.log(twitchMessage);
    if (!twitchMessage.content.startsWith('!')) {
      return;
    }

    const messageWords = twitchMessage.content.split(' ');

    const command = messageWords[0].slice(1);

    return command;    

  }

  async executeTwitchCommand(twitchMessage, command) {
    //console.log(this.streamers[twitchMessage.channel.slice(1)])
    if (this.streamers[twitchMessage.channel.slice(1)].commands[command]) {
      await this.streamers[twitchMessage.channel.slice(1)].commands[command].execute(twitchMessage);
    }
  }

  speakInTwitch(twitchMessage) {

    twitchMessage.response.forEach(responseLine => {

      if (responseLine.mean) {
        this.twitchClient.timeout(
          twitchMessage.channel,
          twitchMessage.tags.username,
          20,
          'used forbidden term'
        );
        this.twitchClient.color(
          twitchMessage.channel,
          'red'
        );
        this.twitchClient.say(
          twitchMessage.channel,
          responseLine.output
        );
        this.twitchClient.color(
          twitchMessage.channel,
          'hotpink'
        );
        
      } else {
        //console.log('hi');
        this.twitchClient.say(
          twitchMessage.channel,
          responseLine.output,
        );
      }

    })

  }

  // passes twitch messages through moderation and then looks for a command. sends a message through twitch if one is created
  async processTwitchMessage(twitchMessage) {
    this.moderateTwitchMessage(twitchMessage); 

    if (twitchMessage.response) {
      this.speakInTwitch(twitchMessage);
      // if a message gets modded, no need to keep going
      return;
    }

    const command = await this.searchForTwitchCommand(twitchMessage);

    await this.executeTwitchCommand(twitchMessage, command);

    //console.log(twitchMessage);

    if (twitchMessage.response) {
      try {
        this.speakInTwitch(twitchMessage);
      } catch(e) {
        logError('Probably attempted to say an undefined message', fileName);
        logError(e, fileName);
      }
      return;
    }
  }

  startTimers() {
    this.streamers.forEach(streamer => {
      streamer.timers.forEach(timer => {
        timer.start();
      })
    })
  }

  // sets up the twitch command timer
  async activateTwitchTimer() {
    let command = '';

    while (true) {
      
      command = await twitchTimer.getTimerOutput();

      if (!command) {
        continue;
      }

      // passes a dummy message through the system to get bexxteBot to respond to it.
      const dummyMessage = TwitchMessage.generateDummyMessage(`!${command}`);

      await this.processTwitchMessage(dummyMessage);

    }

  }

  async activateDwarvenVowTimer() {

    while (true) {

      const vow = await dwarvenVowTimer.getTimerOutput();

      if (!vow) continue;

      const dummyMessage = TwitchMessage.generateDummyMessage();

      dummyMessage.addResponse(vow);

      this.speakInTwitch(dummyMessage);
      
    }
    
  }

  // estabishes a client that can send and receive messages from Discord
  // this is still very much WIP
  /*
  establishDiscordClient() {
    this.discordClient = new discord.Client();

    this.discordClient.once('ready', () => {
      console.log(`Logged in as ${this.discordClient.user.tag}!`);
    });

    this.discordClient.on('message', async message => {
      // console.log(message);
      if (message.content === '!ping') {
        message.channel.send('pong!');
      }

      console.log(message);
      console.log(message.channel);
      console.log(await message.author.fetchFlags().bitfield);
    });

    this.discordClient.login(ev.DISCORD_TOKEN);
  },
  */

}

module.exports = { Bot };