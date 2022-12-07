/** 
 * @package Directory TempLate creator
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
 */
   

import { ask } from './utils/prompt.mjs';
import { ERROR } from './utils/errors.mjs';
import { loadConfig } from './utils/load-config.mjs';
import { genWarn, logError, logInfo, logOk } from './utils/logger.mjs';
import { camelcase, kebabcase, lowercase, uppercase } from './utils/syntax.mjs';

import fs from 'fs';
import os from 'os';
import path from 'path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import chalk from 'chalk'

import runNew from './commands/new.mjs';
import runList from './commands/list.mjs';


const config = loadConfig();


function relatizePath(filenameAbs) {
   return path.relative(process.cwd(), filenameAbs);
}

function checkTemplateExists(templateName, checkContext = '') {
   const TARGET_TPL_FOLDER = getTemplatePath(templateName);
   const isExist = fs.existsSync(TARGET_TPL_FOLDER);

   if (!isExist) {
      logError(
         `Template "${chalk.blue(templateName)}" doesn't exist`,
      TARGET_TPL_FOLDER, checkContext);

      throw new Error(ERROR.TPL_NOT_EXIST);
   }
}

function getTemplatePath(templateName) {
   return path.join(TPL_FOLDER, templateName);
}

function insertData(string, name) {
   let now = new Date();

   let year = now.getFullYear() + '';
   let month = (now.getMonth() < 10 ? '0' : '') + (now.getMonth() + 1);
   let day = (now.getDate() < 10 ? '0' : '') + now.getDate();

   return string
      .replace(/([ \t]*?)-- From (.*?): Use (.*?); --/g, (...match) => {
         const [fulltext, indent, templateName, filePath] = match;

         checkTemplateExists(templateName, `-- From ${templateName}: Use ${filePath}; --`);
         
         const templateDir = getTemplatePath(templateName);
         const filePathAbs = path.join(templateDir, filePath);

         if (!fs.existsSync(filePathAbs)) {
            logError(
               `Can not use file that not exist`,
            filePathAbs, fulltext.trim());
            
            throw new Error(ERROR.USING_NOT_EXISTING);
         } 
         else if (fs.statSync(filePathAbs).isDirectory()) {
            logError(
               `Can not use directory`,
            filePathAbs, fulltext.trim());

            throw new Error(ERROR.USING_DIRECTORY);
         }

         else {
            let content = fs.readFileSync(filePathAbs).toString();
            
            content = content
               .split('\n')
               .map(line => indent + line)
               .join('\n'); // indent all lines

            return insertData(content, name);
         }
      })

      .replace(/--Name--/g, name)
      .replace(/--name--/g, lowercase(name))
      .replace(/--naMe--/g, camelcase(name))
      .replace(/--NAME--/g, uppercase(name))
      .replace(/--na-me--/g, kebabcase(name))
      
      .replace(/--DateTime--/g, `${year}-${month}-${day}, ${now.toLocaleTimeString()}`);
}

/**
 * Recursively create files by given template path in target folder.
 * @param {string} dirpathSrc Absolute path to template directory.
 * @param {string} dirpathTarget Relative path to target dir in current base directory.
 * @this {string} Base directory for relative dirpathTarget path. Usually `process.cwd()`.
 */
async function instantiate(dirpathSrc, dirpathTarget) {
   dirpathTarget = insertData(dirpathTarget, this)
   
   // For each file in current folder
   for (let filename of fs.readdirSync(dirpathSrc)) {
      if (filename === '.' || filename == '..') // Skip relative dirs
         continue;

      const filepathSrc = path.join(dirpathSrc, filename);
      const filepathTarget = path.join(dirpathTarget, insertData(filename, this));
      const filepathTargetRel = `./${relatizePath(filepathTarget)}`;

      const stat = fs.statSync(filepathSrc);
      const isTargetExists = fs.existsSync(filepathTarget);

      if (stat.isDirectory()) { // if directory
         if (isTargetExists) {
            await ask(genWarn(['Target directory exists',  'Replace? (yes|no|y|n): '], filepathTargetRel),
            () => {
               fs.rmSync(filepathTarget, {recursive: true});
               fs.mkdirSync(filepathTarget);
            },
            () => logInfo('Replacement skipped. Walking deeper...'));
         } else {
            fs.mkdirSync(filepathTarget);
         }

         await instantiate.bind(this)(filepathSrc, filepathTarget);
      }
      else { // is file
         let isRewriteAllowed = true;
         
         if (isTargetExists) {
            await ask(genWarn(['Target file exists', 'Rewrite? (yes|no|y|n): '], filepathTargetRel),
            () => { isRewriteAllowed = true },
            () => { isRewriteAllowed = false;
               logInfo('Rewriting skipped...');
            });
         }

         if (isRewriteAllowed) {
            let content;
            
            content = fs.readFileSync(filepathSrc).toString();
            content = insertData(content, this);
            
            fs.writeFileSync(filepathTarget, content);
         }
      }
   }
}


if (!fs.existsSync(TPL_FOLDER)) {
   fs.mkdirSync(TPL_FOLDER, {recursive: true});
}

yargs(hideBin(process.argv))

   .command('list', 'Show all available templates', yargs => yargs,
      (argv) => runList(argv, config))

   .command('new <templateName> <folderName>', 'Creates directory with template contents', yargs => yargs
      .positional('templateName', {
         describe: `Name of template folder from "${TPL_FOLDER}"`
      })
      .positional('folderName', {
         describe: 'Name of folder to be created'
      }),
      (argv) => runNew(argv, config))

   .command('def <name> <files..>', 'Creates new template from given files', yargs => yargs
      .positional('name', {
         describe: `Name in pascal case to be replaced in given files in all available DTL cases`
      })
      .positional('files', {
         describe: 'Files to be added to template, usually you will add a single folder. All given files will be placed into template root.'
      }),

      async argv => {
         logOk(`\nSuccessfully!\n`);
         
         const cwd = process.cwd();
         const files = argv.files.map(file => ({
            absPath: path.join(cwd, file),
            basename: path.basename(path.join(cwd, file)),
         }));
         const name = argv.name;
         
         const dump = d => console.log(...(Object.entries(d).map(([n, v], i, arr) => [i !== 0 ? '\n' : '', `• ${n} =`, v])).reduce((p, c) => p.concat(c)));
         dump({name, files});
         
         process.exit();
      })

   .parse();
