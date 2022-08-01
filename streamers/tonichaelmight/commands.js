const { logError } = require('../../utils.js');
const { TwitchCommand, TwitchTimerCommand } = require('../../TwitchCommand.js');
const { Streamer } = require('../../Streamer.js');
const { config } = require('./configuration.js');

const Database = require("@replit/database");
const db = new Database();


const commands = {

  // BASIC COMMANDS

  bexxtebot: new TwitchCommand('bexxtebot', 'Hey there everyone, my name is BexxteBot! I am a custom chat bot designed specifically for this channel; if you see me do or say anything crazy, make sure to let @bexxters or @tonichaelmight know so that it can be fixed ASAP. Happy Chatting! bexxteLove'),

  blm: new TwitchCommand('blm', 'Black Lives Matter. Follow this link to learn about ways you can support the movement: https://blacklivesmatters.carrd.co'),

  bttv: new TwitchCommand('bttv', 'Install bttv here (https://betterttv.com/) to use these cool emotes: blobDance monkaTOS catblobDance hypeE think3D HYPERS elmoFire WEEWOO WELCOME nutButton ChefsKiss KEKW OhMyPoggies peepoRiot HoldIt'),

  discord: new TwitchCommand('discord', `Join the Basement Party and hang out offline here: ${config.discordServerLink}`),

  follow: new TwitchCommand('follow', 'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!'),

  //lurk: new TwitchCommand('lurk', '${messageObject.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy', {refsMessage: true}), 
  // will rewrite as just having a callback, this is a lil extra
  
  prime: new TwitchCommand('prime', 'Link your amazon prime to twitch to get a free sub every month and put those Bezos Bucks to work'),

  raid: new TwitchCommand('raid', "Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove", {cooldown_ms: 0, modOnly: true}),

  socials: new TwitchCommand('socials', `Come follow me on these other platforms as well!         
  ||     Twitter: ${config.socials.twitter}      
  ||     TikTok: ${config.socials.tiktok}
  ||     YouTube: ${config.socials.youtube}`),

  stap: new TwitchCommand('stap', 'stop flaming ok! I dnt ned all da negatwiti yo ar geveng me right nau! bexxteGun'),

  sub: new TwitchCommand('sub', 'Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove'),

  welcome: new TwitchCommand('welcome', 'his has bondage to you too owo WELCOME'),

  whomst: new TwitchCommand('whomst', "I'm a Variety Streamer mostly streaming RPGs, Horror, and Indie stuff because I'm not good at Battle Royale FPS games and can't commit to MMOs. You can catch me live Sunday through Thursday at 8:00pm EST! We do Spooky Sunday with horror/suspense games every Sunday!", {cooldown_ms:2000}),

  youtube: new TwitchCommand('youtube', `Check out edited short plays and full stream uploads over on my Youtube: ${config.socials.youtube}`),

  // PEOPLE COMMANDS -- SUBSET OF BASIC

  marta: new TwitchCommand('marta', '​Check out (and maybe commission) our UwUest mod and amazing artist Marta over at https://twitter.com/_martuwu or https://martuwuu.carrd.co', {cooldown_ms:5000}),

  tim: new TwitchCommand('tim', 'my partner of 7 years. person I complain to when my stream randomly dies. pretty cool dude.', {cooldown_ms:5000}),

  yackie: new TwitchCommand('yackie', 'Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat!', {cooldown_ms:5000}),

};


module.exports = { commands };