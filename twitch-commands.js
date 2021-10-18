const ev = require('./ev.js'); // environment variables
const { bexxteConfig } = require('./config.js');
const https = require('https');
const fs = require('fs');

const twitchCommands = {};

class CommandResult {
  constructor(output, channel = ev.CHANNEL_NAME, modifier = 't') {
    this.modifier = modifier;
    this.channel = channel;
    this.output = output;
  }
}

class TwitchCommand {

  constructor(name, callback, cooldown_ms = 10000, modOnly = false, parameters = ['mod']) {
    this.name = name;
    this.callback = callback;
    this.modOnly = modOnly;
    this.cooldown_ms = cooldown_ms;
    this.parameters = parameters;
    this.onCooldown = false;
    twitchCommands[name] = this;
  }

  createCooldown() {
    this.onCooldown = true;
    setTimeout(() => {
      this.onCooldown = false;
    }, this.cooldown_ms);
  }

  async execute(params) {
    if (!params.mod) {
      if (this.modOnly || this.onCooldown) {
        return null
      }
    }
    // console.log(this.onCooldown);
    this.createCooldown();
    try {
      const result = await this.callback(params);
      return result;
    } catch (e) {
      throw new Error(`Problem executing the ${this.name} command`)
    }
  }
}


//
// TEMPORARY COMMANDS
//


const ghostcon = new TwitchCommand('ghostcon', ghostconCallback);
function ghostconCallback(params) {
  return new CommandResult(
    'I\'m thrilled to announce I\'ll be participating in GhostCon! A virtual convention taking place Halloween weekend celebrating spooky streamers and artists! I\'ll be live to celebrate on Sunday, Oct 31 at 8pm! Find out more here: https://ghostcon.net/about.php'
  );
}

//
// BASIC COMMANDS
//

const bttv = new TwitchCommand('bttv', bttvCallback);
function bttvCallback(params) {
  return new CommandResult(
    `Install bttv here (https://betterttv.com/) to use these cool emotes: 
        blobDance 
        monkaTOS 
        catblobDance 
        hypeE 
        think3D 
        HYPERS  
        elmoFire 
        WEEWOO 
        WELCOME 
        nutButton 
        ChefsKiss 
        AerithBop 
        KEKW 
        OhMyPoggies 
        peepoRiot
        HoldIt`
  )
}

const discord = new TwitchCommand('discord', discordCallback);
function discordCallback(params) {
  return new CommandResult(
    '​Join the Basement Party and hang out offline here: https://discord.gg/bexxters'
  )
}

const follow = new TwitchCommand('follow', followCallback);
function followCallback(params) {
  return new CommandResult(
    'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!'
  )
}

const music = new TwitchCommand('music', musicCallback);
function musicCallback(params) {
  if (bexxteConfig.playlist) {
    return new CommandResult(
      `Today's playlist is ${bexxteConfig.playlist}`
    );
  } else {
    return new CommandResult(
      'this bitch empty,, yeet'
    )
  }
}

const prime = new TwitchCommand('prime', primeCallback);
function primeCallback(params) {
  return new CommandResult(
    '​Link your amazon prime to twitch and get a free sub every month, ya nerds'
  )
}

const raid = new TwitchCommand('raid', raidCallback, 0, true);
function raidCallback(params) {
  return new CommandResult(
    `​Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove`
  )
}

const so = new TwitchCommand('so', soCallback, 0, true, ['mod', 'argument1', 'sender']);
function soCallback(params) {
  const recipient = params.argument1;

  if (recipient === ev.CHANNEL_NAME) {
    return new CommandResult(
      `@${recipient} is pretty cool, but she doesn't need a shoutout on her own channel.`
    )
  }

  if (recipient === params.sender) {
    return new CommandResult(
      `Nice try @${recipient}, you can't give yourself a shoutout!`
    )
  }

  let requestResult = '';

  let shoutout = '';

  const channelRequestOptions = {
    hostname: 'api.twitch.tv',
    method: 'GET',
    path: `/helix/search/channels?query=${recipient}`,
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
          if (channelObject.broadcaster_login === recipient) {
            channelData = channelObject;
            break;
          }
        }
        // console.log('hi');

        if (!channelData) {
          return null;
        }

        // console.log(channelData);
  
        if (!channelData.game_name) {
          shoutout += `Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! bexxteLove`;
        }

        if (channelData.is_live) {
          if (channelData.game_name === 'Just Chatting') {
            shoutout += `Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They are currently "${channelData.game_name}" bexxteLove`;
          } else {
            shoutout += `Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They are currently playing "${channelData.game_name}" bexxteLove`;
          }
          // or offline
        } else {
          if (channelData.game_name === 'Just Chatting') {
            shoutout += `Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They were last seen "${channelData.game_name}" bexxteLove`;
          } else {
            shoutout += `Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They were last seen playing "${channelData.game_name}" bexxteLove`;
          }
        }
        
      } catch (e) {
        if (!(e.name === 'SyntaxError' && e.message === 'Unexpected end of JSON input')) {
          try {
            const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' });
            const datePlusError = `${currentDateAndTime} :: ${e}\n`;
            fs.appendFile('error.txt', datePlusError, appendError => {
              if (appendError) throw appendError;
            });
          } catch (innerError) {
            console.log('an error occurred while trying to log an error :/');
            console.log(innerError);
          }
        }
      } 
    })
  })

  channelInfoRequest.on('error', error => {
    console.log(error);
  })

  // console.log(shoutout);

  channelInfoRequest.end();

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(new CommandResult(shoutout));
    }, 500);
  });
  
} // end soCallback

module.exports = twitchCommands;