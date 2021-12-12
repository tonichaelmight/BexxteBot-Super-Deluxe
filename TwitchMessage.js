const ev = require('./ev.js');
const { TwitchResponse } = require('./TwitchResponse.js');

class TwitchMessage {
  constructor(channel, tags, message, self) {
    this.channel = channel;
    this.tags = tags;
    this.content = message;
    this.self = self || tags.username.match(/bexxtebot/i);
  }

  needsModeration() {
    return !(this.tags.mod || (this.tags.badges && this.tags.badges.vip) || this.tags.username === ev.CHANNEL_NAME);
  }

  addResponse(output, mean=false) {
    this.response = new TwitchResponse(output, mean);
  }

}

module.exports = { TwitchMessage };