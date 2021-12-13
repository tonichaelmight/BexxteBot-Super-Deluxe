const ev = require('./ev.js'); // environment variables

class Timer {
  constructor(commands) {
    this.commands = commands;
    this.previous = [];
  }

  getRandomIndex() {
    return Math.floor(Math.random() * this.commands.length);
  }

  async getTimerOutput() {
    let i = this.getRandomIndex();
    while (this.previous.includes(i)) {
      i = this.getRandomIndex();
    }

    this.previous.push(i);

    if (this.previous.length > 3) {
      this.previous.shift();
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.commands[i]);
      }, Math.floor(Math.random() * 1380000) + 720000);
    }); 
  }
}

const twitchTimer = new Timer([
  'discord',
  'prime',
  'follow',
  'sub',
  'bexxtebot',
  'bttv',
  'goals'
])

module.exports = { twitchTimer };