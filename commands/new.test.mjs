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
        $new({ templateName: 'ReactComponent', name: 'SomeName' }, { ...config });

        expectedFolderMatch(folder('./dist/SomeName'), folder('./expected/SomeName'));
    });

    test('should create files when <name> is path', async () => {
        createFolder('./dist/we/are/going/deeper');

        $new({ templateName: 'ReactComponent', name: './we/are/going/deeper/SomeName' }, { ...config });

        expectedFolderMatch(folder('./dist/we/are/going/deeper/SomeName'), folder('./expected/deep-case/SomeName'));
    });

    test('should process error on path-like name and targetFolderPath', async () => {
        createFolder('./dist/we/are/going/deeper');

        let failed = false;

        try {
            $new({ templateName: 'ReactComponent', targetFolderPath: './we/are/going', name: './deeper/SomeName' }, { ...config });
        } catch (error) {
            failed = true;
        }

        expect(failed).toBe(false);
    });

    test('should generate instance without folders in template', async () => {
        $new({ templateName: 'NoFolderRFC', name: 'SomeName' }, { ...config });

        expectedFolderMatch(folder('./dist'), folder('./expected/NoFolderCase'));
    });

    test('should accept targetFolderPath param', async () => {
        createFolder('./dist/we/are/going/deeper');

        $new({ templateName: 'NoFolderRFC', name: 'SomeName', targetFolderPath: './we/are/going/deeper' }, { ...config });

        expectedFolderMatch(folder('./dist/we/are/going/deeper'), folder('./expected/NoFolderCase'));
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});