const { logError } = require('../../utils.js');
const { Timer } = require('../../Timer.js');
const { TiwtchMessage } = require('../../TwitchCommand.js');
const { config } = require('./configuration.js');

const twitchTimer = new Timer(720000, 1380000, { commands: config.timerCommands });
const dwarvenVowTimer = new Timer(1800000, 900000, { gameTitle: 'Tales of Symphonia', outputs: config.dwarvenVows });

const timers = [
    twitchTimer, dwarvenVowTimer
];

module.exports = { timers };