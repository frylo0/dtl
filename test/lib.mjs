import { jest } from '@jest/globals';

import meta from "../utils/meta.mjs";
import fs from 'fs';
import path from 'path';
import process from "process";

const { __dirname } = meta(import.meta.url);


export function mockProcessExit() {
    return jest.spyOn(process, 'exit').mockImplementation(() => {});
}

export function mockProcessCwd(cwdPath) {
    return jest.spyOn(process, 'cwd').mockReturnValue(cwdPath);
}

export function mockConsoleLog() {
    const stdout = [];

    jest.spyOn(console, 'log').mockImplementation((...messages) => {
        stdout.push(messages.join(' '));                
    });
    
    return stdout;
}

export function createTestingFolderScope(pathToFolder) {
    const api = {
        folder: (pathToLocalFolder) => {
            return path.resolve(__dirname, pathToFolder, pathToLocalFolder);
        },
        clearFolder: (pathToLocalFolder) => {
            fs.rmSync(api.folder(pathToLocalFolder), { recursive: true, force: true });
            fs.mkdirSync(api.folder(pathToLocalFolder));
        },
        createFolder: (pathToLocalFolder) => {
            fs.mkdirSync(api.folder(pathToLocalFolder), { recursive: true });
        },
        copyFolder: (oldPathToLocalFolder, newPathToLocalFolder) => {
            fs.cpSync(
                api.folder(oldPathToLocalFolder), 
                api.folder(newPathToLocalFolder),
                { recursive: true }
            );
        },
    };

    return api;
}

export function expectedFolderMatch(realFolder, expectedFolder) {
    expect(fs.existsSync(realFolder)).toBe(true);
    expect(fs.existsSync(expectedFolder)).toBe(true);
    
    const realFiles = fs.readdirSync(realFolder);
    const expectedFiles = fs.readdirSync(realFolder);
    
    expect(realFiles).toEqual(expectedFiles);
    
    for (const expectedFile of expectedFiles) {
        const expectedFilePath = path.join(expectedFolder, expectedFile);
        const realFilePath = path.join(realFolder, expectedFile);
        
        const expectedStat = fs.statSync(expectedFilePath);
        const realStat = fs.statSync(expectedFilePath);
        
        expect(realStat.isDirectory()).toBe(expectedStat.isDirectory());

        if (expectedStat.isDirectory()) { // is dir
            expectedFolderMatch(realFilePath, expectedFilePath);
        } else { // is file
            const realFileContent = fs.readFileSync(realFilePath).toString();
            const expectedFileContent = fs.readFileSync(expectedFilePath).toString();

            expect(realFileContent).toBe(expectedFileContent);
        }
    }
}