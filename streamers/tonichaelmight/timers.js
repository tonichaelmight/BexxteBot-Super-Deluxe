import Timer from '../../Timer.js';
import { bexxteConfig } from './configuration.js';

const twitchTimer = new Timer(720000, 1380000, { commands: bexxteConfig.timerCommands });
const dwarvenVowTimer = new Timer(1800000, 900000, { gameTitle: 'Tales of Symphonia', outputs: bexxteConfig.dwarvenVows });

export const timers = [
    twitchTimer, dwarvenVowTimer
];