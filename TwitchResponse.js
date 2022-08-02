class TwitchResponse {
  
  constructor(output, mean=false) {
    if (!output) throw new Error('A TwitchResponse\'s output cannot be empty');
    this.output = output;
    this.mean = mean;
  }

}

module.exports = { TwitchResponse }