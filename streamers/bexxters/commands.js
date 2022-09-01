const { logError } = require('../../utils.js');
const { TwitchCommand, TwitchCallbackCommand, AsyncTwitchCallbackCommand, TwitchCounterCommand } = require('../../TwitchCommand.js');
const { Streamer } = require('../../Streamer.js');
const { bexxteConfig } = require('./configuration.js');
const fileName = require('path').basename(__filename);




const commands = {

  // BASIC COMMANDS

  // template: new TwitchCommand('template', 'This is a tempalte command. Replace this text with the output you would like to occur'),

  bexxtebot: new TwitchCommand('bexxtebot', 'Hey there everyone, my name is BexxteBot! I am a custom chat bot designed specifically for this channel; if you see me do or say anything crazy, make sure to let @bexxters or @tonichaelmight know so that it can be fixed ASAP. Happy Chatting! bexxteLove'),

  blm: new TwitchCommand('blm', 'Black Lives Matter. Follow this link to learn about ways you can support the movement: https://blacklivesmatters.carrd.co'),

  bttv: new TwitchCommand('bttv', 'Install bttv here (https://betterttv.com/) to use these cool emotes: blobDance monkaTOS catblobDance hypeE think3D HYPERS elmoFire WEEWOO WELCOME nutButton ChefsKiss KEKW OhMyPoggies peepoRiot HoldIt'),

  discord: new TwitchCommand('discord', `Join the Basement Party and hang out offline here: ${bexxteConfig.discordServerLink}`),

  follow: new TwitchCommand('follow', 'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!'),

  newvid: new TwitchCommand('newvid', `Check out the most recent upload! ${bexxteConfig.newvideo}`),
  
  prime: new TwitchCommand('prime', 'Link your amazon prime to twitch to get a free sub every month and put those Bezos Bucks to work'),

  raid: new TwitchCommand('raid', "Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove", {cooldown_ms: 0, modOnly: true}),

  socials: new TwitchCommand('socials', `Come follow me on these other platforms as well!         
  ||     Twitter: ${bexxteConfig.socials.twitter}      
  ||     TikTok: ${bexxteConfig.socials.tiktok}
  ||     YouTube: ${bexxteConfig.socials.youtube}`),

  stap: new TwitchCommand('stap', 'stop flaming ok! I dnt ned all da negatwiti yo ar geveng me right nau! bexxteGun'),

  sub: new TwitchCommand('sub', 'Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove'),

  welcome: new TwitchCommand('welcome', 'his has bondage to you too owo WELCOME'),

  whomst: new TwitchCommand('whomst', "I'm a Variety Streamer mostly streaming RPGs, Horror, and Indie stuff because I'm not good at Battle Royale FPS games and can't commit to MMOs. You can catch me live Sunday through Thursday at 8:00pm EST! We do Spooky Sunday with horror/suspense games every Sunday!", {cooldown_ms:2000}),

  youtube: new TwitchCommand('youtube', `Check out edited short plays and full stream uploads over on my Youtube: ${bexxteConfig.socials.youtube}`),

  // PEOPLE COMMANDS -- SUBSET OF BASIC

  marta: new TwitchCommand('marta', 'Check out (and maybe commission) our UwUest mod and amazing artist Marta over at https://twitter.com/_martuwu or https://martuwuu.carrd.co', {cooldown_ms:5000}),

  tim: new TwitchCommand('tim', 'my partner of 7 years. person I complain to when my stream randomly dies. pretty cool dude.', {cooldown_ms:5000}),

  yackie: new TwitchCommand('yackie', 'Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat!', {cooldown_ms:5000}),

  // EXCEPT HER

  michael: new TwitchCallbackCommand('michael',
    () => `Humor King tonichaelmight aka my best friend for over half my life??? we're old. As he once said: "${bexxteConfig.michaelQuotes[Math.floor(Math.random() * bexxteConfig.michaelQuotes.length)]}"`
  ),

  // CALLBACK COMMANDS

  cw: new TwitchCallbackCommand('cw',
    () => bexxteConfig.contentWarning || 'The streamer has not designated any content warnings for this game.'
  ),

  lurk: new TwitchCallbackCommand('lurk',
    (messageObject) => `${messageObject.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`, 
    {refsMessage: true}),

  music: new TwitchCallbackCommand('music',
    () => bexxteConfig.playlist ? `Today's playlist is ${bexxteConfig.playlist}` : 'this bitch empty, yeet'
  ),

  mute: new TwitchCallbackCommand('mute',
    messageObject => [`@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`, `@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`, `@${messageObject.channel.slice(1).toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`],
    {refsMessage:true, aliases:['muted']}
  ),

  pitbull: new TwitchCallbackCommand('pitbull',
    () => Math.floor(Math.random() * 2) === 0 ? 'Dale!' : 'Believe me, been there done that. But everyday above ground is a great day, remember that.'
  ),

  pride: new TwitchCallbackCommand('pride',
    () => {
      let emoteString = '';
      let randNum;

      for (let i = 0; i < 10; i++) {
        randNum = Math.floor(Math.random() * bexxteConfig.prideEmotes.length);
        emoteString += bexxteConfig.prideEmotes[randNum] + ' ';
      }

      return emoteString;
    }
  ),

  quote: new TwitchCallbackCommand('quote',
    () => bexxteConfig.quotes[Math.floor(Math.random() * bexxteConfig.quotes.length)]
  ),

  raiding: new TwitchCallbackCommand('raiding',
    (messageObject) => {
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

      return raidingMessage;
    },
    {refsMessage:true, cooldown_ms:0, modOnly:true}
  ),

  schedule: new TwitchCallbackCommand('schedule', 
    () => {
      const days = ['SUN', 'MON', 'TUES', 'WEDS', 'THURS', 'FRI', 'SAT'];
      let responseString = '';
      let first = true;

      for (const day of days) {
        if (bexxteConfig.schedule[day]) {
          if (!first) {
            responseString += ' | '
          }
          responseString += day;
          responseString += ': ';
          responseString += bexxteConfig.schedule[day];
          first = false;
        }
      }

      return responseString;
    }
  ),

  validate: new TwitchCallbackCommand('validate',
    (messageObject) => {
      const getRandomValidationIndex = () => {
        return Math.floor(Math.random() * bexxteConfig.validations.length);
      }
      let v1, v2, v3;

      v1 = getRandomValidationIndex();

      while (!v2 || v2 === v1) {
        v2 = getRandomValidationIndex();
      }

      while (!v3 || v3 === v1 || v3 === v2) {
        v3 = getRandomValidationIndex();
      }

      // she gives you three validation phrases
      return `@${messageObject.tags['display-name']}
          ${bexxteConfig.validations[v1]}
          ${bexxteConfig.validations[v2]}
          ${bexxteConfig.validations[v3]}`;
    },
    {refsMessage:true, cooldown_ms:5000}
  ),

  // ASYNC CALLBACK COMMANDS

  so: new AsyncTwitchCallbackCommand('so',
    async messageObject => {
      let recipient = messageObject.content.split(' ')[1];
      let output;

        if (!recipient) {
          return;
        }
      
        while (recipient.startsWith('@')) {
          recipient = recipient.slice(1);
        }
      
        if (recipient === messageObject.channel.slice(1)) {
          output = `@${recipient} is pretty cool, but she doesn't need a shoutout on her own channel.`;
          return output;
        }
      
        if (recipient === messageObject.tags.username) {
          output = `Nice try @${recipient}, you can't give yourself a shoutout!`;
          return output;
        }

        let streamerData;

        try {
          streamerData = await Streamer.getCurrentStreamerData(recipient);
        } catch(e) {
          logError('Error occurred while retrieving streamer data in the shoutout command', fileName);
          logError(e, fileName);
        }

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
      
        return shoutout;
    },
    {refsMessage:true, modOnly:true, cooldown_ms:0}
  ),

  uptime: new AsyncTwitchCallbackCommand('uptime', 
    async () => {
      let streamerData;
      try {
        streamerData = await Streamer.getCurrentStreamerData(bexxteConfig.channelName);
      } catch(e) {
        logError('Error occurred while retrieving streamer data in the uptime command', fileName);
        logError(e, fileName);
      }

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

      return uptimeOutput;
    }
  ),

  test: new TwitchCounterCommand('test',
    {
      set: evaluation => {
        if (evaluation.successful) {
          return `You have set the test count to ${evaluation.endValue}.`;
        }
        return `Sorry, I was not able to set the test count to "${evaluation.attempt}". Please make sure you use a number argument. The current test count is ${evaluation.endValue}.`;
      },
      add: evaluation => {
        return `You have increased the test value by 1. The new test value is ${evaluation.endValue}.`;
      },
      show: evaluation => {
        return `The current test value is ${evaluation.endValue}.`;
      }
    },
    {
      aliases: 'tests'
    }
  ),

  bop: new TwitchCounterCommand('bop',
    {
      set: evaluation => {
        if (evaluation.successful) {
          return `You have set the number of bops to ${evaluation.endValue} bexxteBonk`;
        }
        return `Sorry, I was not able to set !bops to "${evaluation.attempt}". Please make sure you use a number. Currently, chat has been bopped ${evaluation.endValue} times.`;
      },
      add: evaluation => {
        return `Chat has been bopped for being horny on main bexxteBonk Y'all been horny (at least) ${evaluation.endValue} times so far for Yakuza.`;
      },
      show: evaluation => {
        return `Chat has been horny for Yakuza ${evaluation.endValue} times`;
      }
    },
    {
      aliases: 'bops'
    }
  )

  // POSTERITY COMMANDS

  // goals: new TwitchCommand('goals', "I'm hoping to hit 500 followers by the end of the year! So if you're enjoying what you see, feel free to hit the heart to help me get there! bexxteLove"),

  // nqny: new TwitchCommand('nqny', "December 30th is Not Quite New Years: Round 2! Starting at 2PM eastern I'll be streaming for twelve hours as a celebration for this past year of streams and party with chat! We'll follow up from last year's stream with Spyro 2, a Fishing Minigame tier list, Alien Isolation Nightmare mode, Steam Giftcard Giveaways, and more!"),

  // donate: new TwitchCommand('donate', "For $5 you get a random doodle, at $15 you get to choose what I draw for you (sfw). You can only get 2 drawings per donation. I'll do these in a bad art stream near the end of the month. If you'd like to donate to support the National Children's Alliance and their campaign against child abuse, click here: https://donate.tiltify.com/@bexxters/itsyourbusiness Thank you for your generosity!"),

  // nca: new TwitchCommand('nca', "Child abuse thrives when good people decide its none of their business. Throughout the month of April, we will be raising funds for The National Children's Alliance. The NCA maintains thousands of Child Advocacy Centers - safe havens for children to grow, recover, and achieve justice. Find out more about how the NCA helps children here: https://www.nationalchildrensalliance.org"),

  // ms: new TwitchCommand('ms', "Multiple Sclerosis is a disease that impacts the nervous system. It causes the immune system to damage myelin, the coating of our nerve fibers. This causes an array symptoms such as numbness, tingling, mood changes, memory problems, pain, fatigue, or in extreme cases - blindness and/or paralysis. There is currently no known cause or cure."),

};

module.exports = { commands };