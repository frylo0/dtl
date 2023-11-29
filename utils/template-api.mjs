import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import { insertData, templateFromString } from './syntax.mjs';
import { genWarn, logError, logInfo } from './logger.mjs';
import { relatizePath } from "./path.mjs";
import { ask } from './prompt.mjs';
import { ERROR } from './errors.mjs';

export default function (config) {
	const { TPL_FOLDER } = config;

	/** Check if template exists in TPL_FOLDER */
	function checkExists(templateName, checkContext = '') {
		const targetTplFolder = getPath(templateName);
		const isExist = fs.existsSync(targetTplFolder);

		if (!isExist) {
			logError(
				`Template "${chalk.blue(templateName)}" doesn't exist`,
				targetTplFolder, checkContext);

			throw new Error(ERROR.TPL_NOT_EXIST);
		}
	}

	/** Join template name with TPL_FOLDER and return abs path */
	function getPath(templateName) {
		return path.join(TPL_FOLDER, templateName);
	}

	/**
	 * Recursively create files by given template path in target folder.
	 * @param {string} dirpathSrc Absolute path to template directory.
	 * @param {string} dirpathTarget Relative path to target dir in current base directory.
	 * @this {string} Base directory for relative dirpathTarget path. Usually `process.cwd()`.
	 */
	async function instantiate(dirpathSrc, dirpathTarget) {
		dirpathTarget = insertData(dirpathTarget, this, api);

		// For each file in current folder
		for (let filename of fs.readdirSync(dirpathSrc)) {
			if (filename === '.' || filename == '..') // Skip relative dirs
				continue;

			const filepathSrc = path.join(dirpathSrc, filename);
			const filepathTarget = path.join(dirpathTarget, insertData(filename, this, api));
			const filepathTargetRel = `./${relatizePath(filepathTarget)}`;

			const stat = fs.statSync(filepathSrc);
			const isTargetExists = fs.existsSync(filepathTarget);

			if (stat.isDirectory()) { // if directory
				if (isTargetExists) {
					await ask(genWarn(['Target directory exists', 'Replace? (yes|no|y|n): '], filepathTargetRel),
						() => {
							fs.rmSync(filepathTarget, { recursive: true });
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
						() => { isRewriteAllowed = true; },
						() => {
							isRewriteAllowed = false;
							logInfo('Rewriting skipped...');
						});
				}

				if (isRewriteAllowed) {
					let content;

					content = fs.readFileSync(filepathSrc).toString();
					content = insertData(content, this, api);

					fs.writeFileSync(filepathTarget, content);
				}
			}
		}
	}

	/**
	 * Creates template in TPL_FOLDER by given name to replace in files and files to be base of template
	 * @param {string} nameToBeReplaced 
	 * @param {string[]} filesRelList
	 * @param {string} templateName
	 */
	function createFrom(nameToBeReplaced, filesRelList, templateName) {
		const templatePath = path.join(TPL_FOLDER, templateName);

		/**
		 * @type {{
		 *   relPath: string,
		 *   absPath: string,
		 *   basename: string,
		 *   pathInTemplate: string,
		 * }[]}
		 */
		const files = filesRelList.map(file => ({
			relPath: file,
			absPath: path.join(process.cwd(), file),
			basename: path.basename(path.join(process.cwd(), file)),
			pathInTemplate: path.join(templatePath, templateFromString(file, nameToBeReplaced)),
		}));

		for (const file of files) {
			const stat = fs.statSync(file.absPath);

			if (stat.isDirectory()) { // is dir
				fs.mkdirSync(file.pathInTemplate);

				const subFiles = fs.readdirSync(file.absPath).map(subFile => path.join(file.relPath, subFile));
				createFrom(nameToBeReplaced, subFiles, templateName);
			} else { // is file
				let content = fs.readFileSync(file.absPath).toString();
				content = templateFromString(content, nameToBeReplaced);

				fs.writeFileSync(file.pathInTemplate, content);
			}
		}
	}


	/**
	 * Renames entity in-place by given old-name and new-name
	 * @param {string} nameToBeReplaced 
	 * @param {string} nameToBeInserted
	 * @param {string[]} filesRelList
	 */
	function rename(nameToBeReplaced, nameToBeInserted, filesRelList) {
		const files = filesRelList.map(file => {
			const newRelPath = insertData( // Replacing tmp template name to real new one
				templateFromString(file, nameToBeReplaced), // Creating tmp template name
				nameToBeInserted,
				api
			);

			return {
				relPath: file,
				absPath: path.join(process.cwd(), file),

				basename: path.basename(path.join(process.cwd(), file)),

				newRelPath: newRelPath,
				newAbsPath: path.join(process.cwd(), newRelPath)
			};
		});

		for (const file of files) {
			const stat = fs.statSync(file.absPath);

			fs.renameSync(file.absPath, file.newAbsPath);

			if (stat.isDirectory()) { // is dir
				const subFiles = fs.readdirSync(file.newAbsPath).map(subFile => path.join(file.newRelPath, subFile));
				rename(nameToBeReplaced, nameToBeInserted, subFiles);
			} else { // is file
				let content = fs.readFileSync(file.newAbsPath).toString();
				content = insertData(
					templateFromString(content, nameToBeReplaced), 
					nameToBeInserted,
					api
				);

				fs.writeFileSync(file.newAbsPath, content);
			}
		}
	}

	const api = {
		checkExists,
		getPath,
		instantiate,
		createFrom,
		rename,
	};

	return api;
}