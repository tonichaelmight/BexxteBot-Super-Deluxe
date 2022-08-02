const fs = require('fs');
const path = require('path');

const logError = (errorMessage, fileName) => {
  try {
    const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' });
    const datePlusError = `\n${fileName} :: ${currentDateAndTime} :: ${errorMessage}\n`;
    fs.appendFile('error.txt', datePlusError, appendError => {
      if (appendError) throw appendError;
    });
  } catch (innerError) {
    console.log('an error occurred while trying to log an error :/');
    console.log(innerError);
  }
}

module.exports = {
  logError
}