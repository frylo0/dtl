/** 
 * @package Directory TempLate creator
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
 */
   

import { loadConfig } from './utils/load-config.mjs';

import fs from 'fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import $new from './commands/new.mjs';
import $list from './commands/list.mjs';
import $def from './commands/def.mjs';


const config = loadConfig();

if (!fs.existsSync(config.TPL_FOLDER)) {
   fs.mkdirSync(config.TPL_FOLDER, {recursive: true});
}


yargs(hideBin(process.argv))

   .command('list', 'Show all available templates', yargs => yargs,
      (argv) => $list(argv, config))


   .command('new <templateName> <folderName>', 'Creates directory with template contents', yargs => yargs
      .positional('templateName', {
         describe: `Name of template folder from "${config.TPL_FOLDER}"`
      })
      .positional('folderName', {
         describe: 'Name of folder to be created'
      }),
      (argv) => $new(argv, config))

      
   .parse();
