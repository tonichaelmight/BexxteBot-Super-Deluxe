import fs from 'fs';

const writeToErrorFile = (content) => {
  fs.appendFile('error.txt', content, appendError => {
    if (appendError) throw appendError;
  });
}

export const logError = (error) => {
  try {
    const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' });
    const datePlusError = `${currentDateAndTime} \n${error.stack}\n`;
    
    writeToErrorFile(datePlusError);
    writeToErrorFile('-------------------------------------\n');
    
  } catch (innerError) {
    console.log('an error occurred while trying to log an error :/');
    console.log(innerError);
  }
}