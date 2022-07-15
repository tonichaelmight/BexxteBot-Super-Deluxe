const ev = require('./ev.js'); // environment variables
const { bexxters } = require('./bexxters.js');
const { bexxteConfig } = require('./config.js');

// TIMER CLASS
class Timer {
  constructor(commands) {
    this.commands = commands;
    this.previous = [];
  }

  getRandomIndex() {
    return Math.floor(Math.random() * this.commands.length);
  }

  async getTimerOutput() {
    let result;
    const live = await bexxters.isLive();

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
      }, Math.floor(Math.random() * 1380000) + 720000);
      // 12 - 35 minutes
    }); 
  }
}

const twitchTimer = new Timer(bexxteConfig.timerCommands);

module.exports = { twitchTimer };