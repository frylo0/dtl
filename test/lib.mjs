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
