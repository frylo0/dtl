import { jest } from '@jest/globals';

import meta from "../utils/meta.mjs";
import path from 'path';
import process from "process";

const { __dirname } = meta(import.meta.url);


export function mockProcessExit() {
    return jest.spyOn(process, 'exit').mockImplementation(() => {});
}

export function mockConsoleLog() {
    const stdout = [];

    jest.spyOn(console, 'log').mockImplementation((...messages) => {
        stdout.push(messages.join(' '));                
    });
    
    return stdout;
}

export function createTestingFolderScope(pathToFolder) {
    return (pathToLocalFolder) => {
        return path.resolve(__dirname, pathToFolder, pathToLocalFolder);
    };
}


// May be useful

export function mockTemplateFolder(relativeFolderPath) {
    const TPL_FOLDER = {
        fn: jest.fn(),
        set(relativePath) {
            this.fn.mockReturnValue(relativePath);
        },
    }
    
    TPL_FOLDER.set(relativeFolderPath);

    jest.unstable_mockModule('../dtl.mjs', () => ({
        get TPL_FOLDER() {
            return path.resolve(__dirname, TPL_FOLDER.fn());
        },
    }));
    
    return TPL_FOLDER;
}

export async function importDefault(modulePath) {
    const module = await import(path.join('../commands', modulePath));
    return module.default;
}