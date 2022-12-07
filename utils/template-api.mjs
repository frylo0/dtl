import fs from 'fs';
import path from 'path';
import { genWarn, logError, logInfo } from './logger.mjs';
import { relatizePath } from "./path.mjs";
import { ask } from './prompt.mjs';
import { insertData } from './syntax.mjs';

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

	const api = {
		checkExists,
		getPath,
		instantiate,
	};

	return api;
}