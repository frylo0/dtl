import { ERROR } from "./errors.mjs";
import fs from 'fs';
import path from 'path';


export function kebabcase(str) {
    return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}

export function camelcase(str) {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
}

export function lowercase(name) {
    return name.toLowerCase();
}

export function uppercase(name) {
    return name.toUpperCase();
}


export function insertData(fileContent, name, templateApi) {
    let now = new Date();

    let year = now.getFullYear() + '';
    let month = (now.getMonth() < 10 ? '0' : '') + (now.getMonth() + 1);
    let day = (now.getDate() < 10 ? '0' : '') + now.getDate();

    return fileContent
        .replace(/([ \t]*?)-- From (.*?): Use (.*?); --/g, (...match) => {
            const [fulltext, indent, templateName, filePath] = match;

            templateApi.checkExists(templateName, `-- From ${templateName}: Use ${filePath}; --`);

            const templateDir = templateApi.getPath(templateName);
            const filePathAbs = path.join(templateDir, filePath);

            if (!fs.existsSync(filePathAbs)) {
                logError(
                    `Can not use file that not exist`,
                    filePathAbs, fulltext.trim());

                throw new Error(ERROR.USING_NOT_EXISTING);
            }
            else if (fs.statSync(filePathAbs).isDirectory()) {
                logError(
                    `Can not use directory`,
                    filePathAbs, fulltext.trim());

                throw new Error(ERROR.USING_DIRECTORY);
            }

            else {
                let content = fs.readFileSync(filePathAbs).toString();

                content = content
                    .split('\n')
                    .map(line => indent + line)
                    .join('\n'); // indent all lines

                return insertData(content, name, templateApi);
            }
        })

        .replace(/--Name--/g, name)
        .replace(/--name--/g, lowercase(name))
        .replace(/--naMe--/g, camelcase(name))
        .replace(/--NAME--/g, uppercase(name))
        .replace(/--na-me--/g, kebabcase(name))

        .replace(/--DateTime--/g, `${year}-${month}-${day}, ${now.toLocaleTimeString()}`);
}