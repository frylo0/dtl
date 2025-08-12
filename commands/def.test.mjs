import { jest } from '@jest/globals';
import { createTestingFolderScope, expectedFolderMatch, mockConsoleLog, mockProcessCwd, mockProcessExit } from '../test/lib.mjs';

import $def from './def.mjs';
import $new from './new.mjs';

const { folder, clearFolder } = createTestingFolderScope('./def');
const config = {
    TPL_FOLDER: folder('./templates'),
};

describe('"Def" command', () => { 
    let stdout;

    beforeEach(() => {
        clearFolder('./templates');
        clearFolder('./dist');
        mockProcessExit();
        stdout = mockConsoleLog();
    });

    test('should create valid template', async () => {
        mockProcessCwd(folder('./src'));
        $def({ templateName: 'ReactComponent', name: 'SomeName', files: [] }, { ...config });
        expectedFolderMatch(folder('./templates/ReactComponent'), folder('./expected/templates/ReactComponent'));

        mockProcessCwd(folder('./dist'));
        $new({ templateName: 'ReactComponent', name: 'OtherName' }, config);
        expectedFolderMatch(folder('./dist/OtherName'), folder('./expected/dist/OtherName'));
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});