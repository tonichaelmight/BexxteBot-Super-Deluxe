const ev = require('./ev.js');
const { TwitchResponse } = require('./TwitchResponse.js');

class TwitchMessage {
  constructor(channel, tags, message, self) {
    this.channel = channel;
    this.tags = tags;
    this.content = message.toLowerCase();
    this.self = self || tags.username.match(/bexxtebot/i);
  }

  needsModeration() {
    return !(this.tags.mod || (this.tags.badges && this.tags.badges.vip) || this.tags.username === this.channel.slice(1));
  }

  addResponse(output, mean=false) {
    if (!Array.isArray(output)) {
      output = [output]
    }
    const result = output.map(line => {
      return new TwitchResponse(line, mean);
    })
    if (this.response) {
      this.response.push(...result);
    } else {
      this.response = result;
    }
  }

  static generateDummyMessage(channel, messageText='') {
    return new TwitchMessage(
      channel,
      { mod: true, username: '' },
      messageText,
      false
    )
  }

}

module.exports = { TwitchMessage };

/*
TwitchMessage {
  channel: '#tonichaelmight',
  tags: {
    'badge-info': null,
    badges: { broadcaster: '1' },
    'client-nonce': 'fb4262fc788ad46e1463213954fa863c',
    color: '#5D00FF',
    'display-name': 'tonichaelmight',
    emotes: null,
    'first-msg': false,
    flags: null,
    id: '5c25e038-2332-4817-a3d1-03e76caf7d5e',
    mod: false,
    'returning-chatter': false,
    'room-id': '177286899',
    subscriber: false,
    'tmi-sent-ts': '1658817075443',
    turbo: false,
    'user-id': '177286899',
    'user-type': null,
    'emotes-raw': null,
    'badge-info-raw': null,
    'badges-raw': 'broadcaster/1',
    username: 'tonichaelmight',
    'message-type': 'chat'
  },
  content: 'hm',
  self: null
}
*/