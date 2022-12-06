import path from 'path';
import url from 'url';

export default function (importMetaUrl) {
    const __filename = url.fileURLToPath(importMetaUrl);
    const __dirname = path.dirname(__filename);
    
    return {
        __dirname,
        __filename,
    };
}
