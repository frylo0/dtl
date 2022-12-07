import process from 'process';

import { ERROR } from "../utils/errors.mjs";
import { logOk } from "../utils/logger.mjs";
import templateApi from "../utils/template-api.mjs";

export default async function (argv, config) {
    const template = templateApi(config);

    try {
        template.checkExists(argv.templateName);

        await template.instantiate.bind(argv.folderName)(
            template.getPath(argv.templateName),
            process.cwd()
        );

        logOk(`\nSuccessfully!\n`);
    } catch (err) {
        if (!ERROR.matchAny(err.message))
            throw err;
        console.log();
    }

    process.exit();
};