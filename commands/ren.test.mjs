import { jest } from '@jest/globals';
import { createTestingFolderScope, expectedFolderMatch, mockConsoleLog, mockProcessCwd, mockProcessExit } from '../test/lib.mjs';

import $ren from './ren.mjs';

const { folder, clearFolder, copyFolder } = createTestingFolderScope('./ren');
const config = {
    TPL_FOLDER: folder('./templates'),
};

describe('"Ren" command', () => { 
    let stdout;

    beforeEach(() => {
        clearFolder('./templates');
        clearFolder('./dist');
        copyFolder('./src', './dist');
        mockProcessExit();
        stdout = mockConsoleLog();
    });

    test('should rename entity recursively', async () => {
        mockProcessCwd(folder('./dist'));
        $ren({ name: 'SomeName', newName: 'OtherName', files: [] }, { ...config });
        expectedFolderMatch(folder('./dist/OtherName'), folder('./expected/OtherName'));
    });

    test('should rename entity from higher folder', async () => {
        mockProcessCwd(folder('./'));
        $ren({ name: 'SomeName', newName: 'OtherName', files: ['./dist/SomeName'] }, { ...config });
        expectedFolderMatch(folder('./dist/OtherName'), folder('./expected/OtherName'));
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});