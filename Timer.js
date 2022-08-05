const { bexxteConfig } = require('./streamers/bexxters/configuration.js');
const { TwitchMessage } = require('./TwitchMessage.js');

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
    if (this.options.commands) {
      return Math.floor(Math.random() * this.options.commands.length);
    } else if (this.options.outputs) {
      return Math.floor(Math.random() * this.options.outputs.length)
    }
    
  }

  async getTimerOutput() {

    return new Promise(resolve => {
      setTimeout(async () => {

        const streamerData = await this.streamer.getCurrentStreamerData();
        const live = streamerData.is_live;
        const currentGame = this.options.gameTitle ? streamerData.game_name : undefined;

        let dummyMessage;

        if (live && currentGame === this.options.gameTitle) {
          let i = this.getRandomIndex();
          while (this.previous.includes(i)) {
            i = this.getRandomIndex();
          }

          if (this.options.commands) {
            dummyMessage = TwitchMessage.generateDummyMessage(`#${this.streamer.username}`, `!${this.options.commands[i]}`);
            await this.streamer.bot.processTwitchMessage(dummyMessage)
          } else if (this.options.outputs) {
            dummyMessage = TwitchMessage.generateDummyMessage(`#${this.streamer.username}`);
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

  async start() {
    while(true) {
      await this.getTimerOutput();
    }
  }
}

module.exports = { Timer };