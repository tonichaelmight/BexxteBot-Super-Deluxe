const ev = require('./ev.js'); // environment variables
const twitchCommands = require('./twitch-commands.js');

class Response {
  constructor(modifier, output, channel) {
    this.modifier = modifier;
    this.output = output;
    this.channel = channel;
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

  const lurkCheck = /(?<!(\w))!lurk(?!(\w))/;

  if (lurkCheck.test(parsedMessage)) {
    return new Response(
      't', 
      `${message.tags.username} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`,
      message.channel
    );
  }

  if (!parsedMessage.startsWith('!')) {
    return null;
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
          commandParameters[p] = messageWords[1];
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

    if (commandResult.modifier) {
      return new Response(
        commandResult.modifier,
        commandResult.output,
        commandResult.channel
      );
    } else {
      let responseOutput = [];
      for (const comRes of commandResult) {
        responseOutput.push(new Response(
          comRes.modifier,
          comRes.output,
          comRes.channel
        ));
      }

      return responseOutput;
    }
    
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