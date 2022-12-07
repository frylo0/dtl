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


const theYargs = yargs(hideBin(process.argv));

theYargs
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


   .command('def <templateName> <name> [files..]', 'Creates new template from given files. If no files given looks for folder with <name> to use it as base of template', yargs => yargs
      .positional('templateName', {
         describe: `The name of result template. If no files provided, also directory to be used as template base.`
      })
      .positional('name', {
         describe: `Name in pascal case to be replaced in given files in all available DTL cases.`
      })
      .positional('files', {
         describe: 'Files to be added to template, usually you will add a single folder. All given files will be placed into template root.'
      }),
      (argv) => $def(argv, config))

theYargs
   .wrap(theYargs.terminalWidth())
   .parse() ;

// TODO: Use yargs in tests to work with commands
// TODO: Add tests to file exists cases
// TODO: Add tests to cancel cases
// TODO: Add tests for partial replacement for $new command