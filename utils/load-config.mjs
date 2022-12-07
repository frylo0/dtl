import fs from 'fs';
import os from 'os';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { logError } from './logger.mjs';

    
const defaultConfigLocation = path.join(__dirname, '..', 'dtl.config.json');

export function loadConfig(configLocation = defaultConfigLocation) {
    let config;
    
    try {
        config = JSON.parse(fs.readFileSync(configLocation).toString());
    } catch (err) {
        logError(
            `Invalid config file: ${err.message}`,
            path.resolve('./dtl.config.json')
        );
        process.exit();
    }
    
    let variables = {
        TPL_FOLDER: config["Templates location"].replace(/^~/, os.homedir()),
    };

    return variables;
}