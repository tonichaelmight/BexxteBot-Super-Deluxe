const ev = require('./ev.js'); // environment variables
const twitchCommands = require('./twitch-commands.js');
const { bexxteConfig } = require('./config.js');

const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

class Response {
  constructor(modifier, output, channel, target=null) {
    this.modifier = modifier;
    this.output = output;
    this.channel = channel;
    this.target = target;
  }
}

const parseTwitchMessage = async message => {

  /**
   * ORDER
   * CONVERT TO LOWERCASE
   * IS SENDER MOD/VIP
   * MODERATION WOULD GO HERE
   * LURK COMMAND (SHE DIFFERENT)
   * CHECK FOR ! AT THE BEGINNING - DROP OTHERWISE
   * REMOVE ! AND ISOLATE COMMAND
   * CHECK COMMAND PARAMS
   * 
   * EXECUTE COMMAND
   * CREATE COOLDOWN
   * CREAT OUTPUT
   * RETURN OUTPUT
   */

  const isMod = (message.tags.mod || message.tags.username === ev.CHANNEL_NAME);

  const rawMessage = message.content;

  let parsedMessage = rawMessage.toLowerCase();

  let response;

  if (!isMod) {
    bexxteConfig.forbidden.forEach(word => { 
      if (parsedMessage.includes(word)) {
        response = new Response(
          'tm',
          `Naughty naughty, @${message.tags.username}! We don't use that word here`,
          message.channel,
          message.tags.username
        );
      }
    });
  }

  

  if (response) {
    return response;
  }

  if (lurkCheck.test(parsedMessage)) {
    response = new Response(
      't', 
      `${message.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`,
      message.channel
    );
  }

  if (response) {
    return response;
  }

  if (!parsedMessage.startsWith('!')) {
    return {};
  }

  parsedMessage = parsedMessage.slice(1);

  const messageWords = parsedMessage.split(' ');

  const command = messageWords[0];

  // console.log(command);

  if (twitchCommands[command]) {

    // console.log('hello');
    
    commandParameters = {};
    twitchCommands[command].parameters.forEach(p => {
      switch (p) {
        case 'mod':
          commandParameters[p] = isMod;
          break;
        case 'argument1':
          commandParameters[p] = messageWords[1] || null;
          break;
        case 'sender':
          commandParameters[p] = message.tags.username;
          break;
        default:
          throw new Error("Unknown parameter!!");
      }
    });

    // console.log(commandParameters);

    const commandResult = await twitchCommands[command].execute(commandParameters);

    // console.log(commandResult);

    if (!commandResult) {
      return null;
    }

    if (commandResult.modifier) {
      response = new Response(
        commandResult.modifier,
        commandResult.output,
        commandResult.channel
      );
    } else {
      response = [];
      for (const comRes of commandResult) {
        response.push(new Response(
          comRes.modifier,
          comRes.output,
          comRes.channel
        ));
      }
    }
    
  }

  if (response) {
    return response;
  }

  return null;

}

exports.parseMessage = (modifier, message) => {
  switch (modifier) {

    case 't':
      return parseTwitchMessage(message);

    case 'd':
      return //parseDiscordMessage(message);

    default:
      console.log('how tf did we get here lol');
      return;

  }
}