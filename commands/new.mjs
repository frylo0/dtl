import process from 'process';
import path from 'path';

import { ERROR } from "../utils/errors.mjs";
import { logOk } from "../utils/logger.mjs";
import templateApi from "../utils/template-api.mjs";

export default async function (argv, config) {
    const template = templateApi(config);

    try {
        template.checkExists(argv.templateName);

        const distPathRel = argv.folderName;
        const Name = path.basename(distPathRel);
        const cwdAddon = path.dirname(distPathRel);

        await template.instantiate.bind(Name)(
            template.getPath(argv.templateName),
            path.join(process.cwd(), cwdAddon),
        );

        logOk(`\nSuccessfully!\n`);
    } catch (err) {
        if (!ERROR.matchAny(err.message))
            throw err;
        console.log();
    }

    process.exit();
};