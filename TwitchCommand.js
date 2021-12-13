const ev = require('./ev.js'); // environment variables
const { bexxteConfig } = require('./config.js');
const https = require('https');
const fs = require('fs');

const twitchCommands = {};

class TwitchCommand {

  constructor(name, callback, cooldown_ms = 10000, modOnly = false) {
    this.name = name;
    this.callback = callback;
    this.modOnly = modOnly;
    this.cooldown_ms = cooldown_ms;
    this.onCooldown = false;
    twitchCommands[name] = this;
  }

  createCooldown() {
    this.onCooldown = true;
    setTimeout(() => {
      this.onCooldown = false;
    }, this.cooldown_ms);
  }

  async execute(messageObject) {
    if (!messageObject.tags.mod && !messageObject.tags.username === ev.CHANNEL_NAME) {
      if (this.modOnly || this.onCooldown) {
        return;
      }
    }

    if (this.cooldown_ms) {
      this.createCooldown();
    }
    
    try {
      await this.callback(messageObject);
      return;
    } catch (e) {
      console.log(`Problem executing the ${this.name} command`);
      throw e;
    }
  }
}


const goals = new TwitchCommand('goals', goalsCallback);
function goalsCallback(messageObject) {
  messageObject.addResponse(
    "I'm hoping to hit 500 followers by the end of the year! So if you're enjoying what you see, feel free to hit the heart to help me get there! bexxteLove"
  )
}

const nqny = new TwitchCommand('nqny', nqnyCallback);
function nqnyCallback(messageObject) {
  messageObject.addResponse(
    "December 30th is Not Quite New Years: Round 2! Starting at 2PM eastern I'll be streaming for twelve hours as a celebration for this past year of streams and party with chat! We'll follow up from last year's stream with Spyro 2, a Fishing Minigame tier list, Alien Isolation Nightmare mode, Steam Giftcard Giveaways, and more!"
  )
}

//
// BASIC COMMANDS
//

const bttv = new TwitchCommand('bttv', bttvCallback);
function bttvCallback(messageObject) {
  messageObject.addResponse(
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
function discordCallback(messageObject) {
  messageObject.addResponse(
    `Join the Basement Party and hang out offline here: ${bexxteConfig.discordServerLink}`
  )
}

const follow = new TwitchCommand('follow', followCallback);
function followCallback(messageObject) {
  messageObject.addResponse(
    'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!'
  )
}

const music = new TwitchCommand('music', musicCallback);
function musicCallback(messageObject) {
  if (bexxteConfig.playlist) {
    messageObject.addResponse(
      `Today's playlist is ${bexxteConfig.playlist}`
    );
  } else {
    messageObject.addResponse(
      'this bitch empty, yeet'
    )
  }
}

const prime = new TwitchCommand('prime', primeCallback);
function primeCallback(messageObject) {
  messageObject.addResponse(
    '​Link your amazon prime to twitch and get a free sub every month, ya nerds'
  )
}

const raid = new TwitchCommand('raid', raidCallback, 0, true);
function raidCallback(messageObject) {
  messageObject.addResponse(
    `​Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove`
  )
}

// shoutout
const so = new TwitchCommand('so', soCallback, 0, true);
function soCallback(messageObject) {
  let recipient = messageObject.content.split(' ')[1];

  console.log(recipient);

  if (!recipient) {
    return;
  }

  if (recipient.startsWith('@')) {
    recipient = recipient.slice(1);
  }

  if (recipient === ev.CHANNEL_NAME) {
    messageObject.addResponse(
      `@${recipient} is pretty cool, but she doesn't need a shoutout on her own channel.`
    )
  }

  if (recipient === messageObject.tags.username) {
    messageObject.addResponse(
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

        // console.log(requestResult);

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
    })
  })

  channelInfoRequest.on('error', error => {
    console.log(error);
  })

  // console.log(shoutout);

  channelInfoRequest.end();

  return new Promise(resolve => {
    setTimeout(() => {
      messageObject.addResponse(shoutout);
      resolve(
        true
      );
    }, 500);
  });
  
} // end soCallback

const sub = new TwitchCommand('sub', subCallback);
function subCallback(messageObject) {
  messageObject.addResponse(
    '​Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove'
  )
}

