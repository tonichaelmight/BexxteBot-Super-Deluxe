const ev = require('./ev.js'); // environment variables
const twitch = require('tmi.js'); // twitch tingz
const { TwitchMessage } = require('./TwitchMessage.js');
const { twitchCommands } = require('./TwitchCommand.js');
const { bexxteConfig } = require('./config.js');

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
      
      await this.processTwitchMessage(messageObject);
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
    
    if (messageObject.response.mean) {
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
        messageObject.response.output
      );
      this.twitchClient.color(
        messageObject.channel,
        'hotpink'
      );
    } else {
      this.twitchClient.say(
        messageObject.channel,
        messageObject.response.output
      );
    }

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
  }

}

bexxteBot.establishTwitchClient();