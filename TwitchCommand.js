// if you're trying to make a new command, this is the right page; scroll down a bit further
const { logError } = require('./utils.js');

const twitchCommands = {};

class TwitchCommand {

  constructor(name, commandText, options={}) {
    this.name = name;
    this.commandText = commandText;

    this.options = {};
    this.options.cooldown_ms = options.cooldown_ms !== undefined ? options.cooldown_ms : 10000;
    this.options.modOnly = options.modOnly || false;
    this.options.refsMessage = options.refsMessage || false;

    this.onCooldown = false;
  }

  createCooldown() {
    this.onCooldown = true;
    setTimeout(() => {
      this.onCooldown = false;
    }, this.options.cooldown_ms);
  }

  async execute(messageObject) {
    //console.log(messageObject);
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.options.modOnly || this.onCooldown) {
        return;
      }
    }

    if (this.options.cooldown_ms) {
      this.createCooldown();
    }

    try {
      if (typeof this.commandText === typeof function(){}) {
        messageObject.addResponse(this.commandText(messageObject));
      } else {
        messageObject.addResponse(this.commandText);
      }
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

    //console.log(command);

    if (command === this.name) {
      if (messageObject.tags.mod || messageObject.tags.username === messageObject.channel.slice(1)) {
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
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.modOnly || this.onCooldown) {
        return;
      }
    }

    let evaluation;

    if (messageObject.tags.mod || messageObject.tags.username === messageObject.channel.slice(1)) {
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
      logError(`Problem executing the ${this.name} command`, 'TwitchCommand.js');
      logError(e, 'TwitchCommand.js');
    }
  }
}

module.exports = { TwitchCommand, TwitchCounterCommand };

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



// const music = new TwitchCommand('music', musicCallback);
// function musicCallback(messageObject) {
//   if (bexxteConfig.playlist) {
//     messageObject.addResponse(
//       `Today's playlist is ${bexxteConfig.playlist}`
//     );
//   } else {
//     messageObject.addResponse(
//       'this bitch empty, yeet'
//     )
//   }
// }

// // shoutout
// const so = new TwitchCommand('so', soCallback, 0, true);
// async function soCallback(messageObject) {
//   let recipient = messageObject.content.split(' ')[1];

//   if (!recipient) {
//     return;
//   }

//   while (recipient.startsWith('@')) {
//     recipient = recipient.slice(1);
//   }

//   if (recipient === messageObject.channel.slice(1)) {
//     messageObject.addResponse(
//       `@${recipient} is pretty cool, but she doesn't need a shoutout on her own channel.`
//     )
//     return;
//   }

//   if (recipient === messageObject.tags.username) {
//     messageObject.addResponse(
//       `Nice try @${recipient}, you can't give yourself a shoutout!`
//     )
//     return;
//   }

//   let streamerData = await new Streamer(recipient).getCurrentStreamerData();

//   let shoutout = '';

//   if (!streamerData.game_name) {
//     shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! bexxteLove`;
//   } else if (streamerData.is_live) {
//     if (streamerData.game_name === 'Just Chatting') {
//       shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They are currently "${streamerData.game_name}" bexxteLove`;
//     } else {
//       shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They are currently playing "${streamerData.game_name}" bexxteLove`;
//     }
//     // or offline
//   } else {
//     if (streamerData.game_name === 'Just Chatting') {
//       shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They were last seen "${streamerData.game_name}" bexxteLove`;
//     } else {
//       shoutout += `Everyone go check out @${streamerData.display_name} at twitch.tv/${streamerData.broadcaster_login}! They were last seen playing "${streamerData.game_name}" bexxteLove`;
//     }
//   }

//   messageObject.addResponse(shoutout);

// } // end soCallback

// const uptime = new TwitchCommand('uptime', uptimeCallback);
// async function uptimeCallback(messageObject) {
//   const streamerData = await new Streamer(messageObject.channel).getCurrentStreamerData();

//   // handle this?
//   if (!streamerData) {
//     return;
//   }

//   let uptimeOutput = '';

//   if (!streamerData.is_live) {
//     uptimeOutput = `Sorry, doesn't look like ${streamerData.display_name} is live right now. Check back again later!`;
//   } else {

//     const currentTime = Date.now();
//     const startTime = Date.parse(streamerData.started_at);
//     let elapsedTime = currentTime - startTime;

//     const hours = Math.floor(elapsedTime / (60000 * 60));
//     elapsedTime = elapsedTime % (60000 * 60);

//     const minutes = Math.floor(elapsedTime / 60000);
//     elapsedTime = elapsedTime % 60000;

//     const seconds = Math.floor(elapsedTime / 1000);

//     uptimeOutput += streamerData.display_name;
//     uptimeOutput += ' has been live for ';

//     if (hours > 1) {
//       uptimeOutput += hours + ' hours, ';
//     } else if (hours === 1) {
//       uptimeOutput += hours + ' hour, ';
//     }

//     if (minutes !== 1) {
//       uptimeOutput += minutes + ' minutes';
//     } else {
//       uptimeOutput += minutes + ' minute';
//     }

//     if (hours) {
//       uptimeOutput += ','
//     }

//     if (minutes !== 1) {
//       uptimeOutput += ' and ' + seconds + ' seconds.';
//     } else {
//       uptimeOutput += ' and ' + seconds + ' second.';
//     }

//   }

//   messageObject.addResponse(uptimeOutput);

// } // end uptimeCallback

// const );
// function whomstCallback(messageObject) {
//   messageObject.addResponse(
//     
//   )
// }


// //
// // SPECIAL COMMANDS
// //



