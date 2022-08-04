const { Streamer } = require('./Streamer.js');
const { bexxteConfig } = require('./streamers/bexxters/configuration.js');
const { TwitchMessage } = require('./TwitchMessage.js');

const bexxters = new Streamer('bexxters');

// TIMER CLASS
class Timer {
  constructor(min, range, options={}) {
    this.min = min;
    this.range = range;

    this.options = {};
    this.options.commands = options.commands || undefined;
    this.options.gameTitle = options.gameTitle || undefined;
    this.options.outputs = options.outputs || undefined;

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
        const currentGame = this.options.gameTitle ? bexxtersData.game_name : undefined;

        let dummyMessage;

        if (live && currentGame === this.options.gameTitle) {
          let i = this.getRandomIndex();
          while (this.previous.includes(i)) {
            i = this.getRandomIndex();
          }

          if (this.options.commands) {
            dummyMessage = TwitchMessage.generateDummyMessage(`!${this.options.commands[i]}`);
            await this.streamer.bot.processTwitchMessage(dummyMessage)
          } else if (this.options.outputs) {
            dummyMessage = TwitchMessage.generateDummyMessage();
            dummyMessage.addResponse(this.options.outputs[i]);
            this.streamer.bot.speakInTwitch(dummyMessage);
          } else {
            throw new Error('Timer has no commands or outputs');
          }

          this.previous.push(i);

          if (this.previous.length > 3) {
            this.previous.shift();
          }
        } else {
          // resets the previous array for next stream
          this.previous = [];
          dummyMessage = null;
        }
        
        resolve(dummyMessage);

      }, Math.floor(Math.random() * this.range) + this.min);
    }); 
  }

  start() {

  }
}

const twitchTimer = new Timer(bexxteConfig.timerCommands, 720000, 1380000); // 12 - 35 minutes (range 23)
const dwarvenVowTimer = new Timer(bexxteConfig.dwarvenVows, 1800000, 900000, 'Tales of Symphonia'); // 30 - 45 minutes (range 15)

module.exports = { twitchTimer, dwarvenVowTimer };