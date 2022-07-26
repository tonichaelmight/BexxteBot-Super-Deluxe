// if you're trying to make a new command, this is the right page; scroll down a bit further

const ev = require('./ev.js'); // environment variables
const { bexxteConfig } = require('./config.js');
const https = require('https');
const fs = require('fs');
const { logError } = require('./utils.js');
const { Streamer } = require('./Streamer.js');

const Database = require("@replit/database");
const db = new Database();

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
    //console.log(messageObject);
    if (!messageObject.tags.mod && !(messageObject.tags.username === ev.CHANNEL_NAME)) {
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
      logError(`Problem executing the ${this.name} command`, 'TwitchCommand.js');
      logError(e, 'TwitchCommand.js');
    }
  }
}

/* basic TwitchCommand creation template

replace the word 'template' (all four times it appears) with the name of your command. Fill in your text in the double quotes

this works for when you just want BexxteBot to always say the same thing when the command is triggered

const template = new TwitchCommand('template', templateCallback);
function templateCallback(messageObject) {
  messageObject.addResponse(
    "Type the message you would like BexxteBot to say here!"
  )
}

*/


// CURRENT WORK
class TwitchCounterCommand extends TwitchCommand {

  constructor(name, callback, cooldown_ms = 10000) {
    super(name, callback, cooldown_ms);
    twitchCommands[name] = this;
    twitchCommands[`${name}s`] = this;
  }

  async evaluateMessage(messageObject) {
    const messageWords = messageObject.content.split(' ');
    const command = messageWords[0].slice(1);
    const evaluation = {};

    console.log(command);

    if (command === this.name) {
      if (messageObject.tags.mod || messageObject.tags.username === ev.CHANNEL_NAME) {
        if (messageWords[1] === 'set') {
          evaluation.action = 'set';
          const newValue = messageWords[2];
          const setSuccess = await this.setValue(newValue);
          if (setSuccess) {
            evaluation.successful = true;
            evaluation.endValue = newValue;
          } else {
            evaluation.successful = false;
            evaluation.endValue = await this.getValue();
            evaluation.attempt = newValue;
          }
        } else {
          console.log('hi');
          evaluation.action = 'add';
          const currentValue = await this.getValue();
          const newValue = currentValue * 1 + 1;
          await this.setValue(newValue);
          evaluation.endValue = newValue;
        }
      } else {
        return;
      }
    } else if (command === `${this.name}s`) {
      evaluation.action = 'show';
      evaluation.endValue = await this.getValue();
    }

    return evaluation;

  }

  async setValue(newValue) {
    if (Number.isNaN(newValue * 1)) {
      return false;
    }
    await db.set(this.name, newValue);
    return true;
  }

  async getValue() {

    let currentValue = await db.get(this.name);

    if (!currentValue) {
      currentValue = 0;
    }

    return currentValue;
  }

  async execute(messageObject) {
    //console.log(messageObject);
    if (!messageObject.tags.mod && !(messageObject.tags.username === ev.CHANNEL_NAME)) {
      if (this.modOnly || this.onCooldown) {
        return;
      }
    }

    let evaluation;

    if (messageObject.tags.mod || messageObject.tags.username === ev.CHANNEL_NAME) {
      evaluation = await this.evaluateMessage(messageObject);
    }

    //console.log(evaluation);

    if (this.cooldown_ms) {
      this.createCooldown();
    }

    try {
      if (!evaluation) {
        return;
      }
      await this.callback(messageObject, evaluation);
      return;
    } catch (e) {
      console.log(`Problem executing the ${this.name} command`);
      throw e;
    }
  }
}

const test = new TwitchCounterCommand('test', testCallback);
async function testCallback(messageObject, evaluation) {

  switch (evaluation.action) {
    case 'set':
      if (evaluation.successful) {
        messageObject.addResponse(
          `You have set the test count to ${evaluation.endValue}.`
        )
        break;
      } else {
        messageObject.addResponse(
          `Sorry, I was not able to set the test count to "${evaluation.attempt}". Please make sure you use a number argument. The current test count is ${evaluation.endValue}.`
        )
        break;
      }

    case 'add':
      messageObject.addResponse(
        `You have increased the test value by 1. The new test value is ${evaluation.endValue}.`
      )
      break;

    case 'show':
      messageObject.addResponse(
        `The current test value is ${evaluation.endValue}.`
      )
      break;
  }
}

