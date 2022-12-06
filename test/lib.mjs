import meta from "../utils/meta.mjs";
const { __dirname } = meta(import.meta.url);
import { jest } from '@jest/globals';
import path from 'path';

export function mockTemplateFolder(relativeFolderPath) {
    jest.unstable_mockModule('../dtl.mjs', () => ({
        TPL_FOLDER: path.resolve(__dirname, relativeFolderPath),
    }));
}