const uptime = new TwitchCommand('uptime', uptimeCallback);
function uptimeCallback(messageObject) {
  const streamer = ev.CHANNEL_NAME

  let requestResult = '';

  let uptimeOutput = '';

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

        if (!channelData.is_live) {
          uptimeOutput = `Sorry, doesn't look like ${streamer} is live right now. Check back again later!`;
        } else {

          const currentTime = Date.now();
          const startTime = Date.parse(channelData.started_at);
          let elapsedTime = currentTime - startTime;

          const hours = Math.floor(elapsedTime / (60000 * 60));
          elapsedTime = elapsedTime % (60000 * 60);

          const minutes = Math.floor(elapsedTime / 60000);
          elapsedTime = elapsedTime % 60000;

          const seconds = Math.floor(elapsedTime / 1000);

          uptimeOutput += streamer;
          uptimeOutput += ' has been live for ';

          if (hours > 1) {
            uptimeOutput += hours + ' hours, ';
          } else if (hours === 1) {
            uptimeOutput += hours + ' hour, ';
          }

          if (minutes !== 1) {
            uptimeOutput += minutes + ' minutes';
          } else {
            uptimeOutput += minutes + ' minute';
          }

          if (hours) {
            uptimeOutput += ','
          }

          if (minutes !== 1) {
            uptimeOutput += ' and ' + seconds + ' seconds.';
          } else {
            uptimeOutput += ' and ' + seconds + ' second.';
          }

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
    })
  });

  channelInfoRequest.on('error', error => {
    console.log(error);
  })

  channelInfoRequest.end();

  return new Promise(resolve => {
    setTimeout(() => {
      messageObject.addResponse(uptimeOutput);
      resolve(true);
    }, 500);

  });

} // end uptimeCallback

const whomst = new TwitchCommand('whomst', whomstCallback, 2000);
function whomstCallback(messageObject) {
  messageObject.addResponse(
    "​I'm a Variety Streamer mostly streaming RPGs, Horror, and Indie stuff because I'm not good at Battle Royale FPS games and can't commit to MMOs. You can catch me live five to six nights a week at 7:30pm EST! We do Spooky Sunday with horror/suspense games every Sunday!"
  )
}


//
// SPECIAL COMMANDS
//

const blm = new TwitchCommand('blm', blmCallback);
function blmCallback(messageObject) {
  messageObject.addResponse(
    'Black Lives Matter. Follow this link to learn about ways you can support the movement: https://blacklivesmatters.carrd.co'
  )
}

// content warning
const cw = new TwitchCommand('cw', cwCallback);
function cwCallback(messageObject) {
  const result = 
  bexxteConfig.contentWarning || 
  'The streamer has not designated any content warnings for this game.';

  messageObject.addResponse(
    result
  )
} 

const stap = new TwitchCommand('stap', stapCallback);
function stapCallback(messageObject) {
  messageObject.addResponse(
    '​stop flaming ok! I dnt ned all da negatwiti yo ar geveng me right nau! bexxteGun'
  )
}

