const ev = require('./ev.js'); 
const https = require('https');

const streamer = 'bexxters' //ev.CHANNEL_NAME;

const bexxters = {

  async isLive() {

    let live;
    let requestResult = '';

    const channelRequestOptions = {
      hostname: 'api.twitch.tv',
      method: 'GET',
      path: `/helix/search/channels?query=${streamer}`,
      headers: {
        'Authorization': `Bearer ${ev.BEXXTEBOT_TOKEN}`,
        'Client-id': ev.CLIENT_ID
      }
    }

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

          if (channelData.is_live) {
            live = true;
          } else {
            live = false;
          }

        } catch (e) {
          if (!(e.name === 'SyntaxError' && e.message === 'Unexpected end of JSON input')) {
            try {
              const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' });
              const datePlusError = `\n${currentDateAndTime} :: ${e}\n`;
              fs.appendFile('error.txt', datePlusError, appendError => {
                if (appendError) throw appendError;
              });
            } catch (innerError) {
              console.log('an error occurred while trying to log an error :/');
              console.log(innerError);
            }
          }
        }

      });

    }); 

    channelInfoRequest.on('error', error => {
      console.log(error);
    })

    channelInfoRequest.end();

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(live);
      }, 1000)
    })
  }

}

module.exports = { bexxters };

