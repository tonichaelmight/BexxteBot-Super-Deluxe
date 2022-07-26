const { Streamer } = require('./Streamer.js');
const { bexxteConfig } = require('./configuration.js');

const bexxters = new Streamer('bexxters');

// TIMER CLASS
class Timer {
  constructor(commands, min, range, gameTitle = '') {
    this.commands = commands;
    this.min = min;
    this.range = range;
    this.gameTitle = gameTitle;
    this.previous = [];
  }

  getRandomIndex() {
    return Math.floor(Math.random() * this.commands.length);
  }

  async getTimerOutput() {

    return new Promise(resolve => {
      setTimeout(async () => {

        let result;
        const bexxtersData = await bexxters.getCurrentStreamerData();
        const live = bexxtersData.is_live;
        const currentGame = this.gameTitle ? bexxtersData.game_name : '';

        if (live && currentGame === this.gameTitle) {
          let i = this.getRandomIndex();
          while (this.previous.includes(i)) {
            i = this.getRandomIndex();
          }
          result = this.commands[i]
          this.previous.push(i);

          if (this.previous.length > 3) {
            this.previous.shift();
          }
        } else {
          // resets the previous array for next stream
          this.previous = [];
          result = null;
        }
        
        resolve(result);

      }, Math.floor(Math.random() * this.range) + this.min);
    }); 
  }
}

const twitchTimer = new Timer(bexxteConfig.timerCommands, 720000, 1380000); // 12 - 35 minutes (range 23)
const dwarvenVowTimer = new Timer(bexxteConfig.dwarvenVows, 720000, 1380000, 'Tales of Symphonia');

module.exports = { twitchTimer, dwarvenVowTimer };