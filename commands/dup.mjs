import process from 'process';

import { logOk } from "../utils/logger.mjs";
import templateApi from '../utils/template-api.mjs';

export default async function (argv, config) {
    const template = templateApi(config);

    if (argv.files.length === 0) {
        argv.files.push(argv.name);
    }

    const name = argv.name;
    const newName = argv.newName;
    const files = argv.files;

    template.duplicate(name, newName, files);
    
    logOk(`\nSuccessfully!\n`);

    process.exit();
};