// // content warning
// const cw = new TwitchCommand('cw', cwCallback);
// function cwCallback(messageObject) {
//   const result =
//     bexxteConfig.contentWarning ||
//     'The streamer has not designated any content warnings for this game.';

//   messageObject.addResponse(
//     result
//   )
// }

// const mute = new TwitchCommand('mute', muteCallback);
// const muted = new TwitchCommand('muted', muteCallback);
// function muteCallback(messageObject) {
//   messageObject.addResponse(
//     `@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
//   );
//   messageObject.addResponse(
//     `@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
//   );
//   messageObject.addResponse(
//     `@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`
//   );
// }

// const pitbull = new TwitchCommand('pitbull', pitbullCallback);
// function pitbullCallback(messageObject) {
//   const coinflip = Math.floor(Math.random() * 2);

//   if (coinflip === 0) {
//     messageObject.addResponse('Dale!');
//   } else {
//     messageObject.addResponse('Believe me, been there done that. But everyday above ground is a great day, remember that.');
//   }
// }

// const pride = new TwitchCommand('pride', prideCallback);
// function prideCallback(messageObject) {
//   let emoteString = '';
//   let randNum;

//   for (let i = 0; i < 10; i++) {
//     randNum = Math.floor(Math.random() * bexxteConfig.prideEmotes.length);
//     emoteString += bexxteConfig.prideEmotes[randNum] + ' ';
//   }

//   messageObject.addResponse(emoteString);
// }

// const raiding = new TwitchCommand('raiding', raidingCallback, 0, true);
// function raidingCallback(messageObject) {
//   let raidingMessage = '';

//   const argument = messageObject.content.split(' ')[1];

//   switch (argument) {
//     case 'cozy':
//       raidingMessage = 'Cozy Raid bexxteCozy bexxteCozy';
//       break;
//     case 'love':
//       raidingMessage = 'Bexxters Raid bexxteLove bexxteLove';
//       break;
//     case 'vibe':
//       raidingMessage = 'Bexxters Raid bexxteBop bexxteBop';
//       break;
//     case 'aggro':
//       raidingMessage = 'Bexxters Raid bexxteGun bexxteGun';
//       break;
//     default:
//       raidingMessage = 'The !raiding command can be followed by any of these: cozy, love, vibe, aggro';
//       break;
//   }

//   messageObject.addResponse(raidingMessage);
// }






// const quote = new TwitchCommand('quote', quoteCallback);
// const quoteCatalog = bexxteConfig.quotes;
// function quoteCallback(messageObject) {

//   const i = Math.floor(Math.random() * quoteCatalog.length);
//   messageObject.addResponse(
//     quoteCatalog[i]
//   )

// }

// const schedule = new TwitchCommand('schedule', scheduleCallback);
// function scheduleCallback(messageObject) {
//   const days = [['sunday', 'SUN'], ['monday', 'MON'], ['tuesday', 'TUES'], ['wednesday', 'WEDS'], ['thursday', 'THURS'], ['friday', 'FRI'], ['saturday', 'SAT']];
//   let responseString = '';
//   let first = true;

//   for (const day of days) {
//     if (bexxteConfig.schedule[day[0]]) {
//       if (!first) {
//         responseString += ' | '
//       }
//       responseString += day[1];
//       responseString += ': ';
//       responseString += bexxteConfig.schedule[day[0]];
//       first = false;
//     }
//   }

//   messageObject.addResponse(
//     responseString
//   );
// }

// const ;
// function youtubeCallback(messageObject) {
//   messageObject.addResponse(
//     
//   )
// }

// const getRandomValidation = () => {
//   return Math.floor(Math.random() * bexxteConfig.validations.length);
// }

// const validate = new TwitchCommand('validate', validateCallback, 5000, false);
// function validateCallback(messageObject) {
//   let v1, v2, v3;

//   v1 = getRandomValidation();

//   while (!v2 || v2 === v1) {
//     v2 = getRandomValidation();
//   }

//   while (!v3 || v3 === v1 || v3 === v2) {
//     v3 = getRandomValidation();
//   }

//   // she gives you three validation phrases
//   messageObject.addResponse(`@${messageObject.tags['display-name']}
//       ${bexxteConfig.validations[v1]}
//       ${bexxteConfig.validations[v2]}
//       ${bexxteConfig.validations[v3]}`
//   );
// }

// //
// // PEOPLE
// //

// const marta = new TwitchCommand('marta', martaCallback, 5000);
// function martaCallback(messageObject) {
//   messageObject.addResponse(
//     '​Check out (and maybe commission) our UwUest mod and amazing artist Marta over at https://twitter.com/_martuwu or https://martuwuu.carrd.co'
//   )
// }

// const tim = new TwitchCommand('tim', timCallback, 5000);
// function timCallback(messageObject) {
//   messageObject.addResponse(
//     'my partner of 7 years. person I complain to when my stream randomly dies. pretty cool dude.'
//   )
// }

// const michael = new TwitchCommand('michael', michaelCallback, 5000);
// const michaelQuotes = bexxteConfig.michaelQuotes;
// function michaelCallback(messageObject) {
//   const i = Math.floor(Math.random() * michaelQuotes.length);

//   messageObject.addResponse(
//     `Humor King tonichaelmight aka my best friend for over half my life??? we're old. As he once said: "${michaelQuotes[i]}"`
//   )
// }

// const yackie = new TwitchCommand('yackie', yackieCallback, 5000);
// function yackieCallback(messageObject) {
//   messageObject.addResponse(
//     'Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat !'
//   )
// }



// module.exports = { twitchCommands };