import chalk from 'chalk';

function logger(prefix, color, isReturn) {
   return function (message, file = '', context = '') {
      const indent = ' '.repeat(prefix.length + 1);
      
      if (typeof message === 'string')
         message = [message];

      let res = chalk[color](prefix);

      if (file !== '')
         message[0] = message[0] +
            ' - ' + chalk.grey(file);

      if (context !== '')
         message.push(`\n${chalk.red('Context:')} ${context}`);
      
      message.forEach((line, i) => {
         if (line.startsWith('\n'))
            res += line;
         else
            res += (i > 0 ? '\n' + indent : ' ') + line;
      });
      
      res = '\n' + res;
      
      if (isReturn)
         return res;
      else
         console.log(res);
   }
}

export const logError = logger('Error:', 'red', false);
export const logWarn = logger('Warn:', 'yellow', false);
export const genError = logger('Error:', 'red', true);
export const genWarn = logger('Warn:', 'yellow', true);

export const logInfo = message => console.log(chalk.grey(message));
export const logOk = message => console.log(chalk.green(message));