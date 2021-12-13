const ev = require('./ev.js'); // environment variables
const twitch = require('tmi.js'); // twitch tingz
const { TwitchMessage } = require('./TwitchMessage.js');
const { twitchCommands } = require('./TwitchCommand.js');
const { bexxteConfig } = require('./config.js');
const { twitchTimer } = require('./Timer.js');

const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

bexxteBot = {

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
      const messageObject = new TwitchMessage(channel, tags, message, self);
      
      try {

        await this.processTwitchMessage(messageObject);

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

  moderate(messageObject) {
    if (messageObject.needsModeration()) {
      bexxteConfig.forbidden.forEach(word => { 
        if (messageObject.content.includes(word)) {
          messageObject.addResponse(
            `Naughty naughty, @${messageObject.tags.username}! We don't use that word here!`,
            true
          )
        }
      });
    }
  },

  async searchForTwitchCommand(messageObject) {

    if (lurkCheck.test(messageObject.content)) {
      messageObject.addResponse(
        `${messageObject.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`
      )
      return;
    }

    if (!messageObject.content.startsWith('!')) {
      return;
    }

    const messageWords = messageObject.content.split(' ');

    const command = messageWords[0].slice(1);

    if (twitchCommands[command]) {
      await twitchCommands[command].execute(messageObject);
    }

  },

  speakInTwitch(messageObject) {

    messageObject.response.forEach(responseLine => {

      if (responseLine.mean) {
        this.twitchClient.timeout(
          messageObject.channel,
          messageObject.username,
          20,
          'used forbidden term'
        );
        this.twitchClient.color(
          messageObject.channel,
          'red'
        );
        this.twitchClient.say(
          messageObject.channel,
          responseLine.output
        );
        this.twitchClient.color(
          messageObject.channel,
          'hotpink'
        );
      } else {
        this.twitchClient.say(
          messageObject.channel,
          responseLine.output
        );
      }

    })
    
    

  },

  async processTwitchMessage(messageObject) {
    this.moderate(messageObject); 

    if (messageObject.response) {
      this.speakInTwitch(messageObject);
      return;
    }

    await this.searchForTwitchCommand(messageObject); 

    if (messageObject.response) {
      this.speakInTwitch(messageObject);
      return;
    }
  },

  async activateTwitchTimer() {
    let command = '';

    while (true) {
      
      command = await twitchTimer.getTimerOutput();

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
bexxteBot.activateTwitchTimer();