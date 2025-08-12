import process from "process";
import path from "path";

import { ERROR } from "../utils/errors.mjs";
import { logError, logOk } from "../utils/logger.mjs";

import templateApi from "../utils/template-api.mjs";

export default async function (argv, config) {
	const template = templateApi(config);

	try {
		template.checkExists(argv.templateName);
        
		let Name = argv.name;
        let cwdAddon = argv.targetFolderPath || '';

		const isNamePathLike = Name.includes(path.sep);

		if (isNamePathLike) {
			if (argv.targetFolderPath) {
				logError(`You cannot combine path-like name \`${Name}\` with targetFolderPath argument \`${cwdAddon}\`. If you still want to use targetFolderPath, insure that <name> param do not have path separators.`);
                throw new Error(ERROR.COMBINE_PATH_NAME_PATH_ARG);
            }

            cwdAddon = path.dirname(Name);
            Name = path.basename(Name);
		}

		await template.instantiate.bind(Name)(
            template.getPath(argv.templateName), 
            path.join(process.cwd(), cwdAddon)
        );

		logOk(`\nSuccessfully!\n`);
	} catch (err) {
		if (!ERROR.matchAny(err.message)) throw err;
		console.log();
	}

	process.exit();
}