const bop = new TwitchCounterCommand('bop', bopCallback);
async function bopCallback(messageObject, evaluation) {

  switch (evaluation.action) {
    case 'set':
      if (evaluation.successful) {
        messageObject.addResponse(
          `You have set the number of bops to ${evaluation.endValue} bexxteBonk`
        )
        break;
      } else {
        messageObject.addResponse(
          `Sorry, I was not able to set !bops to "${evaluation.attempt}". Please make sure you use a number. Currently, chat has been bopped ${evaluation.endValue} times.`
        )
        break;
      }

    case 'add':
      messageObject.addResponse(
        `Chat has been bopped for being horny on main bexxteBonk Y'all been horny (at least) ${evaluation.endValue} times so far for Yakuza.`
      )
      break;

    case 'show':
      messageObject.addResponse(
        `Chat has been horny for Yakuza ${evaluation.endValue} times`
      )
      break;
  }

}


// const test = new TwitchCommand('test', testCallback);
// function testCallback(messageObject) {
//   let current = fs.readFileSync(`counters/${this.name}.txt`, 'utf-8');

//   current *= 1;
//   let neue;

//   if (Number.isNaN(current)) {
//     neue = 0;
//   } else {
//     neue = current + 1;
//   }

//   fs.writeFileSync(`counters/${this.name}.txt`, neue);

//   messageObject.addResponse(`You have tested ${neue} times.`);

// }


// const goals = new TwitchCommand('goals', goalsCallback);
// function goalsCallback(messageObject) {
//   messageObject.addResponse(
//     "I'm hoping to hit 500 followers by the end of the year! So if you're enjoying what you see, feel free to hit the heart to help me get there! bexxteLove"
//   )
// }

// const nqny = new TwitchCommand('nqny', nqnyCallback);
// function nqnyCallback(messageObject) {
//   messageObject.addResponse(
//     "December 30th is Not Quite New Years: Round 2! Starting at 2PM eastern I'll be streaming for twelve hours as a celebration for this past year of streams and party with chat! We'll follow up from last year's stream with Spyro 2, a Fishing Minigame tier list, Alien Isolation Nightmare mode, Steam Giftcard Giveaways, and more!"
//   )
// }

// const donate = new TwitchCommand('donate', donateCallback);
// function donateCallback(messageObject) {
//   messageObject.addResponse(
//     "For $5 you get a random doodle, at $15 you get to choose what I draw for you (sfw). You can only get 2 drawings per donation. I'll do these in a bad art stream near the end of the month. If you'd like to donate to support the National Children's Alliance and their campaign against child abuse, click here: https://donate.tiltify.com/@bexxters/itsyourbusiness Thank you for your generosity!"
//   )
// }

//const nca = new TwitchCommand('nca', ncaCallback);
//function ncaCallback(messageObject)  {
//  messageObject.addResponse(
//    "Child abuse thrives when good people decide it’s none of their business. Throughout the month of April, we will be raising funds for The National Children's Alliance. The NCA maintains thousands of Child Advocacy Centers - safe havens for children to grow, recover, and achieve justice. Find out more about how the NCA helps children here: https://www.nationalchildrensalliance.org"
//  )
//}
//const ms = new TwitchCommand('ms', msCallback);
//function msCallback(messageObject) {
//  messageObject.addResponse(
//    "Multiple Sclerosis is a disease that impacts the nervous system. It causes the immune system to damage myelin, the coating of our nerve fibers. This causes an array symptoms such as numbness, tingling, mood changes, memory problems, pain, fatigue, or in extreme cases - blindness and/or paralysis. There is currently no known cause or cure."
//  )
//}

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
    'Link your amazon prime to twitch to get a free sub every month and put those Bezos Bucks to work'
  )
}

const raid = new TwitchCommand('raid', raidCallback, 0, true);
function raidCallback(messageObject) {
  messageObject.addResponse(
    `Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove`
  )
}

