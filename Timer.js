const ev = require('./ev.js'); // environment variables
const { Streamer } = require('./Streamer.js');
const { bexxteConfig } = require('./config.js');

const bexxters = new Streamer('bexxters');

// TIMER CLASS
class Timer {
  constructor(commands, min, range) {
    this.commands = commands;
    this.min = min;
    this.range = range;
    this.previous = [];
  }

  getRandomIndex() {
    return Math.floor(Math.random() * this.commands.length);
  }

  async getTimerOutput() {
    let result;
    const bexxtersData = await bexxters.getCurrentStreamerData();
    const live = bexxtersData.is_live;

    if (live) {
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
      result = null;
    }

    return new Promise(resolve => {
      setTimeout(() => {
        //console.log(result);
        resolve(result);
      }, Math.floor(Math.random() * this.range) + this.min);
    }); 
  }
}

class GameTimer extends Timer {
  constructor(commands, min, range, name) {
    super(commands, min, range);
    this.name = name;
    this.previous = [];
  }

  async getTimerOutput() {
    let result;
    const bexxtersData = await bexxters.getCurrentStreamerData();
    const live = bexxtersData.is_live;
    const currentGame = bexxtersData.game_name;

    if (live && currentGame === this.name) {
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
      result = null;
    }

    return new Promise(resolve => {
      setTimeout(() => {
        //console.log(result);
        resolve(result);
      }, Math.floor(Math.random() * this.range) + this.min);
    }); 
  }
}

const twitchTimer = new Timer(bexxteConfig.timerCommands, 720000, 1380000); // 12 - 35 minutes (range 23)
const dwarvenVowTimer = new GameTimer(bexxteConfig.dwarvenVows, 720000, 1380000, 'Tales of Symphonia');

module.exports = { twitchTimer, dwarvenVowTimer };