import { jest } from '@jest/globals';
import { createTestingFolderScope, mockConsoleLog, mockProcessExit } from '../test/lib.mjs';

import $list from './list.mjs';

const { folder } = createTestingFolderScope('./list');

describe('"List" command', () => { 
    let stdout;

    beforeEach(() => {
        mockProcessExit();
        stdout = mockConsoleLog();
    });

    test('should show list of templates', async () => {
        $list({}, { TPL_FOLDER: folder('./templates_three') });

        expect(stdout).toEqual([
            '',
            '- Template1', 
            '- Template2', 
            '- Template3'
        ]);
    });

    test('should print no templates if folder is free', async () => {
        $list({}, { TPL_FOLDER: folder('./templates_none') });

        expect(stdout).toEqual([
            '',
            'No templates created yet...', 
        ]);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});