import { jest } from '@jest/globals';
import { createTestingFolderScope, expectedFolderMatch, mockConsoleLog, mockProcessCwd, mockProcessExit } from '../test/lib.mjs';

import $new from './new.mjs';

const { folder, clearFolder, createFolder } = createTestingFolderScope('./new');
const config = {
    TPL_FOLDER: folder('./templates'),
};

describe('"New" command', () => { 
    let stdout;

    beforeEach(() => {
        clearFolder('./dist');
        mockProcessExit();
        mockProcessCwd(folder('./dist'));
        stdout = mockConsoleLog();
    });

    test('should create files by template', async () => {
        $new({ templateName: 'ReactComponent', folderName: 'SomeName' }, { ...config });

        expectedFolderMatch(folder('./dist/SomeName'), folder('./expected/SomeName'));
    });

    test('should create files when folderName is deep', async () => {
        createFolder('./dist/we/are/going/deeper');

        $new({ templateName: 'ReactComponent', folderName: './we/are/going/deeper/SomeName' }, { ...config });

        expectedFolderMatch(folder('./dist/we/are/going/deeper/SomeName'), folder('./expected/deep-case/SomeName'));
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});