// shoutout
const so = new TwitchCommand('so', soCallback, 0, true);
async function soCallback(messageObject) {
  let recipient = messageObject.content.split(' ')[1];

  if (!recipient) {
    return;
  }

  while (recipient.startsWith('@')) {
    recipient = recipient.slice(1);
  }

  if (recipient === ev.CHANNEL_NAME) {
    messageObject.addResponse(
      `@${recipient} is pretty cool, but she doesn't need a shoutout on her own channel.`
    )
    return;
  }

  if (recipient === messageObject.tags.username) {
    messageObject.addResponse(
      `Nice try @${recipient}, you can't give yourself a shoutout!`
    )
    return;
  }

  let streamerData = await new Streamer(recipient).getCurrentStreamerData();

  let shoutout = '';

  if (!streamerData.game_name) {
    shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! bexxteLove`;
  } else if (streamerData.is_live) {
    if (streamerData.game_name === 'Just Chatting') {
      shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They are currently "${streamerData.game_name}" bexxteLove`;
    } else {
      shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They are currently playing "${streamerData.game_name}" bexxteLove`;
    }
    // or offline
  } else {
    if (streamerData.game_name === 'Just Chatting') {
      shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They were last seen "${streamerData.game_name}" bexxteLove`;
    } else {
      shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They were last seen playing "${streamerData.game_name}" bexxteLove`;
    }
  }

  messageObject.addResponse(shoutout);

} // end soCallback

const sub = new TwitchCommand('sub', subCallback);
function subCallback(messageObject) {
  messageObject.addResponse(
    'Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove'
  )
}

const uptime = new TwitchCommand('uptime', uptimeCallback);
async function uptimeCallback(messageObject) {
  let streamerData = await new Streamer('lachlie').getCurrentStreamerData();

  let uptimeOutput = '';

  if (!streamerData.is_live) {
    uptimeOutput = `Sorry, doesn't look like ${streamerData.display_name} is live right now. Check back again later!`;
  } else {

    const currentTime = Date.now();
    const startTime = Date.parse(streamerData.started_at);
    let elapsedTime = currentTime - startTime;

    const hours = Math.floor(elapsedTime / (60000 * 60));
    elapsedTime = elapsedTime % (60000 * 60);

    const minutes = Math.floor(elapsedTime / 60000);
    elapsedTime = elapsedTime % 60000;

    const seconds = Math.floor(elapsedTime / 1000);

    uptimeOutput += streamerData.display_name;
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

  messageObject.addResponse(uptimeOutput);

} // end uptimeCallback

const whomst = new TwitchCommand('whomst', whomstCallback, 2000);
function whomstCallback(messageObject) {
  messageObject.addResponse(
    "I'm a Variety Streamer mostly streaming RPGs, Horror, and Indie stuff because I'm not good at Battle Royale FPS games and can't commit to MMOs. You can catch me live Sunday through Thursday at 8:00pm EST! We do Spooky Sunday with horror/suspense games every Sunday!"
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
    'stop flaming ok! I dnt ned all da negatwiti yo ar geveng me right nau! bexxteGun'
  )
}

const mute = new TwitchCommand('mute', muteCallback);
const muted = new TwitchCommand('muted', muteCallback);
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

  switch (argument) {
    case 'cozy':
      raidingMessage = 'Cozy Raid bexxteCozy bexxteCozy';
      break;
    case 'love':
      raidingMessage = 'Bexxters Raid bexxteLove bexxteLove';
      break;
    case 'vibe':
      raidingMessage = 'Bexxters Raid bexxteBop bexxteBop';
      break;
    case 'aggro':
      raidingMessage = 'Bexxters Raid bexxteGun bexxteGun';
      break;
    default:
      raidingMessage = 'The !raiding command can be followed by any of these: cozy, love, vibe, aggro';
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


const quote = new TwitchCommand('quote', quoteCallback);
const quoteCatalog = bexxteConfig.quotes;
function quoteCallback(messageObject) {

  const i = Math.floor(Math.random() * quoteCatalog.length);
  messageObject.addResponse(
    quoteCatalog[i]
  )

}

const schedule = new TwitchCommand('schedule', scheduleCallback);
function scheduleCallback(messageObject) {
  const days = [['sunday', 'SUN'], ['monday', 'MON'], ['tuesday', 'TUES'], ['wednesday', 'WEDS'], ['thursday', 'THURS'], ['friday', 'FRI'], ['saturday', 'SAT']];
  let responseString = '';
  let first = true;

  for (const day of days) {
    if (bexxteConfig.schedule[day[0]]) {
      if (!first) {
        responseString += ' | '
      }
      responseString += day[1];
      responseString += ': ';
      responseString += bexxteConfig.schedule[day[0]];
      first = false;
    }
  }

  messageObject.addResponse(
    responseString
  );
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
    'my partner of 7 years. person I complain to when my stream randomly dies. pretty cool dude.'
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
    'Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat !'
  )
}



module.exports = { twitchCommands };