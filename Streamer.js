const ev = require('./ev.js');
const https = require('https');
const { logError } = require('./utils.js');
const fileName = require('path').basename(__filename);

class Streamer {

  addCommandAliases(commands) {
    for (const command in commands) {
      if (commands[command].options.aliases) {
        commands[command].options.aliases.forEach(alias => {
          commands[alias] = commands[command];
        })
      }
    }
  }

  constructor(username, commands, config) {
    this.username = username.startsWith('#') ? username.slice(1) : username;
    this.commands = commands;
    this.addCommandAliases(this.commands);
    //console.log(commands);
    this.config = config;
  }

  async getCurrentStreamerData() {

    const channelRequestOptions = {
      hostname: 'api.twitch.tv',
      method: 'GET',
      path: `/helix/search/channels?query=${this.username}`,
      headers: {
        'Authorization': `Bearer ${ev.BEXXTEBOT_TOKEN}`,
        'Client-id': ev.CLIENT_ID
      }
    }

    let requestResult = '';
    let streamerData = '';

    const channelInfoRequest = https.request(channelRequestOptions, res => {

      res.on('data', data => {
        requestResult += data;

        try {

          requestResult = JSON.parse(requestResult);

          let channelData;
          for (const channelObject of requestResult.data) {
            if (channelObject.broadcaster_login === this.username) {
              channelData = channelObject;
              break;
            }
          }

          if (!channelData) {
            return null;
          }

          streamerData = channelData;

        } catch (e) {
          if (!(e.name === 'SyntaxError' && e.message === 'Unexpected end of JSON input')) {
            logError(e, fileName);
          }
        }

      });

    });

    channelInfoRequest.on('error', error => {
      console.log(error);
    })

    channelInfoRequest.end();

    let cycles = 0;

    return new Promise(resolve => {
      const resolutionTimeout = setInterval(() => {
        if (streamerData || cycles > 20) {
          //console.log(streamerData);
          resolve(streamerData);
          clearInterval(resolutionTimeout);
        }
        cycles++;
      }, 250)
    })

  }

}

module.exports = { Streamer };