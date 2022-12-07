import process from 'process';
import path from 'path';
import fs from 'fs';

import { logInfo, genWarn, logOk } from "../utils/logger.mjs";
import { ask } from '../utils/prompt.mjs';
import templateApi from '../utils/template-api.mjs';

export default async function (argv, config) {
    const { TPL_FOLDER } = config;
    const template = templateApi(config);

    if (argv.files.length === 0) {
        argv.files.push(argv.name);
    }

    const name = argv.name;
    const templateName = argv.templateName;
    const files = argv.files;

    const templatePath = path.join(TPL_FOLDER, templateName);
    const isTemplateExists = fs.existsSync(templatePath);

    if (isTemplateExists) {
        await ask(genWarn(['Target template exists', 'Replace? (yes|no|y|n): '], templatePath),
            () => {
                fs.rmSync(templatePath, { recursive: true });
                fs.mkdirSync(templatePath);
            },
            () => logInfo('Template definition aborted...'));
    } else {
        fs.mkdirSync(templatePath);
    }

    template.createFrom(name, files, templateName);
    
    logOk(`\nSuccessfully!\n`);

    process.exit();
};