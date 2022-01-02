const ev = require('./ev.js'); // environment variables
const twitch = require('tmi.js'); // twitch tingz
const discord = require('discord.js');
const { TwitchMessage } = require('./TwitchMessage.js');
const { twitchCommands } = require('./TwitchCommand.js');
const { bexxteConfig } = require('./config.js');
const { twitchTimer } = require('./Timer.js');

const bexxteBot = {

  establishTwitchClient() {
    // ESTABLISH TWITCH CLIENT CONNECTION
    this.twitchClient = new twitch.Client({
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

    this.twitchClient.connect();

    this.twitchClient.on('message', async (channel, tags, message, self) => {
      const twitchMessage = new TwitchMessage(channel, tags, message, self);
      
      try {

        await this.processTwitchMessage(twitchMessage);

      } catch(error) {

        try {
          const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' });
          const datePlusError = `${currentDateAndTime} :: ${error}\n\n`;
          fs.appendFile('error.txt', datePlusError, appendError => {
            if (appendError) throw appendError;
          });

          const context = '\nencountered an error while reading a message\n';
          fs.appendFile('error.txt', context, appendError => {
            if (appendError) throw appendError;
          });
          fs.appendFile('error.txt', error.message + '\n', appendError => {
            if (appendError) throw appendError;
          });

        } catch (innerError) {
          
          console.log('\nan error occurred while trying to log an error :/\n');
          console.log(innerError);

        }
      }
      
    })
  },
  
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

  moderateTwitchMessage(twitchMessage) {
    if (twitchMessage.needsModeration()) {
      bexxteConfig.forbidden.forEach(word => { 
        if (twitchMessage.content.includes(word)) {
          twitchMessage.addResponse(
            `Naughty naughty, @${twitchMessage.tags.username}! We don't use that word here!`,
            true
          )
        }
      });
    }
  },

  async searchForTwitchCommand(twitchMessage) {

    const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

    if (lurkCheck.test(twitchMessage.content)) {
      twitchMessage.addResponse(
        `${twitchMessage.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`
      )
      return;
    }

    if (!twitchMessage.content.startsWith('!')) {
      return;
    }

    const messageWords = twitchMessage.content.split(' ');

    const command = messageWords[0].slice(1);

    if (twitchCommands[command]) {
      await twitchCommands[command].execute(twitchMessage);
    }

  },

  speakInTwitch(twitchMessage) {

    twitchMessage.response.forEach(responseLine => {

      if (responseLine.mean) {
        this.twitchClient.timeout(
          twitchMessage.channel,
          twitchMessage.username,
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
        this.twitchClient.say(
          twitchMessage.channel,
          responseLine.output
        );
      }

    })
    
    

  },

  async processTwitchMessage(twitchMessage) {
    this.moderateTwitchMessage(twitchMessage); 

    if (twitchMessage.response) {
      this.speakInTwitch(twitchMessage);
      return;
    }

    await this.searchForTwitchCommand(twitchMessage); 

    if (twitchMessage.response) {
      this.speakInTwitch(twitchMessage);
      return;
    }
  },

  async activateTwitchTimer() {
    let command = '';

    while (true) {
      
      command = await twitchTimer.getTimerOutput();

      if (!command) {
        continue;
      }

      const dummyMessage = new TwitchMessage(
        ev.CHANNEL_NAME,
        { mod: true, username: '' },
        `!${command}`,
        false
      );

      await this.processTwitchMessage(dummyMessage);

    }

  }

}

bexxteBot.establishTwitchClient();
bexxteBot.establishDiscordClient();
bexxteBot.activateTwitchTimer();