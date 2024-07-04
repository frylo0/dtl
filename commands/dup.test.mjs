import { jest } from '@jest/globals';
import { createTestingFolderScope, expectedFolderMatch, mockConsoleLog, mockProcessCwd, mockProcessExit } from '../test/lib.mjs';
import fs from 'fs';

import $dup from './dup.mjs';

const { folder, clearFolder, copyFolder } = createTestingFolderScope('./dup');
const config = {
    TPL_FOLDER: folder('./templates'),
};

describe('"Dup" command', () => { 
    let stdout;

    beforeEach(() => {
        clearFolder('./templates');
        clearFolder('./dist');
        copyFolder('./src', './dist');
        mockProcessExit();
        stdout = mockConsoleLog();
    });

    test('should duplicate entity recursively', async () => {
        mockProcessCwd(folder('./dist'));
        $dup({ name: 'SomeName', newName: 'OtherName', files: [] }, { ...config });
        expectedFolderMatch(folder('./dist/SomeName'), folder('./src/SomeName'));
        expectedFolderMatch(folder('./dist/OtherName'), folder('./expected/OtherName'));
    });

    test('should duplicate entity from higher folder', async () => {
        mockProcessCwd(folder('./'));
        $dup({ name: 'SomeName', newName: 'OtherName', files: ['./dist/SomeName'] }, { ...config });
        expectedFolderMatch(folder('./dist/SomeName'), folder('./src/SomeName'));
        expectedFolderMatch(folder('./dist/OtherName'), folder('./expected/OtherName'));
    });

    test('should duplicate multiple ordinary files', async () => {
        mockProcessCwd(folder('./dist/SomeName'));
        $dup({ name: 'SomeName', newName: 'MultipleFiles', files: ['./SomeName.tsx', './SomeName.module.scss'] }, { ...config });
        fs.renameSync(folder('./dist/SomeName'), folder('./dist/MultipleFiles'));
        expectedFolderMatch(folder('./dist/MultipleFiles'), folder('./expected/MultipleFiles'));
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});