const mute = new TwitchCommand('mute', muteCallback);
function muteCallback(messageObject) {
  messageObject.addResponse(
    `@${ev.CHANNEL_NAME.toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
  );
  messageObject.addResponse(
    `@${ev.CHANNEL_NAME.toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
  );
  messageObject.addResponse(
    `@${ev.CHANNEL_NAME.toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
  );
}

const pitbull = new TwitchCommand('pitbull', pitbullCallback);
function pitbullCallback(messageObject) {
  const coinflip = Math.floor(Math.random() * 2);

  if (coinflip === 0) {
    messageObject.addResponse('Dale!');
  } else {
    messageObject.addResponse('Believe me, been there done that. But everyday above ground is a great day, remember that.');
  }
}

const pride = new TwitchCommand('pride', prideCallback);
function prideCallback(messageObject) {
  let emoteString = '';
  let randNum;

  for (let i = 0; i < 10; i++) {
    randNum = Math.floor(Math.random() * bexxteConfig.prideEmotes.length);
    emoteString += bexxteConfig.prideEmotes[randNum] + ' ';
  }

  messageObject.addResponse(emoteString);
}

const raiding = new TwitchCommand('raiding', raidingCallback, 0, true);
function raidingCallback(messageObject) {
  let raidingMessage = '';

  const argument = messageObject.content.split(' ')[1];

  switch (argument){
    case 'cozy':
      raidingMessage = 'Cozy Raid bexxteCozy bexxteCozy';
      break;
    case 'love':
      raidingMessage = 'Bexxters Raid bexxteLove bexxteLove';
      break;
    case 'kiwi':
      raidingMessage = 'Kindred Kiwi Raid bexxteLove bexxteLove';
      break;
    case 'vibe':
      raidingMessage = 'Bexxters Raid bexxteBop bexxteBop';
      break;
    case 'aggro':
      raidingMessage = 'Bexxters Raid bexxteGun bexxteGun';
      break;
    default:
      raidingMessage = 'The !raiding command can be followed by any of these: cozy, love, kiwi, vibe, aggro';
      break;
  }

  messageObject.addResponse(raidingMessage);
}

const welcome = new TwitchCommand('welcome', welcomeCallback);
function welcomeCallback(messageObject) {

  messageObject.addResponse(
    'his has bondage to you too owo WELCOME'
  )

}

const bexxtebot = new TwitchCommand('bexxtebot', bexxtebotCallback);
function bexxtebotCallback(messageObject) {
  messageObject.addResponse(
    'Hey there everyone, my name is BexxteBot! I am a custom chat bot designed specifically for this channel; if you see me do or say anything crazy, make sure to let @bexxters or @tonichaelmight know so that it can be fixed ASAP. Happy Chatting! bexxteLove'
  )
}

/*
const donate = new TwitchCommand('donate', donateCallback);
function donateCallback(messageObject) {
  messageObject.addResponse(
    'Ghostcon is raising money for the National Alliance on Mental Illness - you can donate here: https://tiltify.com/+ghostcon-2021/scaring-is-caring-ghostcon-2021'
  )
}
*/

const quote = new TwitchCommand('quote', quoteCallback);
const quoteCatalog = bexxteConfig.quotes;
function quoteCallback(messageObject) {

  const i = Math.floor(Math.random() * quoteCatalog.length);
  messageObject.addResponse(
    quoteCatalog[i]
  )

}

const socials = new TwitchCommand('socials', socialsCallback);
function socialsCallback(messageObject) {
  messageObject.addResponse(
    `Come follow me on these other platforms as well!         
    Twitter: ${ev.TWITTER}      
    TikTok: ${ev.TIK_TOK}
    YouTube: ${ev.YOUTUBE}`
  )
}

const youtube = new TwitchCommand('youtube', youtubeCallback);
function youtubeCallback(messageObject) {
  messageObject.addResponse(
    `Check out edited short plays and full stream uploads over on my Youtube: ${ev.YOUTUBE}`
  )
}

const getRandomValidation = () => {
  return Math.floor(Math.random() * bexxteConfig.validations.length);
}

const validate = new TwitchCommand('validate', validateCallback, 5000, false);
function validateCallback(messageObject) {
  let v1, v2, v3;

  v1 = getRandomValidation();

  while (!v2 || v2 === v1) {
    v2 = getRandomValidation();
  }

  while (!v3 || v3 === v1 || v3 === v2) {
    v3 = getRandomValidation();
  }

  // she gives you three validation phrases
  messageObject.addResponse(`@${messageObject.tags['display-name']}
      ${bexxteConfig.validations[v1]}
      ${bexxteConfig.validations[v2]}
      ${bexxteConfig.validations[v3]}`
    );
}

//
// PEOPLE
//

const marta = new TwitchCommand('marta', martaCallback, 5000);
function martaCallback(messageObject) {
  messageObject.addResponse(
    '​Check out (and maybe commission) our UwUest mod and amazing artist Marta over at https://twitter.com/_martuwu or https://martuwuu.carrd.co'
  )
}

const tim = new TwitchCommand('tim', timCallback, 5000);
function timCallback(messageObject) {
  messageObject.addResponse(
    '​my partner of 6 years. person I complain to when my stream randomly dies. pretty cool dude.'
  )
}

const michael = new TwitchCommand('michael', michaelCallback, 5000);
const michaelQuotes = bexxteConfig.michaelQuotes;
function michaelCallback(messageObject) {
  const i = Math.floor(Math.random() * michaelQuotes.length);

  messageObject.addResponse(
    `Humor King tonichaelmight aka my best friend for over half my life??? we're old. As he once said: "${michaelQuotes[i]}"`
  )
}

const yackie = new TwitchCommand('yackie', yackieCallback, 5000);
function yackieCallback(messageObject) {
  messageObject.addResponse(
    '​Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat !'
  )
}



module.exports = { twitchCommands };