const twitchCommands = {};

class TwitchCommand {

  constructor(name, callback, modOnly=false, cooldown_ms=10000, parameters=['mod', 'channel'], returnModifier='t') {
    this.name = name;
    this.callback = callback;
    this.modOnly = modOnly;
    this.cooldown_ms = cooldown_ms;
    this.parameters = parameters;
    this.returnModifier = returnModifier;
    this.onCooldown = false;
    twitchCommands[name] = this;
  }

  createCooldown() {
    this.onCooldown = true;
    setTimeout(() => {
      this.onCooldown = false;
    }, this.cooldown_ms);
  }

  execute(params) {
    if (!params.mod) {
      if (this.modOnly || this.onCooldown) {
        return null
      }
    }
    console.log(this.onCooldown);
    this.createCooldown();
    return this.callback(params);
  }

}


const ghostconCallback = (params) => {
  return {
    modifier: 't',
    output: 'I\'m thrilled to announce I\'ll be participating in GhostCon! A virtual convention taking place Halloween weekend celebrating spooky streamers and artists! I\'ll be live to celebrate on Sunday, Oct 31 at 8pm! Find out more here: https://ghostcon.net/about.php',
    channel: params.channel
  };
}
const ghostcon = new TwitchCommand('ghostcon', ghostconCallback);



module.exports = twitchCommands;