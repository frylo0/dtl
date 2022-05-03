/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 18:58:54
 * Company: frity corp.
 */

import readline from 'readline';
const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});

export async function prompt(question) {
   return new Promise(res => {
      rl.question(question, response => res(response));
   });
}

export async function ask(question, yesCallback, noCallback) {
   let response = await prompt(question);
   if (/y(es)?/i.test(response)) {
      await yesCallback();
      return true;
   } else {
      await noCallback();
      return false;
   }
}