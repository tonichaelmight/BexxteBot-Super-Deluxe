const ev = require('./ev.js'); // environment variables
const twitch = require('tmi.js'); // twitch tingz
const { TwitchMessage } = require('./TwitchMessage.js');
const { TwitchResponse } = require('./TwitchResponse.js');
const { bexxteConfig } = require('./config.js');

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

    this.twitchClient.on('message', (channel, tags, message, self) => {
      const messageObject = new TwitchMessage(channel, tags, message, self);
      
      this.processTwitchMessage(messageObject);
    })
  },

  moderate(messageObject) {
    if (messageObject.needsModeration()) {
      bexxteConfig.forbidden.forEach(word => { 
        if (messageObject.content.includes(word)) {
          messageObject.addResponse(
            new TwitchResponse(
              `Naughty naughty, @${messageObject.tags.username}! We don't use that word here!`,
              true
          ));
        }
      });
    }
  },

  searchForTwitchCommand(){

  },

  speakInTwitch(messageObject) {
    
    if (response.mean) {
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
    }

  },

  processTwitchMessage(messageObject) {
    this.moderate(messageObject); 

    if (messageObject.response) {
      this.speakInTwitch(messageObject);
      return;
    }

    this.searchForTwitchCommand(); 
  }

}

bexxteBot.establishTwitchClient();