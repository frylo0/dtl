import fs from 'fs';
import process from 'process';

export default async function (argv, { TPL_FOLDER }) {
    const templates = fs.readdirSync(TPL_FOLDER);
    
    if (templates.length === 0) {
        console.log('');
        console.log('No templates created yet...');
    } else {
        console.log('');
        for (const name of templates)
            console.log(`- ${name}`);
    }

    process.exit();
}