/** 
 * @package Directory TempLate creator
 */

/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
*/
   
import { prompt } from './prompt.mjs';

import fs from 'fs';
import os from 'os';
import path from 'path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import chalk from 'chalk'


const TPL_FOLDER_NAME = 'DirectoryTemplates';


const ERROR = {
   TPL_NOT_EXIST: 'tpl-not-exist',
   USING_NOT_EXISTING: 'using-not-existing',
   USING_DIRECTORY: 'using-directory',
};
Object.defineProperties(ERROR, {
   matchAny: {
      enumerable: false,
      value: (string) => {
         for (let prop in ERROR) {
            if (string === ERROR[prop])
               return true;
         }
         return false;
      }
   }
});

const TPL_FOLDER = path.join(os.homedir(), TPL_FOLDER_NAME);

function kebabize(str) {
   return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}

function relatizePath(filenameAbs) {
   return path.relative(process.cwd(), filenameAbs);
}

function checkTemplateExists(templateName, checkContext = '') {
   const TARGET_TPL_FOLDER = getTemplatePath(templateName);

   if (!fs.existsSync(TARGET_TPL_FOLDER)) {
      console.log(
         `${chalk.red('\nError: ')}Template "${chalk.blue(templateName)}" doesn't exist, ${chalk.grey(TARGET_TPL_FOLDER)}` + 
         (checkContext !== '' ? ('\n' + chalk.red('Context: ' + checkContext)) : '')
      );
      return false;
   } else
      return true;
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

         if (!checkTemplateExists(templateName, `-- From ${templateName}: Use ${filePath}; --`))
            throw new Error(ERROR.TPL_NOT_EXIST);
         
         const templateDir = getTemplatePath(templateName);
         const filePathAbs = path.join(templateDir, filePath);

         if (!fs.existsSync(filePathAbs)) {
            console.log(
               chalk.red('\nError: ') + 'Can not use file that not exist - ' + chalk.grey(filePathAbs) +
               '\n' + chalk.red('Context: ' + fulltext.trim())
            );
            throw new Error(ERROR.USING_NOT_EXISTING);
         } else if (fs.statSync(filePathAbs).isDirectory()) {
            console.log(
               chalk.red('\nError: ') + 'Can not use directory - ' + chalk.grey(filePathAbs) +
               '\n' + chalk.red('Context: ' + fulltext.trim())
            );
            throw new Error(ERROR.USING_DIRECTORY);
         }
         else {
            let content = fs.readFileSync(filePathAbs).toString();
            content = content.split('\n').map(line => indent + line).join('\n'); // indent all lines
            content = insertData(content, name);
            return content;
         }
      })

      .replace(/--Name--/g, name)
      .replace(/--name--/g, name.toLowerCase())
      .replace(/--NAME--/g, name.toUpperCase())
      .replace(/--na-me--/g, kebabize(name))
      
      .replace(/--DateTime--/g, `${year}-${month}-${day}, ${now.toLocaleTimeString()}`);
}

async function instantiate(dirpathSrc, dirpathTarget) {
   try {
      dirpathTarget = insertData(dirpathTarget, this)
   } catch (err) {
      if (ERROR.matchAny(err.message))
         return;
      else throw err;
   }
   
   for (let filename of fs.readdirSync(dirpathSrc)) {
      if (filename === '.' || filename == '..')
         continue;

      const filepathSrc = path.join(dirpathSrc, filename);

      let filepathTarget;
      try {
         filepathTarget = path.join(dirpathTarget, insertData(filename, this));
      } catch (err) {
         if (ERROR.matchAny(err.message))
            return;
         else throw err;
      }

      const stat = fs.statSync(filepathSrc);
      const isExists = fs.existsSync(filepathTarget);

      if (stat.isDirectory()) {
         if (isExists) {
            let response = await prompt(
               chalk.yellow('\nWarn: ') + 'Target directory exists - ' + chalk.grey('./' + relatizePath(filepathTarget)) + 
               '\n      Replace? (yes|no|y|n): ');
            if (/y(es)?/i.test(response)) {
               fs.rmSync(filepathTarget, {recursive: true});
               fs.mkdirSync(filepathTarget);
            }
            else {
               console.log(chalk.grey('Replacement skipped. Walking deeper...'));
            }
         } else {
            fs.mkdirSync(filepathTarget);
         }

         await instantiate.bind(this)(filepathSrc, filepathTarget);
      }
      else { // is file
         let isRewriteAllowed = true;
         
         if (isExists) {
            let response = await prompt(
               chalk.yellow('\nWarn: ') + 'Target file exists - ' + chalk.grey('./' + relatizePath(filepathTarget)) + 
               '\n      Rewrite? (yes|no|y|n): ');
            if (/y(es)?/i.test(response))
               isRewriteAllowed = true;
            else {
               isRewriteAllowed = false;
               console.log(chalk.grey('Rewriting skipped...'));
            }
         }

         if (isRewriteAllowed) {
            let content = fs.readFileSync(filepathSrc).toString();
            try {
               content = insertData(content, this);
            } catch (err) {
               if (ERROR.matchAny(err.message))
                  return;
               else throw err;
            }
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
         .positional('templateName', {describe: `name of template folder from "${TPL_FOLDER}"`})
         .demandOption('templateName')
         .positional('folderName', {describe: 'name of folder to be created'})
         .demandOption('folderName'),
      async argv => {
         if (!checkTemplateExists(argv.templateName))
            return;

         await instantiate.bind(argv.folderName)(
            getTemplatePath(argv.templateName), 
            process.cwd()
         );
         
         console.log(
            chalk.green(`\nSuccessfully!\n`)
         );
         process.exit();
      })

   .parse();
