// if you're trying to make a new command, this is the right page; scroll down a bit further
const { logError } = require('./utils.js');
const fileName = require('path').basename(__filename);

// Basic commands will yield the same output every time they are executed -- foundation for more specialized command types
class TwitchCommand {

  constructor(name, commandText, options={}) {
    this.name = name;
    this.commandText = commandText;

    this.options = {};
    this.options.cooldown_ms = options.cooldown_ms !== undefined ? options.cooldown_ms : 10000;
    this.options.modOnly = options.modOnly || false;
    
    if (options.aliases) {
      if (Array.isArray(options.aliases)) {
        this.options.aliases = options.aliases;
      } else {
        this.options.aliases = [options.aliases];
      }
    }

    this.onCooldown = false;
  }

  createCooldown() {
    this.onCooldown = true;
    setTimeout(() => {
      this.onCooldown = false;
    }, this.options.cooldown_ms);
  }

  execute(messageObject) {
    //console.log(messageObject);
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.options.modOnly || this.onCooldown) {
        return;
      }
    }

    if (this.options.cooldown_ms) {
      this.createCooldown();
    }

    try {
      messageObject.addResponse(this.commandText);
    } catch (e) {
      logError(`Problem executing the ${this.name} command`, fileName);
      logError(e, fileName);
    }
  }
}

// Commands that do more than just yield the same text every time
class TwitchCallbackCommand extends TwitchCommand {

  constructor(name, callback, options={}) {
    super(name, undefined, options);
    delete this.commandText;
    this.callback = callback;

    this.options.refsMessage = options.refsMessage || false;
  }

  execute(messageObject) {
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.options.modOnly || this.onCooldown) {
        return;
      }
    }

    if (this.options.cooldown_ms) {
      this.createCooldown();
    }

    try {
      this.options.refsMessage ? messageObject.addResponse(this.callback(messageObject)) : messageObject.addResponse(this.callback());
    } catch (e) {
      logError(`Problem executing the ${this.name} command`, fileName);
      logError(e, fileName);
    }

  }

}

// Commands that use an asynchronous callback function
class AsyncTwitchCallbackCommand extends TwitchCallbackCommand {

  constructor(name, callback, options={}) {
    super(name, callback, options);
  }

  async execute(messageObject) {
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.options.modOnly || this.onCooldown) {
        return;
      }
    }

    if (this.options.cooldown_ms) {
      this.createCooldown();
    }

    try {
      this.options.refsMessage ? messageObject.addResponse(await this.callback(messageObject)) : messageObject.addResponse(await this.callback());
    } catch (e) {
      logError(`Problem executing the ${this.name} command`, fileName);
      logError(e, fileName);
    }

  }

}



// CURRENT WORK
class TwitchCounterCommand extends TwitchCommand {

  constructor(name, callback, cooldown_ms = 10000) {
    super(name, callback, cooldown_ms);
    // twitchCommands[name] = this;
    // twitchCommands[`${name}s`] = this;
  }

  async evaluateMessage(messageObject) {
    const messageWords = messageObject.content.split(' ');
    const command = messageWords[0].slice(1);
    const evaluation = {};

    //console.log(command);

    if (command === this.name) {
      if (messageObject.tags.mod || messageObject.tags.username === messageObject.channel.slice(1)) {
        if (messageWords[1] === 'set') {
          evaluation.action = 'set';
          const newValue = messageWords[2];
          const setSuccess = await this.setValue(newValue);
          if (setSuccess) {
            evaluation.successful = true;
            evaluation.endValue = newValue;
          } else {
            evaluation.successful = false;
            evaluation.endValue = await this.getValue();
            evaluation.attempt = newValue;
          }
        } else {
          evaluation.action = 'add';
          const currentValue = await this.getValue();
          const newValue = currentValue * 1 + 1;
          await this.setValue(newValue);
          evaluation.endValue = newValue;
        }
      } else {
        return;
      }
    } else if (command === `${this.name}s`) {
      evaluation.action = 'show';
      evaluation.endValue = await this.getValue();
    }

    return evaluation;

  }

  async setValue(newValue) {
    if (Number.isNaN(newValue * 1)) {
      return false;
    }
    await db.set(this.name, newValue);
    return true;
  }

  async getValue() {

    let currentValue = await db.get(this.name);

    if (!currentValue) {
      currentValue = 0;
    }

    return currentValue;
  }

  async execute(messageObject) {
    //console.log(messageObject);
    if (!messageObject.tags.mod && !(messageObject.tags.username === messageObject.channel.slice(1))) {
      if (this.modOnly || this.onCooldown) {
        return;
      }
    }

    let evaluation;

    if (messageObject.tags.mod || messageObject.tags.username === messageObject.channel.slice(1)) {
      evaluation = await this.evaluateMessage(messageObject);
    }

    //console.log(evaluation);

    if (this.cooldown_ms) {
      this.createCooldown();
    }

    try {
      if (!evaluation) {
        return;
      }
      await this.callback(messageObject, evaluation);
      return;
    } catch (e) {
      logError(`Problem executing the ${this.name} command`, fileName);
      logError(e, fileName);
    }
  }
}

module.exports = { TwitchCommand, TwitchCallbackCommand, AsyncTwitchCallbackCommand, TwitchCounterCommand };

const test = new TwitchCounterCommand('test', testCallback);
async function testCallback(messageObject, evaluation) {

  switch (evaluation.action) {
    case 'set':
      if (evaluation.successful) {
        messageObject.addResponse(
          `You have set the test count to ${evaluation.endValue}.`
        )
        break;
      } else {
        messageObject.addResponse(
          `Sorry, I was not able to set the test count to "${evaluation.attempt}". Please make sure you use a number argument. The current test count is ${evaluation.endValue}.`
        )
        break;
      }

    case 'add':
      messageObject.addResponse(
        `You have increased the test value by 1. The new test value is ${evaluation.endValue}.`
      )
      break;

    case 'show':
      messageObject.addResponse(
        `The current test value is ${evaluation.endValue}.`
      )
      break;
  }
}

const bop = new TwitchCounterCommand('bop', bopCallback);
async function bopCallback(messageObject, evaluation) {

  switch (evaluation.action) {
    case 'set':
      if (evaluation.successful) {
        messageObject.addResponse(
          `You have set the number of bops to ${evaluation.endValue} bexxteBonk`
        )
        break;
      } else {
        messageObject.addResponse(
          `Sorry, I was not able to set !bops to "${evaluation.attempt}". Please make sure you use a number. Currently, chat has been bopped ${evaluation.endValue} times.`
        )
        break;
      }

    case 'add':
      messageObject.addResponse(
        `Chat has been bopped for being horny on main bexxteBonk Y'all been horny (at least) ${evaluation.endValue} times so far for Yakuza.`
      )
      break;

    case 'show':
      messageObject.addResponse(
        `Chat has been horny for Yakuza ${evaluation.endValue} times`
      )
      break;
  }

}


// const test = new TwitchCommand('test', testCallback);
// function testCallback(messageObject) {
//   let current = fs.readFileSync(`counters/${this.name}.txt`, 'utf-8');

//   current *= 1;
//   let neue;

//   if (Number.isNaN(current)) {
//     neue = 0;
//   } else {
//     neue = current + 1;
//   }

//   fs.writeFileSync(`counters/${this.name}.txt`, neue);

//   messageObject.addResponse(`You have tested ${neue} times.`);

// }



