import twitch from 'tmi.js';
import { logError } from './utils.js';
import path from 'path';

import TwitchMessage from './TwitchMessage.js';
import Streamer from './Streamer.js';

export default class Bot {
  constructor(name, channels, token) {
    this.name = name;
    this.channels = channels;
    this.token = token;

    this.streamers = {};

    this.channels.forEach(async channel => {
      const { commands } = await import(`./streamers/${channel}/commands.js`);
      const { timers } = await import(`./streamers/${channel}/timers.js`);
      const { config } = await import(`./streamers/${channel}/configuration.js`);
      this.streamers[channel] = new Streamer(channel, commands, timers, config, this);
    });
  }

  // estabishes a client that can read and send messages from/to Twitch
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

      try {

        // there are no errors expected here, so if something does happen it gets logged in error.txt and we keep the program running (otherwise bexxteBot stops :/ )

        await this.processTwitchMessage(twitchMessage);

      } catch (error) {

        logError(error);

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

  // assesses a twitch message to see if it has a command structure ("!lurk" anywhere in a message, or any message beginning with "!")
  async searchForTwitchCommand(twitchMessage) {

    // lurk is built different; can be used anywhere in a message, not just the beginning
    const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

    if (lurkCheck.test(twitchMessage.content)) {
      return 'lurk';
    }

    // besides !lurk, all commands must be at the beginning of the message
    if (!twitchMessage.content.startsWith('!')) {
      return;
    }

    const messageWords = twitchMessage.content.split(' ');

    // get first word and remove the "!"
    const command = messageWords[0].slice(1);

    return command;

  }

  async executeTwitchCommand(twitchMessage, command) {
    // check if command exists for streamer
    if (this.streamers[twitchMessage.channel.slice(1)].commands[command]) {
      // call the command's execute() method
      await this.streamers[twitchMessage.channel.slice(1)].commands[command].execute(twitchMessage);
    }
  }

  // speaks TwitchResponse objects from the twitchMessage's .response property
  speakInTwitch(twitchMessage) {

    twitchMessage.response.forEach(responseLine => {

      if (responseLine.mean) {
        this.twitchClient.timeout(
          twitchMessage.channel,
          twitchMessage.tags.username,
          20,
          'used forbidden term'
        );
        // she mad
        this.twitchClient.color(
          twitchMessage.channel,
          'red'
        );
        this.twitchClient.say(
          twitchMessage.channel,
          responseLine.output
        );
        // cool it
        this.twitchClient.color(
          twitchMessage.channel,
          'hotpink'
        );

      } else {
        this.twitchClient.say(
          twitchMessage.channel,
          responseLine.output,
        );
      }

    })

  }

  // passes twitch messages through moderation and then looks for a command. sends a response message in twitch if one is created
  async processTwitchMessage(twitchMessage) {
    this.moderateTwitchMessage(twitchMessage);

    if (twitchMessage.response) {
      this.speakInTwitch(twitchMessage);
      // if a message gets modded, any commands will be ignored
      return;
    }

    const command = await this.searchForTwitchCommand(twitchMessage);

    await this.executeTwitchCommand(twitchMessage, command);

    // only speak if she has something to say
    if (twitchMessage.response) {
      try {
        this.speakInTwitch(twitchMessage);
      } catch (e) {
        logError(e);
      }
      return;
    }
  }

  startTimers() {
    //console.log(this.streamers);
    for (const streamer in this.streamers) {
      this.streamers[streamer].timers.forEach(timer => {
        timer.start();
      })
    }
  }

  // top level command -- this is called directly in bexxtebot.js
  run() {
    try {
      this.establishTwitchClient();
      //this.establishDiscordClient();
      this.startTimers();
    } catch(e) {
      logError(e);
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