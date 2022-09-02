const ev = require('./ev.js');
const https = require('https');
const { logError } = require('./utils.js');
const fileName = require('path').basename(__filename);

class Streamer {

  constructor(username, commands, timers, config, bot) {
    this.username = username.startsWith('#') ? username.slice(1) : username;
    this.commands = commands;
    this.linkCommandsToStreamer(this.commands);
    this.addCommandAliases(this.commands);
    this.timers = timers;
    this.timers.forEach(timer => {
      timer.streamer = this;
    });
    //console.log(commands);
    this.config = config;
    this.bot = bot;
  }

  // for commands that require a direct link to the Streamer object they fall under
  linkCommandsToStreamer(commands) {
    for (const command in commands) {
      if (commands[command].streamerLink) {
        commands[command].streamerLink = this;
      }
    }
  }

  // for commands that can be triggered by multiple base commands
  addCommandAliases(commands) {
    for (const command in commands) {
      if (commands[command].options.aliases) {
        commands[command].options.aliases.forEach(alias => {
          commands[alias] = commands[command];
        })
      }
    }
  }

  // static class for getting streamer data using the streamer's display name
  static async getCurrentStreamerData(streamer) {
    const channelRequestOptions = {
      hostname: 'api.twitch.tv',
      method: 'GET',
      path: `/helix/search/channels?query=${streamer}`,
      headers: {
        'Authorization': `Bearer ${ev.BEXXTEBOT_TOKEN}`,
        'Client-id': ev.CLIENT_ID
      }
    }

    // will store the full result of the http request
    let requestResult = '';
    // will store only the data for the streamer requested
    let streamerData = '';

    const channelInfoRequest = https.request(channelRequestOptions, res => {

      res.on('data', data => {
        requestResult += data;

        try {

          requestResult = JSON.parse(requestResult);

          let channelData;
          for (const channelObject of requestResult.data) {
            if (channelObject.broadcaster_login === streamer) {
              channelData = channelObject;
              break;
            }
          }

          if (!channelData) {
            return null;
          }

          streamerData = channelData;

        } catch (e) {
          // if the data comes in multiple chunks, the initial attempts will fail since the data is incomplete. Throws "SyntaxError: Unexpected end of JSON input"
          // this can be ignored
          if (!(e.name === 'SyntaxError' && e.message === 'Unexpected end of JSON input')) {
            logError(e, fileName);
          }
        }

      });

    });

    channelInfoRequest.on('error', error => {
      logError(error, fileName);
    })

    channelInfoRequest.end();

    let cycles = 0;

    // attempt once per second for five seconds to resolve the promise with streamerData. Otherwise, reject
    return new Promise((resolve, reject) => {
      const resolutionTimeout = setInterval(() => {
        if (streamerData) {
          resolve(streamerData);
          clearInterval(resolutionTimeout);
        } else if (cycles > 5) {
          reject('no streamer data found');
        }
        cycles++;
      }, 1000)
    })
  }

  // instance level wrapper for static method
  async getCurrentStreamerData(streamer=this.username) {
    return await Streamer.getCurrentStreamerData(streamer);
  }

}

module.exports = { Streamer };