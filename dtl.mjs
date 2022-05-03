/** 
 * @package Directory TempLate creator
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
 */
   

import { ask } from './prompt.mjs';
import { genWarn, logError, logInfo, logOk } from './logger.mjs';
import { ERROR } from './errors.mjs';

import fs from 'fs';
import os from 'os';
import path from 'path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import chalk from 'chalk'


const TPL_FOLDER_NAME = 'DirectoryTemplates';
const TPL_FOLDER = path.join(os.homedir(), TPL_FOLDER_NAME);


function kebabize(str) {
   return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}

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
   let month = (now.getMonth() < 10 ? '0' : '') + now.getMonth();
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
      .replace(/--name--/g, name.toLowerCase())
      .replace(/--NAME--/g, name.toUpperCase())
      .replace(/--na-me--/g, kebabize(name))
      
      .replace(/--DateTime--/g, `${year}-${month}-${day}, ${now.toLocaleTimeString()}`);
}

async function instantiate(dirpathSrc, dirpathTarget) {
   dirpathTarget = insertData(dirpathTarget, this)
   
   for (let filename of fs.readdirSync(dirpathSrc)) {
      if (filename === '.' || filename == '..')
         continue;

      const filepathSrc = path.join(dirpathSrc, filename);
      const filepathTarget = path.join(dirpathTarget, insertData(filename, this));
      const filepathTargetRel = `./${relatizePath(filepathTarget)}`;

      const stat = fs.statSync(filepathSrc);
      const isExists = fs.existsSync(filepathTarget);

      if (stat.isDirectory()) {
         if (isExists) {
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
         
         if (isExists) {
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

   .command('new [templateName] [folderName]', 'creates directory with template contents', 
      yargs => yargs
      
      .positional('templateName', {
         describe: `name of template folder from "${TPL_FOLDER}"`
      }).demandOption('templateName')
      .positional('folderName', {
         describe: 'name of folder to be created'
      }) .demandOption('folderName'),

      async argv => {
         try {
            checkTemplateExists(argv.templateName);

            await instantiate.bind(argv.folderName)(
               getTemplatePath(argv.templateName), 
               process.cwd()
            );

            logOk(`\nSuccessfully!\n`);
         } catch (err) {
            if (!ERROR.matchAny(err.message))
               throw err;
            console.log();
         }
         
         process.exit();
      })

   .parse();
