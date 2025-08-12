/** 
 * @package Directory TempLate creator
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
 */
   

import { loadConfig } from './utils/load-config.mjs';

import fs from 'fs';

import yargsCore from 'yargs';
import { hideBin } from 'yargs/helpers';

import $new from './commands/new.mjs';
import $list from './commands/list.mjs';
import $def from './commands/def.mjs';
import $ren from './commands/ren.mjs';
import $dup from './commands/dup.mjs';

const config = loadConfig();

if (!fs.existsSync(config.TPL_FOLDER)) {
   fs.mkdirSync(config.TPL_FOLDER, {recursive: true});
}


const yargs = yargsCore(hideBin(process.argv));

yargs
   .command('list', 'Show all available templates', yargs => yargs,
      (argv) => $list(argv, config))

   .command('new <templateName> <name> [targetFolderPath]', 'Creates directory with template contents', yargs => yargs
      .positional('templateName', {
         describe: `Name of template folder from "${config.TPL_FOLDER}"`
      })
      .positional('name', {
         describe: `Name in pascal case to be used in given template in all available DTL cases. Could be a path, if [targetFolderPath] not provided (in this case name will be taken as <name> of target folder)`
      })
      .positional('targetFolderPath', {
         describe: 'Path to folder where to place generated template instance.'
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

   .command('ren <name> <newName> [files..]', 'Renames filenames and occurrences in files from <name> to <newName> in any letter case.', yargs => yargs
      .positional('name', {
         describe: `The current name of entity in pascal case. This name will be replaced, no matter in what letter case it will be found. If no files provided, also directory to be used as template base.`
      })
      .positional('newName', {
         describe: `Value in pascal case to be set instead on <name>. This value will be converted to matching letter case.`
      })
      .positional('files', {
         describe: 'Files to be using while renaming, usually you will add a single folder.'
      }),
      (argv) => $ren(argv, config))

   .command('dup <name> <newName> [files..]', 'Duplicate files. Copy files and replace <name> in content and filenames with <newName>.', yargs => yargs
      .positional('name', {
         describe: `The current name of entity in pascal case. This name will be replaced, no matter in what letter case it will be found. If no files provided, also directory to be used as template base.`
      })
      .positional('newName', {
         describe: `Value in pascal case to be set instead on <name>. This value will be converted to matching letter case.`
      })
      .positional('files', {
         describe: 'Files to be using while renaming, usually you will add a single folder.'
      }),
      (argv) => $dup(argv, config))

yargs
   .wrap(yargs.terminalWidth())
   .parse();

// TODO: Use yargs in tests to work with commands
// TODO: Add tests to file exists cases
// TODO: Add tests to cancel cases
// TODO: Add tests for partial replacement for $new command
// TODO: Add tests for syntax checks of $new command
// TODO: Use inquire.js for prompts
// TODO: Add bin file to package.json
// TODO: Terminal autocomplete