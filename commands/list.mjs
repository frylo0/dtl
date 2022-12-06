import fs from 'fs';
import process from 'process';

import { TPL_FOLDER } from '../dtl.mjs';


export default async function (argv) {
    const templates = fs.readdirSync(TPL_FOLDER);

    console.log('');
    for (const name of templates)
        console.log(`- ${name}`);

    process.exit();
}