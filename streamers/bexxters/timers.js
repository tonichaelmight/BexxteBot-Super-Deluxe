const { Timer } = require('../../Timer.js');
const { bexxteConfig } = require('./configuration.js');

const twitchTimer = new Timer(720000, 1380000, { commands: bexxteConfig.timerCommands });
const dwarvenVowTimer = new Timer(1800000, 900000,{ gameTitle: 'Tales of Symphonia', outputs: bexxteConfig.dwarvenVows });

const timers = [
    twitchTimer, dwarvenVowTimer
];

module.exports = { timers }; 